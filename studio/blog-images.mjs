import { access, copyFile, mkdir, readFile, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { validateSavedPost } from '../src/lib/blog-schema.mjs'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(projectRoot, 'content', 'blog-images')
const outputDir = path.join(projectRoot, 'public', 'images', 'blog')

export async function syncImageReferences(body) {
  const names = [...new Set([...body.matchAll(/\/images\/blog\/([a-f0-9-]{36}\.webp)/g)].map((match) => match[1]))]
  if (!names.length) return names
  await mkdir(outputDir, { recursive: true })
  for (const name of names) {
    const destination = path.join(outputDir, name)
    try {
      await copyFile(path.join(sourceDir, name), destination)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      try { await access(destination) }
      catch { throw new Error(`Article image ${name} is missing.`) }
    }
  }
  return names
}

async function syncPublishedImages() {
  const postsDir = path.join(projectRoot, 'content', 'blog')
  const names = (await readdir(postsDir)).filter((name) => name.endsWith('.json'))
  const referenced = new Set()
  for (const name of names) {
    let post
    try {
      post = validateSavedPost(JSON.parse(await readFile(path.join(postsDir, name), 'utf8')), name.slice(0, -5))
    } catch (error) {
      throw new Error(`Invalid blog post ${name}: ${error.message}`, { cause: error })
    }
    if (post.status === 'published') {
      for (const image of await syncImageReferences(post.body)) referenced.add(image)
    }
  }
  for (const name of await readdir(outputDir).catch((error) => error.code === 'ENOENT' ? [] : Promise.reject(error))) {
    if (/^[a-f0-9-]{36}\.webp$/.test(name) && !referenced.has(name)) await unlink(path.join(outputDir, name))
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await syncPublishedImages()
}
