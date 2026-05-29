import { useState, useEffect } from 'react'

// Module-level pub/sub: any hook that mutates transactions calls notify(),
// and any hook that reads data subscribes via useTransactionVersion().
const listeners = new Set()
let version = 0

export function notifyTransactionChange() {
  version++
  listeners.forEach(fn => fn(version))
}

export function useTransactionVersion() {
  const [v, setV] = useState(version)
  useEffect(() => {
    listeners.add(setV)
    return () => listeners.delete(setV)
  }, [])
  return v
}
