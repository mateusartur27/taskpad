import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ClipboardList, LogIn, UserPlus, Loader2, Mail, ArrowLeft } from 'lucide-react'

type AuthMode = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else if (mode === 'register') {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Conta criada! Verifique seu email para confirmar.')
      }
    }
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(
        'Se esse email estiver cadastrado, você receberá um link para redefinir sua senha. Verifique sua caixa de entrada.'
      )
    }
    setLoading(false)
  }

  // Forgot password view
  if (mode === 'forgot') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <ClipboardList size={40} strokeWidth={1.5} />
            <h1>TaskPad</h1>
            <p>Recuperar senha da conta AHUB</p>
          </div>

          <form onSubmit={handleForgotPassword} className="auth-form">
            <div className="input-group">
              <label htmlFor="email">Email da sua conta</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoFocus
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : <Mail size={18} />}
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>

          <button className="btn btn-link" onClick={() => switchMode('login')}>
            <ArrowLeft size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Voltar ao login
          </button>
        </div>
      </div>
    )
  }

  // Login / Register view
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

          {mode === 'login' && (
            <button
              type="button"
              className="btn-forgot"
              onClick={() => switchMode('forgot')}
            >
              Esqueceu a senha?
            </button>
          )}

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <Loader2 size={18} className="spin" />
            ) : mode === 'login' ? (
              <LogIn size={18} />
            ) : (
              <UserPlus size={18} />
            )}
            {mode === 'login' ? 'Entrar com conta AHUB' : 'Criar conta AHUB'}
          </button>
        </form>

        <button
          className="btn btn-link"
          onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login'
            ? 'Não tem conta AHUB? Criar uma'
            : 'Já tem conta AHUB? Entrar'}
        </button>
      </div>
    </div>
  )
}
