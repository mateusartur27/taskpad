import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff, KeyRound, Loader2, Check, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setChecking(false)
        return
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setChecking(false)
          subscription.unsubscribe()
        }
      })

      const timeout = setTimeout(() => {
        subscription.unsubscribe()
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) window.location.href = '/'
          else setChecking(false)
        })
      }, 5000)

      return () => {
        clearTimeout(timeout)
        subscription.unsubscribe()
      }
    }

    init()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      await supabase.auth.signOut()
      
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="spin" color="#1a73e8" />
          <p style={{ marginTop: '16px', color: '#666', fontWeight: 500 }}>Validando seu acesso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)' }}>
      <div className="auth-card" style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <div className="auth-header">
          <div className="auth-icon-wrapper" style={{ background: '#1a73e8', marginBottom: '20px' }}>
            <KeyRound size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>Redefinir Senha</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Crie uma nova senha segura para sua conta AHUB</p>
        </div>

        {success ? (
          <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 16px', gap: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ background: '#16a34a', color: 'white', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={24} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Senha Atualizada!</h3>
              <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: '1.5' }}>Sua nova senha já está valendo para todos os seus aplicativos.</p>
            </div>
            <button 
              onClick={() => window.location.href = '/'} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px' }}
            >
              Fazer Login Agora
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" style={{ gap: '20px' }}>
            {error && <div className="alert alert-error" style={{ fontSize: '14px' }}>{error}</div>}

            <div className="input-group">
              <label style={{ fontWeight: 600, fontSize: '14px' }}>Nova senha</label>
              <div className="input-with-toggle">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  autoFocus
                  style={{ height: '44px' }}
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label style={{ fontWeight: 600, fontSize: '14px' }}>Confirmar nova senha</label>
              <div className="input-with-toggle">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ height: '44px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '48px', fontSize: '16px' }}>
              {loading ? <Loader2 size={20} className="spin" /> : <Check size={20} />}
              {loading ? 'Salvando...' : 'Confirmar Nova Senha'}
            </button>

            <button 
              type="button"
              onClick={() => window.location.href = '/'}
              className="btn-forgot"
              style={{ textAlign: 'center', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#6b7280' }}
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
