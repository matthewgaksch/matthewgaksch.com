import type { Project } from '../lib/types'

export const projects = [
  {
    id: 'gaksch-one',
    name: 'Gaksch One',
    description: 'Identity and authentication infrastructure for the Gaksch ecosystem.',
    href: 'https://gaksch.net',
    linkLabel: 'Join the waitlist',
    visible: true,
    featured: true,
    category: 'Infrastructure',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    description: 'A connected workspace for study, tasks, notes, and everyday planning.',
    href: 'https://gaksch.net/#orbit',
    linkLabel: 'View preview',
    status: 'Coming soon',
    visible: true,
    featured: true,
    category: 'Personal software',
  },
] satisfies Project[]
