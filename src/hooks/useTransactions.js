import { useState, useEffect, useCallback } from 'react'
import { useDB } from './useDB.js'
import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from '../db/transactions.js'
import { listCategories } from '../db/categories.js'

const now = new Date()

export function useTransactions() {
  const { db } = useDB()
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({
    type: 'all',
    categoryId: null,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  const loadTransactions = useCallback(() => {
    if (!db) return
    setTransactions(listTransactions(db, filters))
  }, [db, filters])

  const loadCategories = useCallback(() => {
    if (!db) return
    setCategories(listCategories(db))
  }, [db])

  useEffect(() => { loadTransactions() }, [loadTransactions])
  useEffect(() => { loadCategories() }, [loadCategories])

  const addTransaction = useCallback((data) => {
    if (!db) return
    createTransaction(db, data)
    loadTransactions()
  }, [db, loadTransactions])

  const editTransaction = useCallback((id, data) => {
    if (!db) return
    updateTransaction(db, id, data)
    loadTransactions()
  }, [db, loadTransactions])

  const removeTransaction = useCallback((id) => {
    if (!db) return
    deleteTransaction(db, id)
    loadTransactions()
  }, [db, loadTransactions])

  return { transactions, categories, filters, setFilters, addTransaction, editTransaction, removeTransaction }
}
