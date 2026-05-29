import { useState, useEffect } from 'react'
import { useDB } from './useDB.js'
import { listCategories } from '../db/categories.js'

export function useCategories() {
  const { db } = useDB()
  const [categories, setCategories] = useState([])
  useEffect(() => {
    if (!db) return
    setCategories(listCategories(db))
  }, [db])
  return categories
}
