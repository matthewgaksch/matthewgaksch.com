import { ArrowUpRight } from 'lucide-react'
import type { PropsWithChildren } from 'react'

interface ExternalLinkProps extends PropsWithChildren {
  href: string
  className?: string
  label?: string
}

export function ExternalLink({ href, children, className, label }: ExternalLinkProps) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      {children}
      <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.8} />
    </a>
  )
}
