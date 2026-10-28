import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import console from 'node:console'

export function contentSecurityPolicy(documents) {
  const hashes = new Set()
  for (const html of documents) {
    for (const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
      if (script[1]) hashes.add(`'sha256-${createHash('sha256').update(script[1]).digest('base64')}'`)
    }
  }
  const policy = [
    "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'",
    `script-src 'self' ${[...hashes].sort().join(' ')} https://static.cloudflareinsights.com`, "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: https:", "font-src 'self'",
    "connect-src 'self' https://github-contributions-api.jogruber.de",
    "form-action 'none'", "frame-src 'none'", "worker-src 'none'", 'upgrade-insecure-requests',
  ].join('; ')
  if (`  Content-Security-Policy: ${policy}`.length > 2000)
    throw new Error('CSP exceeds the Cloudflare header line limit; review per-route policies before publishing.')
  return policy
}

export async function exportFiles(root) {
  const paths = []
  async function visit(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = resolve(dir, entry.name)
      if (entry.isSymbolicLink()) throw new Error('Symlinks must not be deployed.')
      if (entry.isDirectory()) await visit(file)
      else paths.push(file)
    }
  }
  await visit(root)
  return paths.sort()
}

export async function writeSecurityHeaders(root = resolve('out')) {
  const files = await exportFiles(root)
  const documents = await Promise.all(files.filter(f => f.endsWith('.html')).map(f => readFile(f, 'utf8')))
  if (!documents.length) throw new Error('Build the static export before generating security headers.')
  const policy = contentSecurityPolicy(documents)
  const template = await readFile(resolve('public/_headers'), 'utf8')
  if (!template.includes('  Content-Security-Policy: ')) throw new Error('Missing CSP template.')
  const headers = template.replace(/^ {2}Content-Security-Policy: .+$/m, `  Content-Security-Policy: ${policy}`)
  await writeFile(resolve(root, '_headers'), headers)
  return { policy, htmlFiles: documents.length }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await writeSecurityHeaders()
  console.log(`Static security headers generated for ${result.htmlFiles} pages; inline script hashes only, no unsafe-inline scripts.`)
}
