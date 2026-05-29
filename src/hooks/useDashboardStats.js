import { useState, useEffect } from 'react'
import { useDB } from './useDB.js'
import { useTransactionVersion } from './useTransactionBus.js'
import {
  getMonthTotals,
  getDailyFlow,
  getCategoryDistribution,
  getTopExpenses,
  getSavingsGoal,
} from '../db/dashboard.js'

const now = new Date()

const EMPTY = {
  totals: { income: 0, expenses: 0, net: 0, balance: 0 },
  dailyFlow: [],
  categoryDist: [],
  topExpenses: [],
  savingsGoal: null,
}

export function useDashboardStats() {
  const { db } = useDB()
  const version = useTransactionVersion()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [data, setData] = useState(EMPTY)

  useEffect(() => {
    if (!db) return
    setData({
      totals:       getMonthTotals(db, year, month),
      dailyFlow:    getDailyFlow(db, year, month),
      categoryDist: getCategoryDistribution(db, year, month),
      topExpenses:  getTopExpenses(db, year, month),
      savingsGoal:  getSavingsGoal(db, year, month),
    })
  }, [db, version, year, month])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    const curY = now.getFullYear(), curM = now.getMonth() + 1
    if (year > curY || (year === curY && month >= curM)) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return { year, month, prevMonth, nextMonth, isCurrentMonth, ...data }
}
