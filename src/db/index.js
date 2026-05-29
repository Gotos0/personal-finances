import { CREATE_TABLES, DEFAULT_CATEGORIES } from './schema.js'

let dbInstance = null
let initPromise = null

async function initDB() {
  if (dbInstance) return dbInstance

  const { default: sqlite3InitModule } = await import('@sqlite.org/sqlite-wasm')
  const sqlite3 = await sqlite3InitModule()

  let db
  if (sqlite3.capi.sqlite3_vfs_find('opfs')) {
    db = new sqlite3.oo1.OpfsDb('/financetrack.sqlite3')
    console.log('✅ SQLite corriendo con OPFS (persistente)')
  } else {
    db = new sqlite3.oo1.DB('/financetrack.sqlite3', 'ct')
    console.log('⚠️ SQLite corriendo en memoria (sin OPFS)')
  }

  db.exec(CREATE_TABLES)

  const count = db.selectValue('SELECT COUNT(*) FROM categories')
  if (count === 0) {
    for (const cat of DEFAULT_CATEGORIES) {
      db.exec({
        sql: 'INSERT INTO categories (name, color, icon, type) VALUES (?, ?, ?, ?)',
        bind: [cat.name, cat.color, cat.icon, cat.type],
      })
    }
  }

  dbInstance = db
  return dbInstance
}

export { initDB }
