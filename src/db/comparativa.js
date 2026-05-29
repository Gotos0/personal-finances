import { getMonthTotals, getSavingsGoal, upsertSavingsGoal } from './dashboard.js'

export { upsertSavingsGoal }

function ms(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

function catQuery(db, year, month) {
  const rows = []
  db.exec({
    sql: `SELECT t.category_id,
                 COALESCE(c.name,  'Sin categoría') AS name,
                 COALESCE(c.color, '#6366f1')        AS color,
                 SUM(t.amount)                        AS total
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE strftime('%Y-%m', t.date) = ?
            AND t.type = 'expense'
          GROUP BY t.category_id`,
    bind: [ms(year, month)],
    rowMode: 'object',
    resultRows: rows,
  })
  return rows
}

// Merges two periods' category data in JS (SQLite lacks FULL OUTER JOIN).
export function getCategoryComparison(db, yearA, monthA, yearB, monthB) {
  const aRows = catQuery(db, yearA, monthA)
  const bRows = catQuery(db, yearB, monthB)

  const map = {}
  for (const r of aRows) {
    const key = String(r.category_id ?? '__null__')
    map[key] = { name: r.name, color: r.color, totalA: r.total, totalB: 0 }
  }
  for (const r of bRows) {
    const key = String(r.category_id ?? '__null__')
    if (map[key]) {
      map[key].totalB = r.total
    } else {
      map[key] = { name: r.name, color: r.color, totalA: 0, totalB: r.total }
    }
  }

  return Object.values(map)
    .map(r => ({
      ...r,
      delta: r.totalB - r.totalA,
      pct: r.totalA > 0 ? Math.round((r.totalB - r.totalA) / r.totalA * 100) : null,
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
}

// Last N months from oldest → newest, suitable for a left-to-right chart.
export function getLast6MonthsSummary(db, n = 6) {
  const now = new Date()
  const months = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  return months.map(({ year, month }) => {
    const rows = []
    db.exec({
      sql: `SELECT type, COALESCE(SUM(amount), 0) AS total
            FROM transactions
            WHERE strftime('%Y-%m', date) = ?
            GROUP BY type`,
      bind: [ms(year, month)],
      rowMode: 'object',
      resultRows: rows,
    })
    let income = 0, expenses = 0
    for (const r of rows) {
      if (r.type === 'income') income = r.total
      else if (r.type === 'expense') expenses = r.total
    }
    const net = income - expenses
    const label = new Date(year, month - 1, 1)
      .toLocaleDateString('es-MX', { month: 'short' })
      .replace('.', '')
      .toUpperCase()
    return { year, month, income, expenses, net, label }
  })
}

// Full savings progress for a given month, including projected deficit.
export function getSavingsProgress(db, year, month) {
  const goal = getSavingsGoal(db, year, month)
  if (!goal) return null

  const { income, expenses, net } = getMonthTotals(db, year, month)

  const target = goal.target_type === 'fixed'
    ? goal.target_amount
    : income * goal.target_amount / 100

  const saved = Math.max(net, 0)
  const pct = target > 0 ? Math.min(Math.round(saved / target * 100), 100) : 0

  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1
  let projectedExpenses = null
  let projectedNet      = null
  let deficit           = null

  if (isCurrentMonth) {
    const daysElapsed  = today.getDate()
    const daysInMonth  = new Date(year, month, 0).getDate()
    if (daysElapsed > 0 && expenses > 0) {
      projectedExpenses = (expenses / daysElapsed) * daysInMonth
      projectedNet      = income - projectedExpenses
      deficit           = projectedNet - target  // negative = will fall short
    }
  }

  return {
    goal, income, expenses, net, target, saved, pct,
    projectedExpenses, projectedNet, deficit, isCurrentMonth,
  }
}
