import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      setLoading(false)
      if (error) {
        setError('Nesprávný email nebo heslo.')
      } else {
        navigate('/app')
      }
    } else {
      const { error } = await signUp(email, password)
      setLoading(false)
      if (error) {
        setError(error)
      } else {
        setSuccess('Účet vytvořen! Zkontroluj email pro potvrzení, pak se přihlaš.')
        setMode('login')
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, right: -100, width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--violet), var(--rose))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(167,139,250,0.35)',
          }}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 5v3l2 2" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
            color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em',
          }}>
            Finance
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 14, marginTop: 6 }}>
            {mode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                display: 'block', fontFamily: 'var(--font-body)', fontSize: 12,
                color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.03em',
              }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tvuj@email.cz"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 14px', borderRadius: 10,
                  background: 'var(--card)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14,
                  outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--violet)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontFamily: 'var(--font-body)', fontSize: 12,
                color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.03em',
              }}>
                HESLO
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 14px', borderRadius: 10,
                  background: 'var(--card)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: 14,
                  outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--violet)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && (
              <p style={{
                color: '#F87171', fontFamily: 'var(--font-body)', fontSize: 13,
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 8, padding: '8px 12px', margin: 0,
              }}>
                {error}
              </p>
            )}

            {success && (
              <p style={{
                color: 'var(--emerald)', fontFamily: 'var(--font-body)', fontSize: 13,
                background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)',
                borderRadius: 8, padding: '8px 12px', margin: 0,
              }}>
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4, padding: '12px', borderRadius: 10,
                background: loading ? 'var(--border-active)' : 'linear-gradient(135deg, var(--violet), #8B5CF6)',
                color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(167,139,250,0.35)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? '…' : mode === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
            </button>
          </div>
        </form>

        {/* Mode toggle */}
        <p style={{ textAlign: 'center', marginTop: 20, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
          {mode === 'login' ? 'Ještě nemáš účet?' : 'Už máš účet?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setSuccess(null) }}
            style={{ color: 'var(--violet)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, padding: 0 }}
          >
            {mode === 'login' ? 'Registrovat se' : 'Přihlásit se'}
          </button>
        </p>

        {/* Demo link */}
        <p style={{ textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
          Chceš ukázat aplikaci?{' '}
          <a
            href="/demo"
            style={{ color: 'var(--violet)', textDecoration: 'none', fontWeight: 500 }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Otevřít demo verzi
          </a>
        </p>
      </div>
    </div>
  )
}
