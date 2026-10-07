import { pageMetadata } from '../../lib/metadata'
import { ProjectsPage } from '../../views/ProjectsPage'

export const metadata = pageMetadata('projects')

export default function Page() {
  return <div className="page page-projects"><ProjectsPage /></div>
}
