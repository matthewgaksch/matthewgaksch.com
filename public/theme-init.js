try {
  const savedTheme = globalThis.localStorage.getItem('portfolio-theme')
  const theme = savedTheme === 'light' ? 'light' : 'dark'
  globalThis.document.documentElement.dataset.theme = theme
  globalThis.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#08080b' : '#ffffff')
} catch {
  globalThis.document.documentElement.dataset.theme = 'dark'
}
