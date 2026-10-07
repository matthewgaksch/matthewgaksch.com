import { site } from '../../content/site'
import { ThemeToggle } from '../ui/ThemeToggle'

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <a className="brand" href="/" aria-label={`MG — ${site.name}, home`}>MG</a>
        <div className="header-right">
          <nav className="header-pages" aria-label="Pages">
            <a className="header-page-link" href="/blog/">Blog</a>
            <a className="header-page-link" href="/toolbox/">Toolbox</a>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
