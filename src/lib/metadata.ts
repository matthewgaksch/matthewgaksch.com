import type { Metadata } from 'next'
import { pages } from '../content/pages'
import { site } from '../content/site'

export function contentMetadata({ title, description, href }: { title: string, description: string, href: string }): Metadata {
  const fullTitle = href === '/' ? title : `${title} — ${site.name}`
  return {
    title: href === '/' ? { absolute: title } : title,
    description,
    alternates: { canonical: href },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: fullTitle,
      description,
      url: href,
      images: ['/og-image.png'],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: ['/og-image.png'] },
  }
}

export function pageMetadata(key: keyof typeof pages): Metadata {
  return contentMetadata(pages[key])
}
