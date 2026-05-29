export default function Comparativa() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Comparativa</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-72 flex items-center justify-center text-gray-600 text-sm">
          Comparativa mes a mes (próximamente)
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-72 flex items-center justify-center text-gray-600 text-sm">
          Distribución por categoría (próximamente)
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-64 flex items-center justify-center text-gray-600 text-sm">
        Tendencia anual (próximamente)
      </div>
    </div>
  )
}
