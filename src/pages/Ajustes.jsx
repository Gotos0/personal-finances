import { useState, useEffect } from 'react'
import {
  Check, AlertTriangle, Trophy, Plus, Pencil, Trash2,
  Sun, Moon, Download, X,
  Utensils, Car, Gamepad2, Heart, Home, Briefcase, Laptop,
  ShoppingCart, Plane, GraduationCap, Coffee, Dumbbell,
  Shirt, Smartphone, Music, Gift, Wrench, PiggyBank, Zap,
  DollarSign, Tag,
} from 'lucide-react'
import { unparse } from 'papaparse'
import { useSavingsGoal } from '../hooks/useSavingsGoal.js'
import { useCategories } from '../hooks/useCategories.js'
import { useTheme } from '../hooks/useTheme.js'
import { useDB } from '../hooks/useDB.js'
import { getSetting, setSetting } from '../db/settings.js'
import { getTransactionsForExport } from '../db/export.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const now = new Date()
const YEAR        = now.getFullYear()
const MONTH       = now.getMonth() + 1
const MONTH_LABEL = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
const MONTHS_LIST = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const EXPORT_YEARS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

function fmt(n) {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Icon registry ────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { id: 'utensils',        Icon: Utensils },
  { id: 'car',             Icon: Car },
  { id: 'gamepad',         Icon: Gamepad2 },
  { id: 'heart',           Icon: Heart },
  { id: 'home',            Icon: Home },
  { id: 'briefcase',       Icon: Briefcase },
  { id: 'laptop',          Icon: Laptop },
  { id: 'shopping-cart',   Icon: ShoppingCart },
  { id: 'plane',           Icon: Plane },
  { id: 'graduation-cap',  Icon: GraduationCap },
  { id: 'coffee',          Icon: Coffee },
  { id: 'dumbbell',        Icon: Dumbbell },
  { id: 'shirt',           Icon: Shirt },
  { id: 'smartphone',      Icon: Smartphone },
  { id: 'music',           Icon: Music },
  { id: 'gift',            Icon: Gift },
  { id: 'wrench',          Icon: Wrench },
  { id: 'piggy-bank',      Icon: PiggyBank },
  { id: 'zap',             Icon: Zap },
  { id: 'dollar-sign',     Icon: DollarSign },
  { id: 'tag',             Icon: Tag },
]

const ICON_MAP = Object.fromEntries(ICON_OPTIONS.map(o => [o.id, o.Icon]))

