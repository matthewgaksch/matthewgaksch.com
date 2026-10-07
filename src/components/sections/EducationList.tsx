import { education } from '../../content/education'

export function EducationList({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <ol className="education-list">
      {education.map((item) => (
        <li className="education-item" key={item.name}>
          <div>
            <Heading>{item.name}</Heading>
            {item.detail && <p>{item.detail}</p>}
          </div>
          <span className="education-period">{item.period}</span>
        </li>
      ))}
    </ol>
  )
}
