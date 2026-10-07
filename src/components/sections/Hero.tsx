import { site } from '../../content/site'
import { RotatingRole } from './HeroMotion'

export function Hero() {
  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero-layout">
        <div className="hero-copy">
          <h1 id="hero-title" className="hero-name" aria-label={site.name}>
            <span className="typed-name" aria-hidden="true">
              {Array.from(site.name).map((character, index) => (
                <span className="typed-name-character" style={{ animationDelay: `${index * 45}ms` }} key={index}>{character}</span>
              ))}
              <span className="typing-caret" style={{ animationDelay: `${site.name.length * 45}ms` }}>|</span>
            </span>
          </h1>
          <RotatingRole phrases={site.roleLines} accessibleText={site.title} />
        </div>
        <div className="hero-portrait">
          <img
            src="/profile-2000.webp"
            srcSet="/profile-480.webp 480w, /profile-768.webp 768w, /profile-1200.webp 1200w, /profile-2000.webp 2000w"
            sizes="(max-width: 680px) 150px, (max-width: 760px) 170px, 230px"
            alt="Portrait of Matthew Gaksch"
            width="2000"
            height="2000"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </div>
    </section>
  )
}
