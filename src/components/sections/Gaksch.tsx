import { site } from '../../content/site'
import { ExternalLink } from '../ui/ExternalLink'

export function Gaksch({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <section className="content-width gaksch-section" id="gaksch" aria-labelledby="gaksch-title">
      <div className="gaksch-panel">
        <div className="gaksch-content">
          <Heading id="gaksch-title">{site.ecosystem.name}</Heading>
          <p>{site.ecosystem.description}</p>
          <ExternalLink className="panel-link" href={site.ecosystem.href} label={`Visit ${site.ecosystem.name} (opens in a new tab)`}>Visit gaksch.net</ExternalLink>
        </div>
      </div>
    </section>
  )
}
