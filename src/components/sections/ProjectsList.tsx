import { projects } from '../../content/projects'
import { ProjectCard } from '../projects/ProjectCard'

export function ProjectsList({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const visibleProjects = projects.filter((project) => project.visible)

  return (
    <section className="shell work-section" aria-label="Projects">
      <div className="projects-list">
        {visibleProjects.map((project) => <ProjectCard key={project.id} project={project} headingLevel={headingLevel} />)}
      </div>
    </section>
  )
}
