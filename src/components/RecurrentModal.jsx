import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const FREQUENCIES = [
  { value: 'daily',   label: 'Diario' },
  { value: 'weekly',  label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'yearly',  label: 'Anual' },
]

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function RecurrentModal({ open, onClose, onSave, initial = null }) {
  const [type, setType] = useState('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState('monthly')
  const [startDate, setStartDate] = useState(todayISO())

  useEffect(() => {
    if (!open) return
    if (initial) {
      setType(initial.type)
      setName(initial.name)
      setAmount(String(initial.amount))
      setFrequency(initial.frequency)
      setStartDate(initial.start_date)
    } else {
      setType('expense')
      setName('')
      setAmount('')
      setFrequency('monthly')
      setStartDate(todayISO())
    }
  }, [open, initial])

  function handleSubmit(e) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!name.trim() || !parsed || parsed <= 0) return
    onSave({ type, name: name.trim(), amount: parsed, frequency, startDate })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">
            {initial ? 'Editar recurrente' : 'Nuevo recurrente'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm font-medium">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 transition-colors ${
                type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 transition-colors ${
                type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nombre *</label>
            <input
              type="text"
              required
              placeholder="Ej. Netflix, Salario, Gym"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Monto *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Frecuencia *</label>
            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {FREQUENCIES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Fecha de inicio *</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {initial ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
