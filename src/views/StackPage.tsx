import { PageIntro } from '../components/layout/PageIntro'
import { StackList } from '../components/sections/StackList'

export function StackPage() {
  return (
    <>
      <PageIntro title="Stack" description="I’m learning computer science by building. These are the tools in my current projects and development workflow." />
      <StackList />
    </>
  )
}
