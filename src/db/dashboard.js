function monthStr(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function getMonthTotals(db, year, month) {
  const ms = monthStr(year, month)
  const rows = []
  db.exec({
    sql: `SELECT type, COALESCE(SUM(amount), 0) AS total
          FROM transactions
          WHERE strftime('%Y-%m', date) = ?
          GROUP BY type`,
    bind: [ms],
    rowMode: 'object',
    resultRows: rows,
  })
  let income = 0, expenses = 0
  for (const r of rows) {
    if (r.type === 'income') income = r.total
    else if (r.type === 'expense') expenses = r.total
  }
  const balance = db.selectValue(
    `SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END), 0)
     FROM transactions`
  ) ?? 0
  return { income, expenses, net: income - expenses, balance }
}

export function getDailyFlow(db, year, month) {
  const ms = monthStr(year, month)
  const rows = []
  db.exec({
    sql: `SELECT CAST(strftime('%d', date) AS INTEGER) AS day,
                 type, SUM(amount) AS total
          FROM transactions
          WHERE strftime('%Y-%m', date) = ?
          GROUP BY day, type
          ORDER BY day`,
    bind: [ms],
    rowMode: 'object',
    resultRows: rows,
  })
  const daysInMonth = new Date(year, month, 0).getDate()
  const byDay = {}
  for (let d = 1; d <= daysInMonth; d++) byDay[d] = { day: d, income: 0, expense: 0 }
  for (const r of rows) byDay[r.day][r.type] = r.total
  return Object.values(byDay)
}

export function getCategoryDistribution(db, year, month) {
  const ms = monthStr(year, month)
  const rows = []
  db.exec({
    sql: `SELECT COALESCE(c.name, 'Sin categoría') AS name,
                 COALESCE(c.color, '#6366f1')       AS color,
                 SUM(t.amount)                       AS total
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE strftime('%Y-%m', t.date) = ?
            AND t.type = 'expense'
          GROUP BY t.category_id
          ORDER BY total DESC`,
    bind: [ms],
    rowMode: 'object',
    resultRows: rows,
  })
  return rows
}

export function getTopExpenses(db, year, month, limit = 5) {
  const ms = monthStr(year, month)
  const rows = []
  db.exec({
    sql: `SELECT t.id, t.amount, t.date, t.description,
                 COALESCE(c.name,  'Sin categoría') AS category_name,
                 COALESCE(c.color, '#6366f1')        AS category_color
          FROM transactions t
          LEFT JOIN categories c ON t.category_id = c.id
          WHERE strftime('%Y-%m', t.date) = ?
            AND t.type = 'expense'
          ORDER BY t.amount DESC
          LIMIT ?`,
    bind: [ms, limit],
    rowMode: 'object',
    resultRows: rows,
  })
  return rows
}

export function getSavingsGoal(db, year, month) {
  const rows = []
  db.exec({
    sql: 'SELECT target_amount, target_type FROM saving_goals WHERE year=? AND month=? LIMIT 1',
    bind: [year, month],
    rowMode: 'object',
    resultRows: rows,
  })
  return rows[0] ?? null
}

export function upsertSavingsGoal(db, year, month, targetAmount, targetType) {
  db.exec({ sql: 'DELETE FROM saving_goals WHERE year=? AND month=?', bind: [year, month] })
  db.exec({
    sql: 'INSERT INTO saving_goals (year, month, target_amount, target_type) VALUES (?, ?, ?, ?)',
    bind: [year, month, targetAmount, targetType],
  })
}
