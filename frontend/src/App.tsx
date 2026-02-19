import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import AppPage from './pages/AppPage'
import { Loader2 } from 'lucide-react'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <Loader2 size={48} className="spin" />
      </div>
    )
  }

  return user ? <AppPage /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
