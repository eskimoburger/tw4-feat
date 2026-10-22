import { useCallback, useEffect, useState } from 'react'

// Same key and semantics as the HTML edition (html/assets/showcase.js):
// "light" / "dark" are stored; "system" means "no value, no data-theme".
const KEY = 'sc-theme'
export const THEMES = [
  ['system', 'Theme: system'],
  ['light', 'Theme: light'],
  ['dark', 'Theme: dark'],
]

function readStored() {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

function writeStored(theme) {
  try {
    if (theme === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, theme)
  } catch {
    // private mode / blocked storage: the choice just won't persist
  }
}

function applyToDocument(theme) {
  const root = document.documentElement
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme)
  else root.removeAttribute('data-theme')
}

export function useTheme() {
  const [theme, setThemeState] = useState(readStored)

  useEffect(() => {
    applyToDocument(theme)
  }, [theme])

  const setTheme = useCallback((next) => {
    setThemeState(next)
    writeStored(next)
  }, [])

  return [theme, setTheme]
}
