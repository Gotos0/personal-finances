import { useState, useEffect, useCallback } from 'react'
import { useDB } from './useDB.js'
import { notifyTransactionChange, useTransactionVersion } from './useTransactionBus.js'
import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from '../db/transactions.js'
import { listCategories } from '../db/categories.js'

const now = new Date()

export function useTransactions() {
  const { db } = useDB()
  const version = useTransactionVersion()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    type: 'all',
    categoryId: null,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  // Re-query whenever db, filters, or version (global mutation signal) change
  useEffect(() => {
    if (!db) return
    setTransactions(listTransactions(db, filters))
  }, [db, version, filters])

  useEffect(() => {
    if (!db) return
    setCategories(listCategories(db))
  }, [db])

  const addTransaction = useCallback((data) => {
    if (!db) return
    createTransaction(db, data)
    notifyTransactionChange()
  }, [db])

  const editTransaction = useCallback((id, data) => {
    if (!db) return
    updateTransaction(db, id, data)
    notifyTransactionChange()
  }, [db])

  const removeTransaction = useCallback((id) => {
    if (!db) return
    deleteTransaction(db, id)
    notifyTransactionChange()
  }, [db])

  return { transactions, categories, filters, setFilters, addTransaction, editTransaction, removeTransaction }
}
