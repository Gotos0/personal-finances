import { useState, useEffect } from 'react'
import { Tag, Download, Upload, Check } from 'lucide-react'
import { useDB } from '../hooks/useDB.js'
import { getSavingsGoal, upsertSavingsGoal } from '../db/dashboard.js'

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

const now = new Date()

export default function Ajustes() {
  const { db } = useDB()
  const [goalAmount, setGoalAmount] = useState('')
  const [goalType, setGoalType]     = useState('fixed')
  const [saved, setSaved]           = useState(false)

  // Load existing goal for the current month on mount
  useEffect(() => {
    if (!db) return
    const goal = getSavingsGoal(db, now.getFullYear(), now.getMonth() + 1)
    if (goal) {
      setGoalAmount(String(goal.target_amount))
      setGoalType(goal.target_type)
    }
  }, [db])

  function handleSaveGoal(e) {
    e.preventDefault()
    const parsed = Number(goalAmount)
    if (!db || !parsed || parsed <= 0) return
    upsertSavingsGoal(db, now.getFullYear(), now.getMonth() + 1, parsed, goalType)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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

      <Section title={`Meta de ahorro — ${now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`}>
        <p className="text-sm text-gray-500">
          Define cuánto quieres ahorrar este mes. Se muestra como progreso en el Dashboard.
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
      </Section>

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
