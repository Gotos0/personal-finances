export function listTransactions(db, { type, categoryId, year, month } = {}) {
  const conditions = []
  const bind = []

  if (type && type !== 'all') {
    conditions.push('t.type = ?')
    bind.push(type)
  }
  if (categoryId) {
    conditions.push('t.category_id = ?')
    bind.push(categoryId)
  }
  if (year && month) {
    conditions.push("strftime('%Y-%m', t.date) = ?")
    bind.push(`${year}-${String(month).padStart(2, '0')}`)
  } else if (year) {
    conditions.push("strftime('%Y', t.date) = ?")
    bind.push(String(year))
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = []
  db.exec({
    sql: `
      SELECT t.id, t.type, t.amount, t.date, t.description, t.payment_method,
             c.id   AS category_id,
             c.name AS category_name,
             c.color AS category_color,
             c.icon  AS category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ${where}
      ORDER BY t.date DESC, t.created_at DESC
    `,
    bind: bind.length ? bind : undefined,
    rowMode: 'object',
    resultRows: rows,
  })
  return rows
}

export function createTransaction(db, { type, amount, date, categoryId, description, paymentMethod }) {
  db.exec({
    sql: `INSERT INTO transactions (type, amount, date, category_id, description, payment_method)
          VALUES (?, ?, ?, ?, ?, ?)`,
    bind: [type, amount, date, categoryId ?? null, description ?? null, paymentMethod ?? null],
  })
  return db.selectValue('SELECT last_insert_rowid()')
}

export function updateTransaction(db, id, { type, amount, date, categoryId, description, paymentMethod }) {
  db.exec({
    sql: `UPDATE transactions
          SET type=?, amount=?, date=?, category_id=?, description=?, payment_method=?
          WHERE id=?`,
    bind: [type, amount, date, categoryId ?? null, description ?? null, paymentMethod ?? null, id],
  })
}

export function deleteTransaction(db, id) {
  db.exec({ sql: 'DELETE FROM transactions WHERE id=?', bind: [id] })
}
