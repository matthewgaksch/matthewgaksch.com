import { pageMetadata } from '../../lib/metadata'
import { BlogPage } from '../../views/BlogPage'
import { getPublishedPosts } from '../../lib/blog-posts'

export const metadata = pageMetadata('blog')

export default async function Page() {
  const posts = await getPublishedPosts()
  return <div className="page page-blog"><BlogPage posts={posts} /></div>
}
