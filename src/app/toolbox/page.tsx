import { pageMetadata } from '../../lib/metadata'
import { ToolboxPage } from '../../views/ToolboxPage'

export const metadata = pageMetadata('toolbox')

export default function Page() {
  return <div className="page page-toolbox"><ToolboxPage /></div>
}
