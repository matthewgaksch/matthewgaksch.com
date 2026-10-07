import { links } from '../../content/links'
import { ExternalLink } from '../ui/ExternalLink'

export function Elsewhere() {
  if (links.length === 0) return null

  return (
    <section className="content-width contact-section" aria-labelledby="contact-title">
      <h2 id="contact-title">Elsewhere</h2>
      <div className="elsewhere-links">
        {links.map((link) => (
          <ExternalLink className="elsewhere-link" key={link.id} href={link.href} label={`${link.label} (opens in a new tab)`}>
            <span><strong>{link.label}</strong>{link.description && <small>{link.description}</small>}</span>
          </ExternalLink>
        ))}
      </div>
    </section>
  )
}
