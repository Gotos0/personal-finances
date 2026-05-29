export function getSetting(db, key, defaultValue = null) {
  const val = db.selectValue('SELECT value FROM settings WHERE key=?', [key])
  return val ?? defaultValue
}

export function setSetting(db, key, value) {
  db.exec({
    sql: `INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    bind: [key, String(value)],
  })
}
