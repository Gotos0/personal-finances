import { useState, useEffect } from 'react'

let dbInstance = null
let initPromise = null

async function initDB() {
  if (dbInstance) return dbInstance

  const { default: sqlite3InitModule } = await import('@sqlite.org/sqlite-wasm')

  const sqlite3 = await sqlite3InitModule()

  if (sqlite3.capi.sqlite3_vfs_find('opfs')) {
    dbInstance = new sqlite3.oo1.OpfsDb('/financetrack.sqlite3')
    console.log('✅ SQLite corriendo con OPFS (persistente)')
  } else {
    dbInstance = new sqlite3.oo1.DB('/financetrack.sqlite3', 'ct')
    console.log('⚠️ SQLite corriendo en memoria (sin OPFS)')
  }

  return dbInstance
}

export { initDB }