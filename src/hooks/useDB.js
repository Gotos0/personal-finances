import { useState, useEffect } from 'react'
import { initDB } from '../db/index.js'

let dbInstance = null
let initPromise = null

export function useDB() {
  const [db, setDb] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Si ya existe una instancia, la reutiliza sin reinicializar
    if (dbInstance) {
      setDb(dbInstance)
      setLoading(false)
      return
    }

    // Si ya hay una inicialización en curso, espera a que termine
    if (!initPromise) {
      initPromise = initDB()
    }

    initPromise
      .then((database) => {
        dbInstance = database
        setDb(database)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error al inicializar la base de datos:', err)
        setError(err)
        setLoading(false)
      })
  }, [])

  return { db, loading, error }
}