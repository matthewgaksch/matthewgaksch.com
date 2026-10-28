/* global process, Buffer, URL, console */
import { createServer } from 'node:http'
import { readFile, readdir, mkdir, rename, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderMarkdown } from '../src/lib/render-markdown.mjs'
import sharp from 'sharp'
import { syncImageReferences } from './blog-images.mjs'
import { validatePostInput, validateSavedPost } from '../src/lib/blog-schema.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = path.join(root, 'content', 'blog')
const imagesDir = path.join(root, 'content', 'blog-images')
const publicImagesDir = path.join(root, 'public', 'images', 'blog')
const port = Number(process.env.BLOG_EDITOR_PORT || 5174)
const origin = `http://127.0.0.1:${port}`
const maxBytes = 250_000
const maxImageBytes = 10_000_000

const json = (response, status, value) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  response.end(JSON.stringify(value))
}

async function readBody(request) {
  if (request.headers['content-type']?.split(';')[0] !== 'application/json') throw new Error('Expected JSON.')
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > maxBytes) throw new Error('Post is too large (250 KB maximum).')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

async function readImage(request) {
  let size = 0
  const chunks = []
  for await (const chunk of request) {
    size += chunk.length
    if (size > maxImageBytes) throw new Error('Image is too large (10 MB maximum).')
    chunks.push(chunk)
  }
  if (!size) throw new Error('Choose an image first.')
  return Buffer.concat(chunks)
}

async function saveImage(request) {
  const input = await readImage(request)
  const image = sharp(input, { limitInputPixels: 30_000_000, failOn: 'error' })
  const metadata = await image.metadata()
  if (!['jpeg', 'png', 'webp', 'heif', 'gif'].includes(metadata.format)) {
    throw new Error('Choose a JPEG, PNG, WebP, AVIF, HEIC, or GIF image.')
  }
  const output = await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer()
  await mkdir(imagesDir, { recursive: true })
  const name = `${randomUUID()}.webp`
  await writeFile(path.join(imagesDir, name), output, { flag: 'wx' })
  return { url: `/images/blog/${name}`, bytes: output.length }
}

async function listPosts() {
  await mkdir(postsDir, { recursive: true })
  const names = (await readdir(postsDir)).filter((name) => name.endsWith('.json'))
  const posts = await Promise.all(names.map(async (name) => validateSavedPost(JSON.parse(await readFile(path.join(postsDir, name), 'utf8')), name.slice(0, -5))))
  return posts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

async function savePost(input) {
  const post = validatePostInput(input)
  await mkdir(postsDir, { recursive: true })
  const file = path.join(postsDir, `${post.slug}.json`)
  let previous = null
  try { previous = validateSavedPost(JSON.parse(await readFile(file, 'utf8')), post.slug) } catch (error) { if (error.code !== 'ENOENT') throw error }
  if (previous && input.originalSlug !== post.slug) throw new Error('That URL slug is already used.')
  if (input.originalSlug && input.originalSlug !== post.slug) throw new Error('The URL slug cannot change after saving. Create a new post instead.')
  const today = new Date().toISOString().slice(0, 10)
  const saved = {
    ...post,
    publishedAt: post.status === 'published' ? previous?.publishedAt || today : null,
    updatedAt: new Date().toISOString(),
  }
  if (saved.status === 'published') await syncImageReferences(saved.body)
  const temporary = path.join(postsDir, `.${post.slug}-${randomUUID()}.tmp`)
  await writeFile(temporary, `${JSON.stringify(saved, null, 2)}\n`, { flag: 'wx' })
  await rename(temporary, file)
  return saved
}

const assets = {
  '/': ['studio/index.html', 'text/html; charset=utf-8'],
  '/editor.css': ['studio/editor.css', 'text/css; charset=utf-8'],
  '/editor.js': ['studio/editor.js', 'text/javascript; charset=utf-8'],
  '/fonts/geist.woff2': ['public/fonts/Geist-Variable.woff2', 'font/woff2'],
  '/fonts/geist-mono.woff2': ['public/fonts/GeistMono-Variable.woff2', 'font/woff2'],
}

createServer(async (request, response) => {
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Referrer-Policy', 'no-referrer')
  response.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
  try {
    if (request.headers.host !== `127.0.0.1:${port}`) return json(response, 403, { error: 'Local access only.' })
    const route = new URL(request.url, origin).pathname
    if (request.method === 'GET' && route === '/api/posts') return json(response, 200, await listPosts())
    if (request.method === 'POST' && route.startsWith('/api/')) {
      if (request.headers.origin !== origin || request.headers['x-blog-editor'] !== 'local') return json(response, 403, { error: 'Request rejected.' })
      if (route === '/api/images') return json(response, 200, await saveImage(request))
      const body = await readBody(request)
      if (route === '/api/preview') {
        if (typeof body.body !== 'string' || body.body.length > 200_000) throw new Error('Article text is too large.')
        return json(response, 200, { html: renderMarkdown(body.body) })
      }
      if (route === '/api/posts') return json(response, 200, await savePost(body))
    }
    if (request.method === 'GET' && /^\/images\/blog\/[a-f0-9-]{36}\.webp$/.test(route)) {
      const name = path.basename(route)
      let bytes
      try { bytes = await readFile(path.join(imagesDir, name)) }
      catch (error) {
        if (error.code !== 'ENOENT') throw error
        bytes = await readFile(path.join(publicImagesDir, name))
      }
      response.writeHead(200, { 'Content-Type': 'image/webp', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
      return response.end(bytes)
    }
    if (request.method === 'GET' && assets[route]) {
      const [file, type] = assets[route]
      response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
      return response.end(await readFile(path.join(root, file)))
    }
    json(response, 404, { error: 'Not found.' })
  } catch (error) {
    json(response, 400, { error: error.message || 'Could not complete the request.' })
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Blog editor: ${origin}`)
})
