import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { renderMarkdown } from '../src/lib/render-markdown.mjs'
import { readContributionResponse } from '../src/lib/github-contributions.ts'
import { secureApiResponse } from '../worker/security.ts'
import { contentSecurityPolicy } from '../scripts/security-headers.mjs'
import { checkRelease } from '../scripts/check-release.mjs'

test('published and preview Markdown escape raw HTML and reject script/data URLs', () => {
  for (const body of ['<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '[unsafe](javascript:alert%281%29)', '[unsafe](jav&#x61;script:alert%281%29)', '[unsafe](data:text/html;base64,PHNjcmlwdD4=)']) {
    const html = renderMarkdown(body)
    assert.doesNotMatch(html, /<script\b|<img[^>]+onerror|href="(?:javascript|data):/i)
  }
  assert.throws(() => renderMarkdown('x'.repeat(200_001)), /Invalid article/)
})

test('safe Markdown content, links, images and GFM survive hardening', () => {
  const html = renderMarkdown('~~old~~\n\n[Link](https://example.com)\n\n![Photo](/images/blog/example.webp)\n\n| A | B |\n| - | - |\n| 1 | 2 |')
  for (const fragment of ['<del>old</del>', 'href="https://example.com"', 'src="/images/blog/example.webp"', '<table>']) assert.ok(html.includes(fragment))
})

test('static CSP hashes the actual inline scripts and permits only the required API origin', () => {
  const script = 'self.__next_f.push([1,"safe"]);'
  const policy = contentSecurityPolicy([`<script>${script}</script>`])
  assert.ok(policy.includes(`'sha256-${createHash('sha256').update(script).digest('base64')}'`))
  const scriptPolicy = policy.match(/script-src [^;]+/)[0]
  assert.doesNotMatch(scriptPolicy, /unsafe-inline|unsafe-eval|\*/)
  assert.ok(scriptPolicy.endsWith(' https://static.cloudflareinsights.com'))
  assert.match(policy, /connect-src 'self' https:\/\/github-contributions-api\.jogruber\.de;/)
  assert.notEqual(policy, contentSecurityPolicy([`<script>${script}changed</script>`]))
  assert.throws(() => contentSecurityPolicy(Array.from({ length: 50 }, (_, n) => `<script>unique(${n})</script>`)), /header line limit/)
})

test('release check rejects leaked source maps and stale script hashes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-release-'))
  const html = '<script>self.__next_f=[]</script>'
  const headers = `/*\n  Content-Security-Policy: ${contentSecurityPolicy([html])}\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Strict-Transport-Security: max-age=31536000\n`
  try {
    await writeFile(join(root, 'index.html'), html)
    await writeFile(join(root, '_headers'), headers)
    assert.equal((await checkRelease(root)).pages, 1)
    await writeFile(join(root, 'index.html'), html + '<script>not-reviewed()</script>')
    await assert.rejects(checkRelease(root), /CSP does not match/)
    await writeFile(join(root, 'index.html'), html)
    await mkdir(join(root, 'assets'))
    await writeFile(join(root, 'assets/main.js.map'), '{}')
    await assert.rejects(checkRelease(root), /Private\/source artifact/)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('activity JSON reads are bounded and reject invalid response types without trusting extra fields', async () => {
  const contributions = [{ date: '2026-10-28', count: 3, level: 1 }]
  assert.deepEqual(await readContributionResponse(globalThis.Response.json({ contributions, private: 'never projected' })), contributions)
  await assert.rejects(readContributionResponse(new globalThis.Response('x'.repeat(100_001), { headers: { 'Content-Type': 'application/json' } })), /Invalid contribution response/)
  await assert.rejects(readContributionResponse(new globalThis.Response('{}', { status: 503 })), /unavailable/)
  await assert.rejects(readContributionResponse(new globalThis.Response('<script>bad</script>', { headers: { 'Content-Type': 'text/html' } })), /unavailable/)
  let canceled = false
  const endless = new globalThis.ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(0)) }, cancel() { canceled = true } })
  await assert.rejects(readContributionResponse(new globalThis.Response(endless, { headers: { 'Content-Type': 'application/json' } })), /Invalid contribution response/)
  assert.equal(canceled, true)
})

test('Worker API replies retain status/no-store and gain security headers outside static-assets rules', async () => {
  for (const status of [200, 405]) {
    const response = secureApiResponse(new globalThis.Response(status === 200 ? '{}' : null, { status, headers: { 'Cache-Control': 'no-store' } }))
    assert.equal(response.status, status)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal(response.headers.get('x-frame-options'), 'DENY')
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff')
    assert.match(response.headers.get('content-security-policy'), /default-src 'none'/)
  }
})
