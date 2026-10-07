import { site } from '../../content/site'
import { LocalGreeting } from './LocalGreeting'

export function About() {
  return (
    <section className="content-width about-section" aria-label="About Matthew">
      <LocalGreeting />
      <p className="about-copy">{site.about}</p>
    </section>
  )
}
