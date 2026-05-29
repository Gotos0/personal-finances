import { useDB } from './hooks/useDB.js'

function App() {
  const { db, loading, error } = useDB()

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
    <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
      <p className="text-lg">✅ Base de datos lista</p>
    </div>
  )
}

export default App