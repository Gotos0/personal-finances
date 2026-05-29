import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Transferencia', 'Otro']

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function TransactionModal({ open, onClose, onSave, categories, initial = null }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')

  useEffect(() => {
    if (!open) return
    if (initial) {
      setType(initial.type)
      setAmount(String(initial.amount))
      setDate(initial.date)
      setCategoryId(String(initial.category_id ?? ''))
      setDescription(initial.description ?? '')
      setPaymentMethod(initial.payment_method ?? 'Efectivo')
    } else {
      const firstExpense = categories.find(c => c.type === 'expense')
      setType('expense')
      setAmount('')
      setDate(todayISO())
      setCategoryId(firstExpense ? String(firstExpense.id) : '')
      setDescription('')
      setPaymentMethod('Efectivo')
    }
  }, [open, initial]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTypeChange(newType) {
    setType(newType)
    const first = categories.find(c => c.type === newType)
    setCategoryId(first ? String(first.id) : '')
  }

  const filteredCategories = categories.filter(c => c.type === type)

  function handleSubmit(e) {
    e.preventDefault()
    const parsed = Number(amount)
    if (!parsed || parsed <= 0) return
    onSave({
      type,
      amount: parsed,
      date,
      categoryId: categoryId ? Number(categoryId) : null,
      description: description.trim() || null,
      paymentMethod,
    })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">
            {initial ? 'Editar transacción' : 'Nueva transacción'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm font-medium">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-2.5 transition-colors ${
                type === 'expense' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-2.5 transition-colors ${
                type === 'income' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
              }`}
            >
              Ingreso
            </button>
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

          {/* Date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Fecha *</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Categoría</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sin categoría</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">
              Descripción <span className="text-gray-600">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Supermercado del viernes"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Método de pago</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
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
              {initial ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
