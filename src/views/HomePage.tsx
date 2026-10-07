import { About } from '../components/sections/About'
import { EducationList } from '../components/sections/EducationList'
import { Hero } from '../components/sections/Hero'
import { ProfileDetails } from '../components/sections/ProfileDetails'
import { ProjectsList } from '../components/sections/ProjectsList'
import { StackList } from '../components/sections/StackList'

export function HomePage() {
  return (
    <>
      <Hero />
      <ProfileDetails />
      <section className="home-section" id="about" aria-labelledby="about-title">
        <div className="home-section-heading shell"><h2 id="about-title">About</h2></div>
        <About />
      </section>
      <section className="home-section" id="projects" aria-labelledby="projects-title">
        <div className="home-section-heading shell"><h2 id="projects-title">Projects</h2></div>
        <ProjectsList headingLevel={3} />
      </section>
      <section className="home-section" id="education" aria-labelledby="education-title">
        <div className="home-section-heading shell"><h2 id="education-title">Education</h2></div>
        <div className="shell"><EducationList headingLevel={3} /></div>
      </section>
      <section className="home-section" id="stack" aria-labelledby="stack-title">
        <div className="home-section-heading shell"><h2 id="stack-title">Stack</h2></div>
        <StackList headingLevel={3} />
      </section>
    </>
  )
}
