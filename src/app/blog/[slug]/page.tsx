import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { renderMarkdown } from '../../../lib/render-markdown.mjs'
import { getPublishedPosts } from '../../../lib/blog-posts'
import { contentMetadata } from '../../../lib/metadata'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  // Static export requires one generated path even before the first article exists.
  return posts.length ? posts.map(({ slug }) => ({ slug })) : [{ slug: '__empty' }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = (await getPublishedPosts()).find((entry) => entry.slug === slug)
  if (!post) return {}
  return contentMetadata({
    title: post.title,
    description: post.summary,
    href: `/blog/${slug}/`,
  })
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const post = (await getPublishedPosts()).find((entry) => entry.slug === slug)
  if (!post) notFound()

  const html = renderMarkdown(post.body)
  const date = new Date(`${post.publishedAt}T00:00:00Z`)

  return (
    <div className="page page-blog">
      <article className="blog-article shell">
        <Link className="blog-back" href="/blog/">← Blog</Link>
        <header className="blog-article-header">
          <div className="blog-entry-meta"><span>{post.category}</span><time dateTime={post.publishedAt!}>{date.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</time></div>
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
        </header>
        <div className="blog-prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  )
}
