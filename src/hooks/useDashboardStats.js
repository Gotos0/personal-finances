import { useState, useEffect } from 'react'
import { useDB } from './useDB.js'
import { useTransactionVersion } from './useTransactionBus.js'

export function useDashboardStats() {
  const { db } = useDB()
  const version = useTransactionVersion()
  const [stats, setStats] = useState({ income: 0, expenses: 0, balance: 0 })

  useEffect(() => {
    if (!db) return

    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Current month totals by type
    const monthRows = []
    db.exec({
      sql: `SELECT type, SUM(amount) AS total
            FROM transactions
            WHERE strftime('%Y-%m', date) = ?
            GROUP BY type`,
      bind: [monthStr],
      rowMode: 'object',
      resultRows: monthRows,
    })

    let income = 0
    let expenses = 0
    for (const r of monthRows) {
      if (r.type === 'income') income = r.total ?? 0
      else if (r.type === 'expense') expenses = r.total ?? 0
    }

    // All-time cumulative balance
    const balance = db.selectValue(
      `SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0) FROM transactions`
    ) ?? 0

    setStats({ income, expenses, balance })
  }, [db, version])

  return stats
}
