import { HomePage } from '../views/HomePage'
import { site } from '../content/site'
import { pageMetadata } from '../lib/metadata'

export const metadata = pageMetadata('home')

const homepageUrl = `https://${site.domain}/`

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${homepageUrl}#website`,
      name: site.name,
      url: homepageUrl,
    },
    {
      '@type': 'WebPage',
      '@id': `${homepageUrl}#webpage`,
      name: site.name,
      url: homepageUrl,
      isPartOf: { '@id': `${homepageUrl}#website` },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${homepageUrl}profile-1200.webp`,
        width: 1200,
        height: 1200,
        caption: 'Portrait of Matthew Gaksch',
      },
    },
  ],
}

export default function Page() {
  return <div className="page page-home"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} /><HomePage /></div>
}
