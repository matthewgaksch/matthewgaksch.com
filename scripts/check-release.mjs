import { readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import process from 'node:process'
import console from 'node:console'
import { fileURLToPath } from 'node:url'
import { contentSecurityPolicy, exportFiles } from './security-headers.mjs'

export async function checkRelease(root = resolve('out')) {
  const files = await exportFiles(root)
  const html = []
  for (const file of files) {
    const name = relative(root, file).replaceAll('\\', '/')
    if (/(^|\/)(?:\.env[^/]*|\.git|studio|content|node_modules)(?:\/|$)|\.(?:map|pem|key|sqlite\d*|db|log)$/i.test(name))
      throw new Error(`Private/source artifact in release: ${name}`)
    if (file.endsWith('.html')) html.push(await readFile(file, 'utf8'))
  }
  const headers = await readFile(resolve(root, '_headers'), 'utf8')
  if (!headers.includes(`Content-Security-Policy: ${contentSecurityPolicy(html)}`))
    throw new Error('Exported CSP does not match the built HTML. Rebuild before publishing.')
  if (headers.split('\n').some(line => line.length > 2000)) throw new Error('Header line limit exceeded.')
  for (const directive of ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Strict-Transport-Security: max-age=31536000'])
    if (!headers.includes(directive)) throw new Error('Required release headers missing.')
  const allText = html.join('\n')
  if (/\/studio\/server|\/editor\.js|BLOG_EDITOR_PORT/.test(allText)) throw new Error('Local editor code leaked into exported pages.')
  return { files: files.length, pages: html.length }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await checkRelease()
  console.log(`Release boundary verified: ${result.files} files / ${result.pages} pages; CSP current; no source maps, credentials or editor artifacts.`)
}
