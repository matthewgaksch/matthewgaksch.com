import { stack } from '../../content/stack'

export function StackList({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <section className="content-width stack-section" aria-label="Current stack">
      <div className="stack-terminal">
        <div className="stack-groups">
          {stack.map((group) => (
            <div className="stack-group" key={group.label}>
              <div className="stack-group-intro">
                <Heading>{group.label}</Heading>
                {group.description ? <p>{group.description}</p> : null}
              </div>
              {group.href ? (
                <a className="stack-toolbox-link" href={group.href}>View toolbox <span aria-hidden="true">↗</span></a>
              ) : (
                <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
