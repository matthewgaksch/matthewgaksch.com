import Link from 'next/link'
import type { BlogPost } from '../lib/blog-posts'

export function BlogPage({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="blog-page">
      <header className="toolbox-intro shell">
        <p className="toolbox-path">~/blog</p>
        <h1>Blog<span aria-hidden="true">.</span></h1>
        <p>Things on my mind.</p>
      </header>

      {posts.length > 0 ? <section className="toolbox-section shell" aria-labelledby="blog-posts-title">
        <div className="toolbox-section-heading">
          <h2 id="blog-posts-title">Writing</h2>
          <span>{String(posts.length).padStart(2, '0')} posts</span>
        </div>

        <div className="blog-grid">
          {posts.map((post, index) => (
            <article className="blog-entry blog-entry--published" key={post.slug}>
              <span className="blog-entry-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div className="blog-entry-copy">
                <div className="blog-entry-meta"><span>{post.category}</span><time dateTime={post.publishedAt!}>{new Date(`${post.publishedAt}T00:00:00Z`).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })}</time></div>
                <h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3>
                <p>{post.summary}</p>
                <Link className="blog-read" href={`/blog/${post.slug}/`}>Read article <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section> : <section className="blog-empty shell" aria-label="Blog posts"><p>Stay tuned. For now, check out my <a href="https://x.com/matthew_gaksch" target="_blank" rel="noopener noreferrer">twitter</a>.</p></section>}
    </div>
  )
}
