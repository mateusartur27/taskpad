import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ClipboardList, LogIn, UserPlus, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <ClipboardList size={40} strokeWidth={1.5} />
          <h1>TaskPad</h1>
          <p>Gerencie suas tarefas com a simplicidade de um bloco de notas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : isLogin ? (
              <LogIn size={18} />
            ) : (
              <UserPlus size={18} />
            )}
            {isLogin ? 'Entrar com conta AHUB' : 'Criar conta AHUB'}
          </button>
        </form>

        <button
          className="btn btn-link"
          onClick={() => {
            setIsLogin(!isLogin)
            setError('')
            setSuccess('')
          }}
        >
          {isLogin ? 'Não tem conta AHUB? Criar uma' : 'Já tem conta AHUB? Entrar'}
        </button>
      </div>
    </div>
  )
}
