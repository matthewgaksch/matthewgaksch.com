export interface Project {
  id: string
  name: string
  description: string
  href: string
  linkLabel: string
  visible: boolean
  featured: boolean
  category: string
  technologies?: readonly string[]
  image?: string
  status?: string
}

export interface ExternalLinkItem {
  id: string
  label: string
  href: string
  description?: string
}

export interface StackGroup {
  label: string
  description?: string
  items: readonly string[]
  href?: string
}

export interface EducationItem {
  name: string
  period: string
  detail?: string
}

export type PageKey = 'home' | 'projects' | 'about' | 'education' | 'stack'

export interface NavigationItem {
  key: PageKey
  label: string
  href: string
  description?: string
}
