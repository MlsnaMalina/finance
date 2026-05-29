import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseData } from '../hooks/useSupabaseData'
import type { TabId } from '../types'
import { DebtTab } from '../components/DebtTab'
import { PaymentTab } from '../components/PaymentTab'
import { SavingsTab } from '../components/SavingsTab'
import { AppShell } from './AppShell'

export function PrivateApp() {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<TabId>('debts')
  const { debts, setDebts, payments, setPayments, goals, setGoals, loading } = useSupabaseData(user!.id)

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      debts={debts}
      payments={payments}
      goals={goals}
      headerExtra={<SignOutButton onSignOut={signOut} />}
    >
      {tab === 'debts' && <DebtTab debts={debts} onDebtsChange={setDebts} />}
      {tab === 'payments' && <PaymentTab payments={payments} onPaymentsChange={setPayments} />}
      {tab === 'savings' && <SavingsTab goals={goals} onGoalsChange={setGoals} />}
    </AppShell>
  )
}

function SignOutButton({ onSignOut }: { onSignOut: () => void }) {
  return (
    <button
      onClick={onSignOut}
      title="Odhlásit se"
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontFamily: 'var(--font-body)',
        color: 'var(--text-secondary)', background: 'transparent',
        border: '1px solid var(--border)', borderRadius: 8,
        padding: '6px 12px', cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = 'var(--text-primary)'
        e.currentTarget.style.borderColor = 'var(--border-active)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-secondary)'
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M10 11l3-3-3-3M13 8H6" />
      </svg>
      Odhlásit
    </button>
  )
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--violet), var(--rose))',
          margin: '0 auto 16px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
          Načítám tvoje data…
        </p>
      </div>
    </div>
  )
}
