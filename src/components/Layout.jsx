import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  RefreshCw,
  BarChart2,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme.js'

const nav = [
  { to: '/',             label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { to: '/recurrentes',  label: 'Recurrentes',   icon: RefreshCw },
  { to: '/comparativa',  label: 'Comparativa',   icon: BarChart2 },
  { to: '/ajustes',      label: 'Ajustes',       icon: Settings },
]

export default function Layout() {
  useTheme() // reads saved theme from DB and applies html.light class
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 bg-gray-900 border-r border-gray-800 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
          <TrendingUp className="text-indigo-400" size={22} />
          <span className="text-base font-semibold tracking-tight text-white">
            FinanceTrack
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100',
                ].join(' ')
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800 text-xs text-gray-600">
          v0.1.0
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
