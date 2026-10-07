import assert from 'node:assert/strict'
import test from 'node:test'
import { validatePostInput, validateSavedPost } from '../src/lib/blog-schema.mjs'

const post = {
  slug: 'building-orbit',
  title: 'Building Orbit',
  summary: 'What I learned building a workspace.',
  category: 'Projects',
  body: '  # Orbit\n\nHello, Bangkok — สวัสดี.\n\n![Photo](/images/blog/example.webp)  ',
  status: 'published',
  publishedAt: '2026-09-30',
  updatedAt: '2026-09-30T05:00:00.000Z',
}

test('editor inputs retain their existing whitespace normalization', () => {
  const input = validatePostInput({ ...post, title: '  Building Orbit  ' })
  assert.equal(input.title, post.title)
  assert.equal(input.body, post.body.trim())
})

test('reading a saved article preserves its Markdown and Unicode text exactly', () => {
  assert.deepEqual(validateSavedPost(post, post.slug), post)
})

test('saved drafts remain valid with no publication date', () => {
  const draft = { ...post, status: 'draft', publishedAt: null }
  assert.deepEqual(validateSavedPost(draft, post.slug), draft)
})

test('a filename mismatch fails before generating an article URL', () => {
  assert.throws(() => validateSavedPost(post, 'different-slug'), /filename/)
})

test('published articles cannot silently lose their publication date', () => {
  assert.throws(() => validateSavedPost({ ...post, publishedAt: null }, post.slug), /publication date/)
})

test('impossible publication dates and malformed timestamps are rejected', () => {
  assert.throws(() => validateSavedPost({ ...post, publishedAt: '2026-02-30' }, post.slug), /real date/)
  assert.throws(() => validateSavedPost({ ...post, updatedAt: 'not-a-date' }, post.slug), /timestamp/)
})

test('unrecognized states and missing content cannot reach the build', () => {
  assert.throws(() => validateSavedPost({ ...post, status: 'hidden' }, post.slug), /Draft or Published/)
  assert.throws(() => validateSavedPost({ ...post, body: undefined }, post.slug), /post fields/)
})
