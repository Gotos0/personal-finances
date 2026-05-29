import { useState, useEffect, useCallback } from 'react'
import { useDB } from './useDB.js'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../db/categories.js'

export function useCategories() {
  const { db } = useDB()
  const [categories, setCategories] = useState([])

  const load = useCallback(() => {
    if (!db) return
    setCategories(listCategories(db))
  }, [db])

  useEffect(() => { load() }, [load])

  const create = useCallback((data) => {
    if (!db) return
    createCategory(db, data)
    load()
  }, [db, load])

  const update = useCallback((id, data) => {
    if (!db) return
    updateCategory(db, id, data)
    load()
  }, [db, load])

  const remove = useCallback((id) => {
    if (!db) return
    deleteCategory(db, id) // throws if category has transactions
    load()
  }, [db, load])

  return { categories, create, update, remove }
}
