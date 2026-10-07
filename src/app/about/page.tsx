import { pageMetadata } from '../../lib/metadata'
import { AboutPage } from '../../views/AboutPage'

export const metadata = pageMetadata('about')

export default function Page() {
  return <div className="page page-about"><AboutPage /></div>
}
