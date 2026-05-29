import { Plus } from 'lucide-react'

export default function Recurrentes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Recurrentes</h1>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />
          Nuevo recurrente
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tarjeta vacía de ejemplo */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-center text-gray-600 text-sm h-32">
          Sin ingresos recurrentes
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-center text-gray-600 text-sm h-32">
          Sin gastos recurrentes
        </div>
      </div>
    </div>
  )
}
