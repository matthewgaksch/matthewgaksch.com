import type { MetadataRoute } from 'next'
import { pages } from '../content/pages'
import { site } from '../content/site'
import { getPublishedPosts } from '../lib/blog-posts'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${site.domain}`
  const posts = await getPublishedPosts()
  return [
    ...Object.values(pages).map((page) => ({ url: new URL(page.href, base).href })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}/`, lastModified: post.updatedAt })),
  ]
}
