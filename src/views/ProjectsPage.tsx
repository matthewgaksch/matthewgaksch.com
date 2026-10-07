import { PageIntro } from '../components/layout/PageIntro'
import { ProjectsList } from '../components/sections/ProjectsList'

export function ProjectsPage() {
  return (
    <>
      <PageIntro title="Projects" wide />
      <ProjectsList />
    </>
  )
}
