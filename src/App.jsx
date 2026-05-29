import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useDB } from './hooks/useDB.js'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transacciones from './pages/Transacciones.jsx'
import Recurrentes from './pages/Recurrentes.jsx'
import Comparativa from './pages/Comparativa.jsx'
import Ajustes from './pages/Ajustes.jsx'

function App() {
  const { loading, error } = useDB()

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
      <p className="text-lg">Iniciando base de datos...</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-red-400">
      <p className="text-lg">Error al iniciar la base de datos: {error.message}</p>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transacciones" element={<Transacciones />} />
          <Route path="recurrentes" element={<Recurrentes />} />
          <Route path="comparativa" element={<Comparativa />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
