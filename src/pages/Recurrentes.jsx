import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Play, Power, Bell, CheckCircle2 } from 'lucide-react'
import { useRecurrents } from '../hooks/useRecurrents.js'
import { nextDueDate, daysUntilDue } from '../db/recurrents.js'
import RecurrentModal from '../components/RecurrentModal.jsx'

const FREQ_LABELS = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual',
}

function fmt(n) {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DueBadge({ item, alertDays }) {
  const isActive = item.active === 1 || item.active === true
  if (!isActive) return null

  const days = daysUntilDue(item)
  const isOverdue = days < 0
  const isToday   = days === 0
  const isUpcoming = days > 0 && days <= alertDays

  if (!isOverdue && !isToday && !isUpcoming) return null

  const label = isOverdue ? `Vencido (${Math.abs(days)}d)` : isToday ? 'Hoy' : `En ${days}d`
  const cls = isOverdue || isToday
    ? 'bg-red-900/60 text-red-300 border border-red-700/50'
    : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${cls}`}>
      {label}
    </span>
  )
}

function RecurrentRow({ item, alertDays, onEdit, onDelete, onToggle, onApply }) {
  const isActive = item.active === 1 || item.active === true
  const next = nextDueDate(item)

  return (
    <div className={`flex items-center gap-3 px-4 py-3 group hover:bg-gray-800/40 transition-colors ${!isActive ? 'opacity-40' : ''}`}>
      {/* Type dot */}
      <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${item.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-100 truncate">{item.name}</p>
        <p className="text-xs text-gray-500">
          {FREQ_LABELS[item.frequency]}
          {item.last_applied
            ? ` · Último: ${item.last_applied} · Próximo: ${next}`
            : ` · Primer vencimiento: ${next}`}
        </p>
      </div>

      {/* Due badge */}
      <DueBadge item={item} alertDays={alertDays} />

      {/* Amount */}
      <span className={`text-sm font-semibold shrink-0 tabular-nums ${item.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
        {fmt(item.amount)}
      </span>

      {/* Actions (visible on hover) */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onApply(item)}
          title="Aplicar ahora"
          className="p-1.5 rounded text-gray-500 hover:text-indigo-400 hover:bg-indigo-950/50 transition-colors"
        >
          <Play size={14} />
        </button>
        <button
          onClick={() => onToggle(item.id, !isActive)}
          title={isActive ? 'Desactivar' : 'Activar'}
          className={`p-1.5 rounded transition-colors ${
            isActive
              ? 'text-gray-500 hover:text-amber-400 hover:bg-amber-950/50'
              : 'text-amber-400 hover:bg-amber-950/50'
          }`}
        >
          <Power size={14} />
        </button>
        <button
          onClick={() => onEdit(item)}
          title="Editar"
          className="p-1.5 rounded text-gray-500 hover:text-indigo-400 hover:bg-indigo-950/50 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          title="Eliminar"
          className="p-1.5 rounded text-gray-500 hover:text-red-400 hover:bg-red-950/50 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function Section({ title, items, alertDays, onEdit, onDelete, onToggle, onApply, emptyText }) {
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h2>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-800/60">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-gray-600 text-sm">
            {emptyText}
          </div>
        ) : (
          items.map(item => (
            <RecurrentRow
              key={item.id}
              item={item}
              alertDays={alertDays}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggle={onToggle}
              onApply={onApply}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function Recurrentes() {
  const {
    recurrents, alertDays, setAlertDays,
    autoApplied, dismissAutoApplied,
    addRecurrent, editRecurrent, removeRecurrent, toggleActive, applyNow,
  } = useRecurrents()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [applyFeedback, setApplyFeedback] = useState(null)

  // Auto-dismiss the auto-apply toast after 4 s
  useEffect(() => {
    if (!autoApplied) return
    const t = setTimeout(dismissAutoApplied, 4000)
    return () => clearTimeout(t)
  }, [autoApplied, dismissAutoApplied])

  const incomes  = recurrents.filter(r => r.type === 'income')
  const expenses = recurrents.filter(r => r.type === 'expense')

  function openNew()        { setEditing(null); setModalOpen(true) }
  function openEdit(item)   { setEditing(item); setModalOpen(true) }

  function handleSave(data) {
    if (editing) editRecurrent(editing.id, data)
    else         addRecurrent(data)
  }

  function handleApply(item) {
    applyNow(item)
    setApplyFeedback(item.name)
    setTimeout(() => setApplyFeedback(null), 2500)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <h1 className="text-2xl font-bold text-white">Recurrentes</h1>

        <div className="flex items-center gap-4">
          {/* Alert margin config */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Bell size={14} className="shrink-0" />
            <span className="whitespace-nowrap">Avisar con</span>
            <select
              value={alertDays}
              onChange={e => setAlertDays(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(n => (
                <option key={n} value={n}>{n} día{n > 1 ? 's' : ''}</option>
              ))}
            </select>
            <span className="whitespace-nowrap">de anticipación</span>
          </div>

          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Nuevo recurrente
          </button>
        </div>
      </div>

      {/* Auto-apply startup toast */}
      {autoApplied > 0 && (
        <div
          onClick={dismissAutoApplied}
          className="flex items-start gap-3 bg-indigo-950 border border-indigo-700/50 text-indigo-200 text-sm px-4 py-3 rounded-xl cursor-pointer"
        >
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-indigo-400" />
          <span>
            Se aplicaron automáticamente{' '}
            <strong>{autoApplied} transacción{autoApplied > 1 ? 'es' : ''}</strong>{' '}
            de recurrentes vencidos desde la última vez que abriste la app.
          </span>
        </div>
      )}

      {/* Sections */}
      <Section
        title="Ingresos recurrentes"
        items={incomes}
        alertDays={alertDays}
        onEdit={openEdit}
        onDelete={id => setConfirmDelete(id)}
        onToggle={toggleActive}
        onApply={handleApply}
        emptyText="Sin ingresos recurrentes"
      />
      <Section
        title="Gastos recurrentes"
        items={expenses}
        alertDays={alertDays}
        onEdit={openEdit}
        onDelete={id => setConfirmDelete(id)}
        onToggle={toggleActive}
        onApply={handleApply}
        emptyText="Sin gastos recurrentes"
      />

      {/* Manual apply feedback toast */}
      {applyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-green-800 border border-green-600/50 text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 size={15} className="text-green-300" />
          Transacción creada: <strong>{applyFeedback}</strong>
        </div>
      )}

      {/* Modal */}
      <RecurrentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
      />

      {/* Confirm delete */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <p className="text-sm text-gray-200">
              ¿Eliminar este recurrente? No afecta las transacciones ya aplicadas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { removeRecurrent(confirmDelete); setConfirmDelete(null) }}
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
