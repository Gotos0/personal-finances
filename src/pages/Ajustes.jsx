import { useState, useEffect } from 'react'
import { Tag, Download, Upload, Check, AlertTriangle, Trophy } from 'lucide-react'
import { useSavingsGoal } from '../hooks/useSavingsGoal.js'

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

function fmt(n) {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const now = new Date()
const YEAR  = now.getFullYear()
const MONTH = now.getMonth() + 1
const MONTH_LABEL = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

export default function Ajustes() {
  const { progress, saveGoal } = useSavingsGoal(YEAR, MONTH)

  const [goalAmount, setGoalAmount] = useState(() =>
    progress?.goal ? String(progress.goal.target_amount) : ''
  )
  const [goalType, setGoalType] = useState(() =>
    progress?.goal?.target_type ?? 'fixed'
  )
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
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Ajustes</h1>

      <Section title="Categorías">
        <p className="text-sm text-gray-500">Gestiona las categorías de ingresos y gastos.</p>
        <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors">
          <Tag size={15} />
          Administrar categorías
        </button>
      </Section>

      {/* ── Savings goal ───────────────────────────────────────────────────── */}
      <Section title={`Meta de ahorro — ${MONTH_LABEL}`}>
        <p className="text-sm text-gray-500">
          Define cuánto quieres ahorrar este mes. El progreso aparece en el Dashboard en tiempo real.
        </p>

        {/* Form */}
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

        {/* Progress (only when a goal is defined) */}
        {p && (
          <div className="space-y-3 pt-1">
            {/* Progress bar */}
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
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 text-xs">
              <div>
                <span className="text-gray-500">Ahorrado </span>
                <span className="text-gray-200 font-medium tabular-nums">{fmt(p.saved)}</span>
              </div>
              <div>
                <span className="text-gray-500">Meta </span>
                <span className="text-gray-200 font-medium tabular-nums">{fmt(p.target)}</span>
              </div>
              <div>
                <span className="text-gray-500">Ingresos </span>
                <span className="text-gray-200 tabular-nums">{fmt(p.income)}</span>
              </div>
              <div>
                <span className="text-gray-500">Gastos </span>
                <span className="text-gray-200 tabular-nums">{fmt(p.expenses)}</span>
              </div>
            </div>

            {/* Achievement badge */}
            {p.pct >= 100 && (
              <div className="flex items-center gap-2 bg-green-900/40 border border-green-700/50 rounded-lg px-3 py-2">
                <Trophy size={15} className="text-green-400 shrink-0" />
                <span className="text-sm text-green-300">¡Meta alcanzada este mes!</span>
              </div>
            )}

            {/* Deficit alert */}
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

      {/* ── Data ───────────────────────────────────────────────────────────── */}
      <Section title="Datos">
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors">
            <Download size={15} />
            Exportar CSV
          </button>
          <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors">
            <Upload size={15} />
            Importar CSV
          </button>
        </div>
      </Section>
    </div>
  )
}
