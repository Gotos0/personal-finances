import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Balance"
          value="$0.00"
          icon={Wallet}
          color="bg-indigo-600/20 text-indigo-400"
        />
        <StatCard
          label="Ingresos del mes"
          value="$0.00"
          icon={TrendingUp}
          color="bg-green-600/20 text-green-400"
        />
        <StatCard
          label="Gastos del mes"
          value="$0.00"
          icon={TrendingDown}
          color="bg-red-600/20 text-red-400"
        />
        <StatCard
          label="Meta de ahorro"
          value="—"
          icon={Target}
          color="bg-amber-600/20 text-amber-400"
        />
      </div>

      {/* Placeholders para gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-64 flex items-center justify-center text-gray-600 text-sm">
          Gráfica de gastos por categoría (próximamente)
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-64 flex items-center justify-center text-gray-600 text-sm">
          Evolución mensual (próximamente)
        </div>
      </div>
    </div>
  )
}
