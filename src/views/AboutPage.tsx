import { PageIntro } from '../components/layout/PageIntro'
import { About } from '../components/sections/About'
import { Elsewhere } from '../components/sections/Elsewhere'
import { Gaksch } from '../components/sections/Gaksch'

export function AboutPage() {
  return (
    <>
      <PageIntro title="About" />
      <About />
      <Gaksch />
      <Elsewhere />
    </>
  )
}
