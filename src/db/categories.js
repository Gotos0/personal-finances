export function listCategories(db) {
  const rows = []
  db.exec({
    sql: 'SELECT id, name, color, icon, type FROM categories ORDER BY type, name',
    rowMode: 'object',
    resultRows: rows,
  })
  return rows
}

export function createCategory(db, { name, color, icon, type }) {
  db.exec({
    sql: 'INSERT INTO categories (name, color, icon, type) VALUES (?, ?, ?, ?)',
    bind: [name.trim(), color, icon, type],
  })
}

export function updateCategory(db, id, { name, color, icon }) {
  db.exec({
    sql: 'UPDATE categories SET name=?, color=?, icon=? WHERE id=?',
    bind: [name.trim(), color, icon, id],
  })
}

export function deleteCategory(db, id) {
  const count = db.selectValue(
    'SELECT COUNT(*) FROM transactions WHERE category_id=?', [id],
  )
  if (count > 0) {
    throw new Error(
      `Esta categoría tiene ${count} transacción${count === 1 ? '' : 'es'} asociada${count === 1 ? '' : 's'} y no puede eliminarse.`
    )
  }
  db.exec({ sql: 'DELETE FROM categories WHERE id=?', bind: [id] })
}
