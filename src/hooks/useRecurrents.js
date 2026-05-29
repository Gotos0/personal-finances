import { useState, useEffect, useCallback } from 'react'
import { useDB } from './useDB.js'
import { notifyTransactionChange } from './useTransactionBus.js'
import { getSetting, setSetting } from '../db/settings.js'
import {
  listRecurrents,
  createRecurrent,
  updateRecurrent,
  deleteRecurrent,
  toggleRecurrentActive,
  applyRecurrentNow,
  autoApplyDue,
} from '../db/recurrents.js'

const DEFAULT_ALERT_DAYS = 3

export function useRecurrents() {
  const { db } = useDB()
  const [recurrents, setRecurrents] = useState([])
  const [alertDays, setAlertDaysState] = useState(DEFAULT_ALERT_DAYS)
  const [autoApplied, setAutoApplied] = useState(0) // count from last startup run

  const load = useCallback(() => {
    if (!db) return
    setRecurrents(listRecurrents(db))
  }, [db])

  // On mount: read settings, auto-apply due recurrents, then load the list.
  useEffect(() => {
    if (!db) return

    const savedDays = Number(getSetting(db, 'alert_days_before', DEFAULT_ALERT_DAYS))
    setAlertDaysState(savedDays)

    const all = listRecurrents(db)
    const count = autoApplyDue(db, all)
    setRecurrents(listRecurrents(db)) // fresh data with updated last_applied

    if (count > 0) {
      setAutoApplied(count)
      notifyTransactionChange()
    }
  }, [db]) // eslint-disable-line react-hooks/exhaustive-deps

  const setAlertDays = useCallback((days) => {
    setAlertDaysState(days)
    if (db) setSetting(db, 'alert_days_before', days)
  }, [db])

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
    notifyTransactionChange()
    load()
  }, [db, load])

  const dismissAutoApplied = useCallback(() => setAutoApplied(0), [])

  return {
    recurrents,
    alertDays,
    setAlertDays,
    autoApplied,
    dismissAutoApplied,
    addRecurrent,
    editRecurrent,
    removeRecurrent,
    toggleActive,
    applyNow,
  }
}
