import { Plus } from 'lucide-react'

export default function Transacciones() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Transacciones</h1>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />
          Nueva transacción
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Todos los tipos</option>
          <option>Ingresos</option>
          <option>Gastos</option>
        </select>
        <select className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>Este mes</option>
          <option>Mes anterior</option>
          <option>Últimos 3 meses</option>
        </select>
      </div>

      {/* Tabla / lista vacía */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800 grid grid-cols-[1fr_auto_auto_auto] gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <span>Descripción</span>
          <span>Categoría</span>
          <span>Fecha</span>
          <span className="text-right">Monto</span>
        </div>
        <div className="flex items-center justify-center py-16 text-gray-600 text-sm">
          Sin transacciones. ¡Añade la primera!
        </div>
      </div>
    </div>
  )
}
