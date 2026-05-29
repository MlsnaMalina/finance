import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSupabaseData } from '../hooks/useSupabaseData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { TabId } from '../types'
import { DebtTab } from '../components/DebtTab'
import { PaymentTab } from '../components/PaymentTab'
import { SavingsTab } from '../components/SavingsTab'
import { ExpensesTab } from '../components/ExpensesTab'
import { AppShell } from './AppShell'
import { BackupMenu } from '../components/BackupMenu'
import { QuickAddFAB } from '../components/QuickAddFAB'

export function PrivateApp() {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<TabId>('debts')
  const { debts, setDebts, payments, setPayments, goals, setGoals, expenses, setExpenses, loading } = useSupabaseData(user!.id)
  const [balance, setBalance] = useLocalStorage<number | null>(`finance-balance-${user!.id}`, null)
  const [reserve, setReserve] = useLocalStorage<number | null>(`finance-reserve-${user!.id}`, null)

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
      expenses={expenses}
      headerExtra={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BackupMenu debts={debts} payments={payments} goals={goals} expenses={expenses} onDebtsChange={setDebts} onPaymentsChange={setPayments} onGoalsChange={setGoals} onExpensesChange={setExpenses} />
          <SignOutButton onSignOut={signOut} />
        </div>
      }
    >
      {tab === 'debts' && <DebtTab debts={debts} onDebtsChange={setDebts} />}
      {tab === 'payments' && <PaymentTab payments={payments} onPaymentsChange={setPayments} balance={balance} reserve={reserve} onBalanceChange={setBalance} onReserveChange={setReserve} debts={debts} />}
      {tab === 'savings' && <SavingsTab goals={goals} onGoalsChange={setGoals} />}
      {tab === 'expenses' && <ExpensesTab expenses={expenses} onExpensesChange={setExpenses} />}
      <QuickAddFAB debts={debts} goals={goals} onDebtsChange={setDebts} onGoalsChange={setGoals} />
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
