import { pageMetadata } from '../../lib/metadata'
import { StackPage } from '../../views/StackPage'

export const metadata = pageMetadata('stack')

export default function Page() {
  return <div className="page page-stack"><StackPage /></div>
}
