export function listCategories(db) {
  const rows = []
  db.exec({
    sql: 'SELECT id, name, color, icon, type FROM categories ORDER BY type, name',
    rowMode: 'object',
    resultRows: rows,
  })
  return rows
}
