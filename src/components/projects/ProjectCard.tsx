import type { Project } from '../../lib/types'
import { ExternalLink } from '../ui/ExternalLink'

interface ProjectCardProps {
  project: Project
  headingLevel?: 2 | 3
}

export function ProjectCard({ project, headingLevel = 2 }: ProjectCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <article className="project-card">
      {project.image && <img className="project-image" src={project.image} alt={`${project.name} preview`} loading="lazy" />}
      <div className="project-main">
        <span className="project-category">{project.category}{project.status && ` · ${project.status}`}</span>
        <Heading>{project.name}</Heading>
      </div>
      <div className="project-info">
        <p>{project.description}</p>
        {project.technologies && project.technologies.length > 0 && (
          <ul className="project-technologies" aria-label={`${project.name} technologies`}>
            {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
          </ul>
        )}
        <ExternalLink className="project-link" href={project.href} label={`${project.linkLabel} (opens in a new tab)`}>{project.linkLabel}</ExternalLink>
      </div>
    </article>
  )
}
