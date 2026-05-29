import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { DemoApp } from './pages/DemoApp'
import { PrivateApp } from './pages/PrivateApp'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      <Route path="/demo" element={<DemoApp />} />
      <Route
        path="/"
        element={session ? <Navigate to="/app" replace /> : <LoginPage />}
      />
      <Route
        path="/app"
        element={session ? <PrivateApp /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
