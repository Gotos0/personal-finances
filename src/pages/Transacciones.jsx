import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions.js'
import TransactionModal from '../components/TransactionModal.jsx'

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatDayHeader(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatAmount(amount, type) {
  const sign = type === 'income' ? '+' : '-'
  return `${sign}$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function groupByDay(transactions) {
  const groups = {}
  for (const t of transactions) {
    if (!groups[t.date]) groups[t.date] = []
    groups[t.date].push(t)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 4 }, (_, i) => currentYear - i)

export default function Transacciones() {
  const {
    transactions, categories, filters, setFilters,
    addTransaction, editTransaction, removeTransaction,
  } = useTransactions()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const grouped = groupByDay(transactions)

  function openNew() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(t) {
    setEditing(t)
    setModalOpen(true)
  }

  function handleSave(data) {
    if (editing) {
      editTransaction(editing.id, data)
    } else {
      addTransaction(data)
    }
  }

  function handleCloseModal() {
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Transacciones</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nueva transacción
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {/* Type */}
        <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm">
          {[['all', 'Todas'], ['income', 'Ingresos'], ['expense', 'Gastos']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilters(f => ({ ...f, type: val }))}
              className={`px-3 py-1.5 transition-colors ${
                filters.type === val
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          value={filters.categoryId ?? ''}
          onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : null }))}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Month */}
        <select
          value={filters.month}
          onChange={e => setFilters(f => ({ ...f, month: Number(e.target.value) }))}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {MONTHS.map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={filters.year}
          onChange={e => setFilters(f => ({ ...f, year: Number(e.target.value) }))}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {grouped.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl flex flex-col items-center justify-center py-20 gap-2 text-gray-600 text-sm">
          <span>Sin transacciones para este período.</span>
          <button onClick={openNew} className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
            + Registrar la primera
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([date, txs]) => (
            <div key={date}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide capitalize whitespace-nowrap">
                  {formatDayHeader(date)}
                </span>
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-700 shrink-0">{date}</span>
              </div>

              {/* Rows */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800/60">
                {txs.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/40 transition-colors group"
                  >
                    {/* Category avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                      style={{ backgroundColor: t.category_color ?? '#6366f1' }}
                    >
                      {(t.category_name ?? 'S')[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-100 truncate">
                        {t.description || t.category_name || '—'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {t.category_name ?? 'Sin categoría'}
                        {t.payment_method ? ` · ${t.payment_method}` : ''}
                      </p>
                    </div>

                    {/* Amount */}
                    <span className={`text-sm font-semibold shrink-0 tabular-nums ${
                      t.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatAmount(t.amount, t.type)}
                    </span>

                    {/* Actions — visible on hover */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEdit(t)}
                        title="Editar"
                        className="p-1.5 rounded text-gray-500 hover:text-indigo-400 hover:bg-indigo-950/50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(t.id)}
                        title="Eliminar"
                        className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction modal (new / edit) */}
      <TransactionModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        categories={categories}
        initial={editing}
      />

      {/* Confirm delete */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <p className="text-sm text-gray-200">
              ¿Eliminar esta transacción? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { removeTransaction(confirmDelete); setConfirmDelete(null) }}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm py-2 rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
