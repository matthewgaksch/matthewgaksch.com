import { PageIntro } from '../components/layout/PageIntro'
import { EducationList } from '../components/sections/EducationList'

export function EducationPage() {
  return (
    <>
      <PageIntro title="Education" />
      <section className="content-width education-section" aria-label="Education history">
        <EducationList />
      </section>
    </>
  )
}
