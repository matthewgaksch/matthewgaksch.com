/**
 * @typedef {object} BlogPostInput
 * @property {string} slug
 * @property {string} title
 * @property {string} summary
 * @property {string} category
 * @property {string} body
 * @property {'draft' | 'published'} status
 *
 * @typedef {BlogPostInput & { publishedAt: string | null, updatedAt: string }} BlogPost
 */

/** @param {unknown} input @returns {BlogPostInput} */
export function validatePostInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid post.')
  const fields = ['slug', 'title', 'summary', 'category', 'body']
  if (fields.some((field) => typeof input[field] !== 'string')) throw new Error('Complete all post fields.')
  const post = Object.fromEntries(fields.map((field) => [field, input[field].trim()]))
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || post.slug.length > 80) throw new Error('Use a short URL slug with lowercase letters, numbers, and hyphens.')
  if (!post.title || !post.summary || !post.category || !post.body) throw new Error('Title, summary, category, and article text are required.')
  if (post.title.length > 140 || post.summary.length > 300 || post.category.length > 40 || post.body.length > 200_000) throw new Error('A field exceeds its length limit.')
  if (!['draft', 'published'].includes(input.status)) throw new Error('Choose Draft or Published.')
  return { ...post, status: input.status }
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** @param {unknown} input @param {string} expectedSlug @returns {BlogPost} */
export function validateSavedPost(input, expectedSlug) {
  validatePostInput(input)
  if (input.slug !== expectedSlug) throw new Error('The post slug must match its JSON filename.')
  if (input.publishedAt !== null && !isCalendarDate(input.publishedAt)) throw new Error('publishedAt must be a real date in YYYY-MM-DD format or null.')
  if (input.status === 'published' && input.publishedAt === null) throw new Error('Published posts need a publication date.')
  if (typeof input.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(input.updatedAt) || !Number.isFinite(Date.parse(input.updatedAt))) {
    throw new Error('updatedAt must be a valid timestamp.')
  }
  return input
}
