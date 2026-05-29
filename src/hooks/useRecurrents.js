import { useState, useEffect, useCallback } from 'react'
import { useDB } from './useDB.js'
import { notifyTransactionChange } from './useTransactionBus.js'
import {
  listRecurrents,
  createRecurrent,
  updateRecurrent,
  deleteRecurrent,
  toggleRecurrentActive,
  applyRecurrentNow,
} from '../db/recurrents.js'

export function useRecurrents() {
  const { db } = useDB()
  const [recurrents, setRecurrents] = useState([])

  const load = useCallback(() => {
    if (!db) return
    setRecurrents(listRecurrents(db))
  }, [db])

  useEffect(() => { load() }, [load])

  const addRecurrent = useCallback((data) => {
    if (!db) return
    createRecurrent(db, data)
    load()
  }, [db, load])

  const editRecurrent = useCallback((id, data) => {
    if (!db) return
    updateRecurrent(db, id, data)
    load()
  }, [db, load])

  const removeRecurrent = useCallback((id) => {
    if (!db) return
    deleteRecurrent(db, id)
    load()
  }, [db, load])

  const toggleActive = useCallback((id, active) => {
    if (!db) return
    toggleRecurrentActive(db, id, active)
    load()
  }, [db, load])

  const applyNow = useCallback((recurrent) => {
    if (!db) return
    applyRecurrentNow(db, recurrent)
    notifyTransactionChange() // updates Dashboard + Transacciones instantly
    load()                    // refreshes last_applied in this list
  }, [db, load])

  return { recurrents, addRecurrent, editRecurrent, removeRecurrent, toggleActive, applyNow }
}
