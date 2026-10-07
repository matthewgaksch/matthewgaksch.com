import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { validateSavedPost } from './blog-schema.mjs'

export type { BlogPost } from './blog-schema.mjs'
import type { BlogPost } from './blog-schema.mjs'

const postsDirectory = path.join(process.cwd(), 'content', 'blog')

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const names = await readdir(postsDirectory).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return []
    throw error
  })

  const posts = await Promise.all(
    names.filter((name) => name.endsWith('.json')).map(async (name) => {
      try {
        return validateSavedPost(JSON.parse(await readFile(path.join(postsDirectory, name), 'utf8')), name.slice(0, -5))
      } catch (error) {
        throw new Error(`Invalid blog post ${name}: ${error instanceof Error ? error.message : String(error)}`, { cause: error })
      }
    }),
  )

  return posts
    .filter((post) => post.status === 'published' && post.publishedAt)
    .sort((a, b) => b.publishedAt!.localeCompare(a.publishedAt!))
}
