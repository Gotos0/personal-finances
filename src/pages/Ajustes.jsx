import { Tag, Download, Upload } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

export default function Ajustes() {
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

      <Section title="Meta de ahorro mensual">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Monto o porcentaje</label>
            <input
              type="number"
              placeholder="0"
              className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="fixed">Monto fijo</option>
            <option value="percent">Porcentaje</option>
          </select>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            Guardar
          </button>
        </div>
      </Section>

      <Section title="Datos">
        <div className="flex gap-3">
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
