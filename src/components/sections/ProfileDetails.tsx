import { ArrowUpRight, Mail, MapPin } from 'lucide-react'
import { siGithub, siInstagram, siX } from 'simple-icons'
import { links } from '../../content/links'
import { BangkokClock } from './BangkokClock'

const brandIcons = { instagram: siInstagram, x: siX, github: siGithub }

function BrandIcon({ id }: { id: string }) {
  if (id === 'linkedin') {
    return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="4.3" cy="4.3" r="2.2" /><path d="M2.3 8.5h4v13h-4zm7 0h3.9v1.8c.8-1.3 2.1-2.1 4-2.1 3.3 0 4.7 2.1 4.7 5.4v7.9h-4v-7.1c0-1.5-.5-2.6-2.1-2.6-1.7 0-2.5 1.2-2.5 2.8v6.9h-4z" /></svg>
  }

  const icon = brandIcons[id as keyof typeof brandIcons]
  return icon ? <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon.path} /></svg> : null
}

export function ProfileDetails() {
  return (
    <section className="profile-details shell" aria-label="Location and contact" data-nosnippet>
      <div className="profile-facts">
        <div className="profile-fact profile-location">
          <MapPin size={18} aria-hidden="true" />
          <div className="profile-location-content">
            <strong>Bangkok, Thailand</strong>
            <nav className="profile-links" aria-label="Online profiles">
              {links.map((link) => <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label} ${link.description} (opens in a new tab)`}>
                <BrandIcon id={link.id} />
                <span className="profile-link-tip" aria-hidden="true">{link.label} ({link.description})</span>
              </a>)}
            </nav>
          </div>
        </div>
        <div className="profile-fact"><span className="clock-icon" aria-hidden="true">⌁</span><BangkokClock /></div>
        <a className="profile-fact profile-email" href="mailto:matthew@gaksch.net"><Mail size={18} aria-hidden="true" /><span><strong>matthew@gaksch.net</strong><small>Email me <ArrowUpRight size={12} aria-hidden="true" /></small></span></a>
      </div>
    </section>
  )
}
