import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X, Eye, EyeOff, KeyRound, Loader2, Check } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function ChangePasswordModal({ onClose }: Props) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => onClose(), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <KeyRound size={20} />
            <h2>Alterar Senha</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p className="modal-description">
          Esta senha é da sua <strong>conta AHUB</strong>. Ao alterá-la, ela será
          atualizada em todos os apps do ecossistema.
        </p>

        {success ? (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} />
            Senha alterada com sucesso!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="input-group">
              <label htmlFor="new-password">Nova senha</label>
              <div className="input-with-toggle">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  required
                  minLength={6}
                  autoFocus
                />
                <button
                  type="button"
                  className="input-toggle-btn"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirm-password">Confirmar nova senha</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="repita a senha"
                required
                minLength={6}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
              {loading ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
