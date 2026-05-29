import { useState, useEffect } from 'react'
import { useDB } from './useDB.js'
import { getSetting, setSetting } from '../db/settings.js'

function applyTheme(theme) {
  document.documentElement.classList.toggle('light', theme === 'light')
}

export function useTheme() {
  const { db } = useDB()
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    if (!db) return
    const stored = getSetting(db, 'theme', 'dark')
    applyTheme(stored)
    setTheme(stored)
  }, [db])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    if (db) setSetting(db, 'theme', next)
    applyTheme(next)
    setTheme(next)
  }

  return { theme, toggle }
}
