import { useState } from 'react'
import {
  TrendingUp, TrendingDown, Wallet, Target,
  ChevronLeft, ChevronRight, Plus, Trophy,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, PieChart, Pie, Cell,
} from 'recharts'
import { useDashboardStats } from '../hooks/useDashboardStats.js'
import { useCategories } from '../hooks/useCategories.js'
import { useDB } from '../hooks/useDB.js'
import { createTransaction } from '../db/transactions.js'
import { notifyTransactionChange } from '../hooks/useTransactionBus.js'
import TransactionModal from '../components/TransactionModal.jsx'

// ─── Formatters ──────────────────────────────────────────────────────────────

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function fmt(n) {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtAxis(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`
  return `$${v}`
}

// ─── Stat cards ──────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, colorClass, valueClass }) {
  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
      <div className={`p-3 rounded-lg shrink-0 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide truncate">{label}</p>
        <p className={`text-xl font-semibold tabular-nums truncate ${valueClass ?? 'text-white'}`}>{value}</p>
      </div>
    </div>
  )
}

function SavingsCard({ goal, income, net }) {
  if (!goal) {
    return (
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
        <div className="p-3 rounded-lg bg-gray-800 text-gray-600 shrink-0"><Target size={20} /></div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Meta de ahorro</p>
          <p className="text-sm text-gray-600 mt-0.5">Sin meta definida</p>
        </div>
      </div>
    )
  }
  const target = goal.target_type === 'fixed'
    ? goal.target_amount
    : income * goal.target_amount / 100
  const saved  = Math.max(net, 0)
  const pct    = target > 0 ? Math.min(Math.round(saved / target * 100), 100) : 0
  const done   = pct >= 100

  return (
    <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-3 rounded-lg shrink-0 ${done ? 'bg-green-600/20 text-green-400' : 'bg-amber-600/20 text-amber-400'}`}>
          {done ? <Trophy size={20} /> : <Target size={20} />}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Meta de ahorro</p>
          <p className={`text-xl font-semibold tabular-nums ${done ? 'text-green-400' : 'text-white'}`}>
            {pct}%
          </p>
        </div>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${done ? 'bg-green-400' : 'bg-amber-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{fmt(saved)} / {fmt(target)}</p>
    </div>
  )
}

// ─── Custom chart tooltips ────────────────────────────────────────────────────

function FlowTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1 font-medium">Día {label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.dataKey === 'income' ? 'Ingresos' : 'Gastos'}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-gray-200">{d.name}</p>
      <p style={{ color: d.color }}>{fmt(d.total)}</p>
    </div>
  )
}

// ─── Charts ──────────────────────────────────────────────────────────────────

function DailyFlowChart({ data }) {
  const hasData = data.some(d => d.income > 0 || d.expense > 0)
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-sm">
        Sin movimientos en este período
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#1f2937" />
        <XAxis
          dataKey="day"
          interval={4}
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtAxis}
          tick={{ fill: '#6b7280', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <RTooltip content={<FlowTooltip />} cursor={{ fill: '#ffffff08' }} />
        <Bar dataKey="income"  fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={10} />
        <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={10} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function CategoryDonut({ data, totalExpenses }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600 text-sm">
        Sin gastos categorizados
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full">
      {/* Chart */}
      <div className="relative flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="52%"
              outerRadius="78%"
              dataKey="total"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <RTooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-base font-semibold text-white tabular-nums">{fmt(totalExpenses)}</p>
          <p className="text-xs text-gray-500">en gastos</p>
        </div>
      </div>
      {/* Legend */}
      <div className="mt-2 space-y-1 overflow-y-auto max-h-28 pr-1">
        {data.map((d, i) => {
          const pct = totalExpenses > 0 ? Math.round(d.total / totalExpenses * 100) : 0
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
              <span className="flex-1 truncate text-gray-400">{d.name}</span>
              <span className="text-gray-500 tabular-nums">{pct}%</span>
              <span className="text-gray-300 tabular-nums">{fmt(d.total)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Top 5 ───────────────────────────────────────────────────────────────────

function TopExpenses({ items }) {
  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-600 text-sm">
        Sin gastos registrados en este período
      </div>
    )
  }
  return (
    <div className="divide-y divide-gray-800/60">
      {items.map((t, i) => (
        <div key={t.id} className="flex items-center gap-3 py-3">
          <span className="text-xs font-bold text-gray-600 w-4 shrink-0">{i + 1}</span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ backgroundColor: t.category_color }}
          >
            {t.category_name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-100 truncate">{t.description || t.category_name}</p>
            <p className="text-xs text-gray-500">{t.category_name} · {t.date}</p>
          </div>
          <span className="text-sm font-semibold text-red-400 shrink-0 tabular-nums">
            -{fmt(t.amount)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Dashboard page ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const {
    year, month, prevMonth, nextMonth, isCurrentMonth,
    totals, dailyFlow, categoryDist, topExpenses, savingsGoal,
  } = useDashboardStats()

  const { db } = useDB()
  const { categories } = useCategories()
  const [fabOpen, setFabOpen] = useState(false)

  function handleQuickAdd(data) {
    if (!db) return
    createTransaction(db, data)
    notifyTransactionChange()
  }

  const netPositive = totals.net >= 0

  return (
    <div className="space-y-5 pb-24">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-gray-200 w-36 text-center select-none">
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Ingresos del mes"
          value={fmt(totals.income)}
          icon={TrendingUp}
          colorClass="bg-green-600/20 text-green-400"
        />
        <StatCard
          label="Gastos del mes"
          value={fmt(totals.expenses)}
          icon={TrendingDown}
          colorClass="bg-red-600/20 text-red-400"
        />
        <StatCard
          label="Balance neto"
          value={fmt(totals.net)}
          icon={Wallet}
          colorClass={netPositive ? 'bg-indigo-600/20 text-indigo-400' : 'bg-red-600/20 text-red-400'}
          valueClass={netPositive ? 'text-white' : 'text-red-400'}
        />
        <SavingsCard goal={savingsGoal} income={totals.income} net={totals.net} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily flow */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-300">Flujo diario</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />
                Ingresos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
                Gastos
              </span>
            </div>
          </div>
          <div className="h-52">
            <DailyFlowChart data={dailyFlow} />
          </div>
        </div>

        {/* Category donut */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Gastos por categoría</h2>
          <div className="h-52">
            <CategoryDonut data={categoryDist} totalExpenses={totals.expenses} />
          </div>
        </div>
      </div>

      {/* Top 5 expenses */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-1">Top 5 gastos del mes</h2>
        <TopExpenses items={topExpenses} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setFabOpen(true)}
        title="Agregar gasto rápido"
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        <Plus size={26} />
      </button>

      {/* Quick-add modal */}
      <TransactionModal
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        onSave={handleQuickAdd}
        categories={categories}
      />
    </div>
  )
}
