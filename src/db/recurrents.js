export function listRecurrents(db) {
  const rows = []
  db.exec({
    sql: 'SELECT * FROM recurrents ORDER BY type, name',
    rowMode: 'object',
    resultRows: rows,
  })
  return rows
}

export function createRecurrent(db, { name, type, amount, frequency, startDate }) {
  db.exec({
    sql: 'INSERT INTO recurrents (name, type, amount, frequency, start_date) VALUES (?, ?, ?, ?, ?)',
    bind: [name, type, amount, frequency, startDate],
  })
  return db.selectValue('SELECT last_insert_rowid()')
}

export function updateRecurrent(db, id, { name, type, amount, frequency, startDate }) {
  db.exec({
    sql: 'UPDATE recurrents SET name=?, type=?, amount=?, frequency=?, start_date=? WHERE id=?',
    bind: [name, type, amount, frequency, startDate, id],
  })
}

export function deleteRecurrent(db, id) {
  db.exec({ sql: 'DELETE FROM recurrents WHERE id=?', bind: [id] })
}

export function toggleRecurrentActive(db, id, active) {
  db.exec({
    sql: 'UPDATE recurrents SET active=? WHERE id=?',
    bind: [active ? 1 : 0, id],
  })
}

// Creates a transaction from this recurrent and stamps last_applied = today.
export function applyRecurrentNow(db, recurrent) {
  const today = new Date().toISOString().slice(0, 10)
  db.exec({
    sql: `INSERT INTO transactions (type, amount, date, description)
          VALUES (?, ?, ?, ?)`,
    bind: [recurrent.type, recurrent.amount, today, recurrent.name],
  })
  db.exec({
    sql: 'UPDATE recurrents SET last_applied=? WHERE id=?',
    bind: [today, recurrent.id],
  })
}
