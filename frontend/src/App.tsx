import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import AppPage from './pages/AppPage'
import { Loader2 } from 'lucide-react'
import ResetPasswordPage from './pages/ResetPasswordPage'

function AppContent() {
  const { user, loading } = useAuth()
  
  // Check if we're on the reset password route
  const isResetPasswordRoute = 
    window.location.search.includes('page=reset-password') || 
    (window.location.hash.includes('access_token') && window.location.hash.includes('type=recovery'))

  if (isResetPasswordRoute) {
    return <ResetPasswordPage />
  }

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
