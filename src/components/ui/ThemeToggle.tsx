'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './button'

type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const syncTheme = () => setTheme(initialTheme())
    syncTheme()
    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  function toggleTheme() {
    const nextTheme = initialTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#08080b' : '#ffffff')
    setTheme(nextTheme)
    try {
      localStorage.setItem('portfolio-theme', nextTheme)
    } catch {
      // The current page can still switch themes when storage is unavailable.
    }
  }

  return (
    <Button
      className="theme-toggle"
      variant="ghost"
      size="icon"
      suppressHydrationWarning
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className="theme-icon theme-icon-moon" aria-hidden="true"><Moon size={18} strokeWidth={1.8} /></span>
      <span className="theme-icon theme-icon-sun" aria-hidden="true"><Sun size={18} strokeWidth={1.8} /></span>
    </Button>
  )
}
