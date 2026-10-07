import type { NavigationItem } from '../lib/types'

export const navigation = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'projects', label: 'Projects', href: '/projects/', description: 'Gaksch One & Orbit' },
  { key: 'about', label: 'About', href: '/about/', description: 'Background & Gaksch' },
  { key: 'education', label: 'Education', href: '/education/', description: 'School, GED & university' },
  { key: 'stack', label: 'Stack', href: '/stack/', description: 'Learning & workflow' },
] satisfies NavigationItem[]