function CatIcon({ icon, color, size = 15 }) {
  const Icon = ICON_MAP[icon] ?? Tag
  return <Icon size={size} style={{ color }} />
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function IconPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1">
      {ICON_OPTIONS.map(({ id, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
            value === id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}

function CategoryForm({ name, setName, color, setColor, icon, setIcon, onSave, onCancel, saveLabel = 'Guardar' }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 space-y-3 border border-gray-700">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre de categoría"
          className="flex-1 bg-gray-700 border border-gray-600 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="shrink-0" title="Color">
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-10 h-9 rounded-lg cursor-pointer border border-gray-600 bg-transparent p-0.5"
          />
        </div>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1.5">Icono</p>
        <IconPicker value={icon} onChange={setIcon} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors">
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!name.trim()}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm rounded-lg transition-colors"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}

function DeleteDialog({ cat, onConfirm, onCancel, error }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Eliminar categoría</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-300">
            <X size={18} />
          </button>
        </div>

        {error ? (
          <div className="flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5 mb-4">
            <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-4">
            ¿Eliminar{' '}
            <span className="text-white font-medium">"{cat.name}"</span>?
            Esta acción no se puede deshacer.
          </p>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {error ? 'Cerrar' : 'Cancelar'}
          </button>
          {!error && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Section: Categorías ──────────────────────────────────────────────────────

function CategorySection() {
  const { categories, create, update, remove } = useCategories()
  const [tab, setTab] = useState('expense')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#6366f1')
  const [editIcon, setEditIcon] = useState('tag')
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addColor, setAddColor] = useState('#6366f1')
  const [addIcon, setAddIcon] = useState('tag')
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, name, error }

  const filtered = categories.filter(c => c.type === tab)

  function startEdit(cat) {
    setShowAdd(false)
    setEditId(cat.id)
    setEditName(cat.name)
    setEditColor(cat.color)
    setEditIcon(cat.icon)
  }

  function cancelEdit() { setEditId(null) }

  function saveEdit() {
    update(editId, { name: editName, color: editColor, icon: editIcon })
    setEditId(null)
  }

  function switchTab(t) {
    setTab(t)
    setEditId(null)
    setShowAdd(false)
  }

  function openAdd() {
    setEditId(null)
    setAddName('')
    setAddColor('#6366f1')
    setAddIcon('tag')
    setShowAdd(true)
  }

  function saveAdd() {
    if (!addName.trim()) return
    create({ name: addName, color: addColor, icon: addIcon, type: tab })
    setShowAdd(false)
  }

  function attemptDelete() {
    try {
      remove(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err) {
      setDeleteTarget(prev => ({ ...prev, error: err.message }))
    }
  }

  return (
    <Section title="Categorías">
      {/* Type tabs */}
      <div className="flex gap-1 p-1 bg-gray-800 rounded-lg w-fit">
        {[{ v: 'expense', l: 'Gastos' }, { v: 'income', l: 'Ingresos' }].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => switchTab(v)}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
              tab === v ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {filtered.length === 0 && !showAdd && (
          <p className="text-sm text-gray-600 py-3 text-center">
            Sin categorías de {tab === 'expense' ? 'gasto' : 'ingreso'}.
          </p>
        )}

        {filtered.map(cat => (
          editId === cat.id ? (
            <CategoryForm
              key={cat.id}
              name={editName} setName={setEditName}
              color={editColor} setColor={setEditColor}
              icon={editIcon} setIcon={setEditIcon}
              onSave={saveEdit} onCancel={cancelEdit}
            />
          ) : (
            <div
              key={cat.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/30 group"
            >
              <span
                className="w-7 h-7 flex items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: cat.color + '22' }}
              >
                <CatIcon icon={cat.icon} color={cat.color} />
              </span>
              <span className="flex-1 text-sm text-gray-200">{cat.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(cat)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteTarget({ id: cat.id, name: cat.name, error: null })}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          )
        ))}

        {showAdd && (
          <CategoryForm
            name={addName} setName={setAddName}
            color={addColor} setColor={setAddColor}
            icon={addIcon} setIcon={setAddIcon}
            onSave={saveAdd} onCancel={() => setShowAdd(false)}
            saveLabel="Crear"
          />
        )}
      </div>

      {!showAdd && editId === null && (
        <button
          onClick={openAdd}
          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <Plus size={14} />
          Nueva {tab === 'expense' ? 'categoría de gasto' : 'categoría de ingreso'}
        </button>
      )}

      {deleteTarget && (
        <DeleteDialog
          cat={deleteTarget}
          error={deleteTarget.error}
          onConfirm={attemptDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </Section>
  )
}

// ─── Section: Meta de ahorro ──────────────────────────────────────────────────

function SavingsGoalSection() {
  const { progress, saveGoal } = useSavingsGoal(YEAR, MONTH)
  const [goalAmount, setGoalAmount] = useState('')
  const [goalType, setGoalType] = useState('fixed')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (progress?.goal) {
      setGoalAmount(String(progress.goal.target_amount))
      setGoalType(progress.goal.target_type)
    }
  }, [progress])

  function handleSaveGoal(e) {
    e.preventDefault()
    const parsed = Number(goalAmount)
    if (!parsed || parsed <= 0) return
    saveGoal(parsed, goalType)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const p = progress
  const hasDeficit = p != null && p.deficit != null && p.deficit < 0

  return (
    <Section title={`Meta de ahorro — ${MONTH_LABEL}`}>
      <p className="text-sm text-gray-500">
        Define cuánto quieres ahorrar este mes. El progreso aparece en el Dashboard en tiempo real.
      </p>

      <form onSubmit={handleSaveGoal} className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="block text-xs text-gray-500 mb-1">
            {goalType === 'fixed' ? 'Monto ($)' : 'Porcentaje (%) del ingreso'}
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder={goalType === 'fixed' ? '5000' : '20'}
            value={goalAmount}
            onChange={e => setGoalAmount(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={goalType}
          onChange={e => setGoalType(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="fixed">Monto fijo</option>
          <option value="percent">Porcentaje</option>
        </select>
        <button
          type="submit"
          className={`flex items-center gap-1.5 text-white text-sm px-4 py-2 rounded-lg transition-colors ${
            saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {saved && <Check size={14} />}
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </form>

      {p && (
        <div className="space-y-3 pt-1">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Progreso del mes</span>
              <span className={`text-xs font-semibold ${p.pct >= 100 ? 'text-green-400' : 'text-gray-300'}`}>
                {p.pct}%
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${p.pct >= 100 ? 'bg-green-400' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min(p.pct, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs">
            <div><span className="text-gray-500">Ahorrado </span><span className="text-gray-200 font-medium tabular-nums">{fmt(p.saved)}</span></div>
            <div><span className="text-gray-500">Meta </span><span className="text-gray-200 font-medium tabular-nums">{fmt(p.target)}</span></div>
            <div><span className="text-gray-500">Ingresos </span><span className="text-gray-200 tabular-nums">{fmt(p.income)}</span></div>
            <div><span className="text-gray-500">Gastos </span><span className="text-gray-200 tabular-nums">{fmt(p.expenses)}</span></div>
          </div>

          {p.pct >= 100 && (
            <div className="flex items-center gap-2 bg-green-900/40 border border-green-700/50 rounded-lg px-3 py-2">
              <Trophy size={15} className="text-green-400 shrink-0" />
              <span className="text-sm text-green-300">¡Meta alcanzada este mes!</span>
            </div>
          )}

          {p.isCurrentMonth && hasDeficit && p.pct < 100 && (
            <div className="flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5">
              <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-300 space-y-0.5">
                <p className="font-medium">Déficit proyectado</p>
                <p className="text-red-400/80 text-xs">
                  Al ritmo actual de gasto terminarás el mes con un neto de{' '}
                  <span className="font-semibold">{fmt(p.projectedNet)}</span>,{' '}
                  <span className="font-semibold">{fmt(Math.abs(p.deficit))}</span> por debajo de tu meta de{' '}
                  <span className="font-semibold">{fmt(p.target)}</span>.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}

// ─── Section: Alertas de recurrentes ─────────────────────────────────────────

function AlertSection() {
  const { db } = useDB()
  const [days, setDays] = useState(3)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!db) return
    setDays(Number(getSetting(db, 'alert_days_before', '3')))
  }, [db])

  function handleSave() {
    if (!db) return
    setSetting(db, 'alert_days_before', String(days))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Section title="Alertas de recurrentes">
      <p className="text-sm text-gray-500">
        Días de anticipación para alertar cuando un recurrente está próximo a aplicarse.
      </p>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="1"
          max="7"
          value={days}
          onChange={e => setDays(Math.min(7, Math.max(1, Number(e.target.value))))}
          className="w-20 bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-400">días antes</span>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 text-white text-sm px-4 py-2 rounded-lg transition-colors ${
            saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          {saved && <Check size={14} />}
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>
    </Section>
  )
}

// ─── Section: Exportar datos ──────────────────────────────────────────────────

function ExportSection() {
  const { db } = useDB()
  const [mode, setMode] = useState('month')
  const [year, setYear] = useState(YEAR)
  const [month, setMonth] = useState(MONTH)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [exporting, setExporting] = useState(false)

  function handleExport() {
    if (!db) return
    setExporting(true)

    let fromD, toD
    if (mode === 'month') {
      const mm = String(month).padStart(2, '0')
      const lastDay = new Date(year, month, 0).getDate()
      fromD = `${year}-${mm}-01`
      toD   = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`
    } else {
      fromD = fromDate || undefined
      toD   = toDate   || undefined
    }

    const rows = getTransactionsForExport(db, { fromDate: fromD, toDate: toD })

    const csvRows = rows.map(r => ({
      Fecha:             r.date,
      Tipo:              r.type === 'income' ? 'Ingreso' : 'Gasto',
      Monto:             r.amount,
      Categoría:         r.category,
      Descripción:       r.description,
      'Método de pago':  r.payment_method,
    }))

    const csv  = unparse(csvRows)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = mode === 'month'
      ? `financetrack-${year}-${String(month).padStart(2, '0')}.csv`
      : `financetrack-exportacion.csv`
    a.click()
    URL.revokeObjectURL(url)

    setTimeout(() => setExporting(false), 1000)
  }

  const canExport = mode === 'month' || (fromDate && toDate && fromDate <= toDate)

  return (
    <Section title="Exportar datos">
      <p className="text-sm text-gray-500">
        Descarga el historial de transacciones en formato CSV (compatible con Excel).
      </p>

      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-800 rounded-lg w-fit">
        {[{ v: 'month', l: 'Mes completo' }, { v: 'range', l: 'Rango personalizado' }].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setMode(v)}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              mode === v ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Period selector */}
      {mode === 'month' ? (
        <div className="flex gap-2 flex-wrap">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {MONTHS_LIST.map((name, i) => (
              <option key={i} value={i + 1}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {EXPORT_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      ) : (
        <div className="flex gap-2 items-center flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={!canExport || exporting}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
      >
        <Download size={15} />
        {exporting ? 'Exportando...' : 'Exportar CSV'}
      </button>
    </Section>
  )
}

// ─── Section: Tema visual ─────────────────────────────────────────────────────

function ThemeSection() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  return (
    <Section title="Tema visual">
      <p className="text-sm text-gray-500">
        Cambia entre modo oscuro y modo claro. La preferencia se guarda automáticamente.
      </p>
      <button
        onClick={toggle}
        className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 transition-colors"
      >
        <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${isLight ? 'bg-indigo-600' : 'bg-gray-600'}`}>
          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${isLight ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <div className="flex items-center gap-2">
          {isLight
            ? <><Sun size={16} className="text-yellow-400" /><span className="text-sm text-gray-200">Modo claro</span></>
            : <><Moon size={16} className="text-indigo-400" /><span className="text-sm text-gray-200">Modo oscuro</span></>
          }
        </div>
      </button>
    </Section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Ajustes() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Ajustes</h1>
      <CategorySection />
      <SavingsGoalSection />
      <AlertSection />
      <ExportSection />
      <ThemeSection />
    </div>
  )
}
