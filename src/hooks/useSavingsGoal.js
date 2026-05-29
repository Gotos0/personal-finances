import { useState, useEffect, useCallback } from 'react'
import { useDB } from './useDB.js'
import { useTransactionVersion, notifyTransactionChange } from './useTransactionBus.js'
import { getSavingsProgress, upsertSavingsGoal } from '../db/comparativa.js'

export function useSavingsGoal(year, month) {
  const { db } = useDB()
  const version = useTransactionVersion()
  const [progress, setProgress] = useState(null)

  const load = useCallback(() => {
    if (!db) return
    setProgress(getSavingsProgress(db, year, month))
  }, [db, year, month])

  useEffect(() => { load() }, [load, version])

  const saveGoal = useCallback((amount, type) => {
    if (!db) return
    upsertSavingsGoal(db, year, month, amount, type)
    notifyTransactionChange() // triggers Dashboard SavingsCard refresh
    load()
  }, [db, year, month, load])

  return { progress, saveGoal }
}
