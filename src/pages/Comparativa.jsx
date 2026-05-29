import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RTooltip, Cell, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useComparativa } from '../hooks/useComparativa.js'

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS_LIST = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]
const now = new Date()
const YEARS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

// ─── Formatters ──────────────────────────────────────────────────────────────

function fmt(n) {
  return `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function fmtAxis(v) {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(0)}k`
  return `$${v}`
}
function fmtMonthLabel(year, month) {
  return `${MONTHS_LIST[month - 1]} ${year}`
}

// ─── Period selector ─────────────────────────────────────────────────────────

function PeriodSelector({ label, year, month, setYear, setMonth, colorClass }) {
  return (
    <div className="flex-1 min-w-0">
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${colorClass}`}>{label}</p>
      <div className="flex gap-2">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="flex-1 bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {MONTHS_LIST.map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  )
}

// ─── Summary comparison ───────────────────────────────────────────────────────

function DeltaCell({ a, b }) {
  const d = b - a
  if (Math.abs(d) < 0.01) return <span className="text-gray-500 tabular-nums">—</span>
  const positive = d > 0
  return (
    <span className={`tabular-nums font-medium ${positive ? 'text-red-400' : 'text-green-400'}`}>
      {positive ? '+' : ''}{fmt(d)}
    </span>
  )
}

function NetDeltaCell({ a, b }) {
  const d = b - a
  if (Math.abs(d) < 0.01) return <span className="text-gray-500">—</span>
  const positive = d > 0
  return (
    <span className={`tabular-nums font-semibold ${positive ? 'text-green-400' : 'text-red-400'}`}>
      {positive ? '+' : ''}{fmt(d)}
    </span>
  )
}

function SummaryRow({ label, a, b, invert = false }) {
  return (
    <div className="flex items-center py-2.5 border-b border-gray-800 last:border-0 gap-2">
      <span className="flex-1 text-sm text-gray-400">{label}</span>
      <span className="w-28 text-right tabular-nums text-sm text-gray-200">{fmt(a)}</span>
      <span className="w-28 text-right tabular-nums text-sm text-gray-200">{fmt(b)}</span>
      <span className="w-28 text-right text-sm">
        {invert ? <NetDeltaCell a={a} b={b} /> : <DeltaCell a={a} b={b} />}
      </span>
    </div>
  )
}

// ─── Category table ───────────────────────────────────────────────────────────

function CategoryTable({ data, labelA, labelB }) {
  if (!data.length) {
    return (
      <p className="text-sm text-gray-600 py-8 text-center">Sin gastos en ninguno de los dos períodos.</p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 uppercase tracking-wide">
            <th className="text-left pb-3 font-medium">Categoría</th>
            <th className="text-right pb-3 font-medium">{labelA}</th>
            <th className="text-right pb-3 font-medium">{labelB}</th>
            <th className="text-right pb-3 font-medium">Variación $</th>
            <th className="text-right pb-3 font-medium">Variación %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/60">
          {data.map((r, i) => {
            const reduced = r.delta < -0.01
            const increased = r.delta > 0.01
            const deltaClass = reduced ? 'text-green-400' : increased ? 'text-red-400' : 'text-gray-500'
            return (
              <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="text-gray-200 truncate max-w-[140px]">{r.name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right tabular-nums text-gray-400">
                  {r.totalA > 0 ? fmt(r.totalA) : <span className="text-gray-700">—</span>}
                </td>
                <td className="py-2.5 text-right tabular-nums text-gray-400">
                  {r.totalB > 0 ? fmt(r.totalB) : <span className="text-gray-700">—</span>}
                </td>
                <td className={`py-2.5 text-right tabular-nums font-medium ${deltaClass}`}>
                  {Math.abs(r.delta) > 0.01
                    ? `${r.delta > 0 ? '+' : ''}${fmt(r.delta)}`
                    : <span className="text-gray-700">—</span>}
                </td>
                <td className={`py-2.5 text-right tabular-nums font-medium ${deltaClass}`}>
                  {r.pct !== null
                    ? (
                      <span className="flex items-center justify-end gap-1">
                        {reduced ? <TrendingDown size={12} /> : increased ? <TrendingUp size={12} /> : <Minus size={12} />}
                        {r.pct > 0 ? '+' : ''}{r.pct}%
                      </span>
                    )
                    : <span className="text-gray-700">—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Recharts custom tooltips ─────────────────────────────────────────────────

function CompTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1 font-medium truncate max-w-[160px]">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

function HistTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const net = payload[0]?.value ?? 0
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      <p className={net >= 0 ? 'text-green-400' : 'text-red-400'}>Neto: {fmt(net)}</p>
    </div>
  )
}

// ─── Comparativa page ─────────────────────────────────────────────────────────

export default function Comparativa() {
  const {
    yearA, monthA, setYearA, setMonthA,
    yearB, monthB, setYearB, setMonthB,
    totalsA, totalsB, comparison, history,
  } = useComparativa()

  const labelA = fmtMonthLabel(yearA, monthA)
  const labelB = fmtMonthLabel(yearB, monthB)

  // Data for the grouped bar chart — only show categories with data in at least one period
  const barData = comparison
    .filter(r => r.totalA > 0 || r.totalB > 0)
    .slice(0, 8)  // limit to top 8 for readability
    .map(r => ({ name: r.name.length > 10 ? r.name.slice(0, 9) + '…' : r.name, a: r.totalA, b: r.totalB }))

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-2xl font-bold text-white">Comparativa</h1>

      {/* Period selectors */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex flex-wrap items-end gap-4">
          <PeriodSelector
            label="Período A"
            year={yearA} month={monthA}
            setYear={setYearA} setMonth={setMonthA}
            colorClass="text-indigo-400"
          />
          <span className="text-gray-600 font-bold text-lg pb-2 px-2">vs</span>
          <PeriodSelector
            label="Período B"
            year={yearB} month={monthB}
            setYear={setYearB} setMonth={setMonthB}
            colorClass="text-violet-400"
          />
        </div>
      </div>

      {/* Summary comparison table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Resumen comparativo</h2>
        {/* Column headers */}
        <div className="flex items-center gap-2 mb-1">
          <span className="flex-1" />
          <span className="w-28 text-right text-xs font-semibold text-indigo-400 uppercase tracking-wide">
            {labelA}
          </span>
          <span className="w-28 text-right text-xs font-semibold text-violet-400 uppercase tracking-wide">
            {labelB}
          </span>
          <span className="w-28 text-right text-xs text-gray-600 uppercase tracking-wide">
            Diferencia
          </span>
        </div>
        <SummaryRow label="Ingresos"    a={totalsA.income}   b={totalsB.income}   />
        <SummaryRow label="Gastos"      a={totalsA.expenses} b={totalsB.expenses} />
        <SummaryRow label="Ahorro neto" a={totalsA.net}      b={totalsB.net}      invert />
      </div>

      {/* Category comparison table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Variación por categoría</h2>
        <CategoryTable data={comparison} labelA={labelA} labelB={labelB} />
      </div>

      {/* Grouped bar chart */}
      {barData.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Gastos por categoría — A vs B</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="25%">
                <CartesianGrid vertical={false} stroke="#1f2937" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtAxis}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={52}
                />
                <RTooltip content={<CompTooltip />} cursor={{ fill: '#ffffff06' }} />
                <Legend
                  formatter={(v) => (
                    <span className="text-xs text-gray-400">
                      {v === 'a' ? labelA : labelB}
                    </span>
                  )}
                  wrapperStyle={{ paddingTop: 8 }}
                />
                <Bar dataKey="a" name="a" fill="#6366f1" radius={[3,3,0,0]} maxBarSize={16} />
                <Bar dataKey="b" name="b" fill="#8b5cf6" radius={[3,3,0,0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 6-month savings histogram */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-1">Ahorro neto — últimos 6 meses</h2>
        <p className="text-xs text-gray-600 mb-4">Ingresos menos gastos por mes. Verde = positivo, rojo = negativo.</p>
        {history.every(h => h.net === 0) ? (
          <p className="text-sm text-gray-600 py-8 text-center">Sin datos de los últimos 6 meses.</p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid vertical={false} stroke="#1f2937" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tickFormatter={fmtAxis}
                  tick={{ fill: '#6b7280', fontSize: 10 }}
                  axisLine={false} tickLine={false} width={52}
                />
                <RTooltip content={<HistTooltip />} cursor={{ fill: '#ffffff06' }} />
                <Bar dataKey="net" radius={[4,4,0,0]} maxBarSize={40}>
                  {history.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.net > 0 ? '#22c55e' : d.net < 0 ? '#ef4444' : '#374151'}
                      fillOpacity={d.net === 0 ? 0.4 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
