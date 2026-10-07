import { site } from '../../content/site'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>{site.domain}</span>
      </div>
    </footer>
  )
}
