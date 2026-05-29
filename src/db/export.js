export function getTransactionsForExport(db, { fromDate, toDate } = {}) {
  const rows = []
  const where = []
  const bind = []
  if (fromDate) { where.push('t.date >= ?'); bind.push(fromDate) }
  if (toDate)   { where.push('t.date <= ?'); bind.push(toDate) }
  const sql = `
    SELECT t.date, t.type, t.amount,
           COALESCE(c.name, 'Sin categoría') AS category,
           COALESCE(t.description, '')        AS description,
           COALESCE(t.payment_method, '')     AS payment_method
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY t.date DESC, t.created_at DESC
  `
  db.exec({ sql, bind, rowMode: 'object', resultRows: rows })
  return rows
}
