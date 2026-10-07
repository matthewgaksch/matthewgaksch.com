import { pageMetadata } from '../../lib/metadata'
import { EducationPage } from '../../views/EducationPage'

export const metadata = pageMetadata('education')

export default function Page() {
  return <div className="page page-education"><EducationPage /></div>
}
