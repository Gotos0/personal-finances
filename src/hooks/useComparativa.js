import { useState, useEffect } from 'react'
import { useDB } from './useDB.js'
import { useTransactionVersion } from './useTransactionBus.js'
import { getMonthTotals } from '../db/dashboard.js'
import {
  getCategoryComparison,
  getLast6MonthsSummary,
} from '../db/comparativa.js'

const now = new Date()
const curYear  = now.getFullYear()
const curMonth = now.getMonth() + 1
const prevYear  = curMonth === 1 ? curYear - 1 : curYear
const prevMonth = curMonth === 1 ? 12 : curMonth - 1

const EMPTY = {
  totalsA: { income: 0, expenses: 0, net: 0 },
  totalsB: { income: 0, expenses: 0, net: 0 },
  comparison: [],
  history: [],
}

export function useComparativa() {
  const { db } = useDB()
  const version = useTransactionVersion()

  const [yearA,  setYearA]  = useState(prevYear)
  const [monthA, setMonthA] = useState(prevMonth)
  const [yearB,  setYearB]  = useState(curYear)
  const [monthB, setMonthB] = useState(curMonth)
  const [data, setData] = useState(EMPTY)

  useEffect(() => {
    if (!db) return
    setData({
      totalsA:    getMonthTotals(db, yearA, monthA),
      totalsB:    getMonthTotals(db, yearB, monthB),
      comparison: getCategoryComparison(db, yearA, monthA, yearB, monthB),
      history:    getLast6MonthsSummary(db),
    })
  }, [db, version, yearA, monthA, yearB, monthB])

  return { yearA, monthA, setYearA, setMonthA, yearB, monthB, setYearB, setMonthB, ...data }
}
