// ─── Date utilities ──────────────────────────────────────────────────────────

function localDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addPeriod(dateStr, frequency) {
  const date = localDate(dateStr)
  switch (frequency) {
    case 'daily':   date.setDate(date.getDate() + 1); break
    case 'weekly':  date.setDate(date.getDate() + 7); break
    case 'monthly': date.setMonth(date.getMonth() + 1); break
    case 'yearly':  date.setFullYear(date.getFullYear() + 1); break
  }
  return toISO(date)
}

// Returns 'YYYY-MM-DD' of the next occurrence not yet applied.
// When last_applied is null the first due date IS start_date itself.
export function nextDueDate(recurrent) {
  if (!recurrent.last_applied) return recurrent.start_date
  return addPeriod(recurrent.last_applied, recurrent.frequency)
}

// Positive = days until due, 0 = due today, negative = overdue.
export function daysUntilDue(recurrent) {
  const next = nextDueDate(recurrent)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((localDate(next) - today) / 86400000)
}

// ─── Auto-apply ──────────────────────────────────────────────────────────────

// Applies every period that is due today or earlier for all active recurrents.
// Uses the actual due date as the transaction date (not today) so the history
// is accurate when the user has not opened the app for several cycles.
// Returns the total number of transactions created.
export function autoApplyDue(db, recurrents) {
  const todayStr = toISO(new Date())
  let count = 0

  for (const r of recurrents) {
    if (r.active !== 1 && r.active !== true) continue

    let dueDate = nextDueDate(r)

    while (dueDate <= todayStr) {
      db.exec({
        sql: `INSERT INTO transactions (type, amount, date, description)
              VALUES (?, ?, ?, ?)`,
        bind: [r.type, r.amount, dueDate, r.name],
      })
      db.exec({
        sql: 'UPDATE recurrents SET last_applied=? WHERE id=?',
        bind: [dueDate, r.id],
      })
      r.last_applied = dueDate          // advance local copy for next iteration
      dueDate = addPeriod(dueDate, r.frequency)
      count++
    }
  }

  return count
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

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

// Manual "apply now": always uses today as the transaction date.
export function applyRecurrentNow(db, recurrent) {
  const today = toISO(new Date())
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
