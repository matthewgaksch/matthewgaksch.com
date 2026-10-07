interface PageIntroProps {
  title: string
  description?: string
  wide?: boolean
}

export function PageIntro({ title, description, wide = false }: PageIntroProps) {
  return (
    <header className={`page-intro ${wide ? 'shell' : 'content-width'}`}>
      <span className="pixel-line" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  )
}
