import { useState } from 'react'
import type { TabId, Debt, RecurringPayment } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { DebtTab } from './components/DebtTab'
import { PaymentTab } from './components/PaymentTab'
import { DEBT_COLORS, PAYMENT_COLORS } from './utils/formatters'

const SAMPLE_DEBTS: Debt[] = [
  {
    id: 'sample-1',
    name: 'Půjčka od banky',
    totalAmount: 120000,
    paidAmount: 45000,
    color: DEBT_COLORS[0],
    payments: [
      { id: 'p1', amount: 15000, date: '2024-11-01', note: 'Listopadová splátka' },
      { id: 'p2', amount: 15000, date: '2024-12-01', note: 'Prosincová splátka' },
      { id: 'p3', amount: 15000, date: '2025-01-01', note: 'Ledová splátka' },
    ],
    archived: false,
    createdAt: '2024-10-01',
    description: 'Spotřebitelský úvěr',
  },
  {
    id: 'sample-2',
    name: 'Dluh kamarádce',
    totalAmount: 8500,
    paidAmount: 3000,
    color: DEBT_COLORS[1],
    payments: [
      { id: 'p4', amount: 3000, date: '2025-01-15' },
    ],
    archived: false,
    createdAt: '2024-12-01',
  },
]

const SAMPLE_PAYMENTS: RecurringPayment[] = [
  { id: 'sp1', name: 'Claude Pro', amount: 549, color: PAYMENT_COLORS[0], frequency: 'monthly', dayOfMonth: 5, category: 'Předplatné', active: true },
  { id: 'sp2', name: 'Netflix', amount: 329, color: PAYMENT_COLORS[1], frequency: 'monthly', dayOfMonth: 12, category: 'Předplatné', active: true },
  { id: 'sp3', name: 'Spotify', amount: 169, color: PAYMENT_COLORS[3], frequency: 'monthly', dayOfMonth: 18, category: 'Předplatné', active: true },
  { id: 'sp4', name: 'Pojištění domácnosti', amount: 4800, color: PAYMENT_COLORS[4], frequency: 'yearly', dayOfMonth: 15, monthOfYear: 3, category: 'Pojištění', active: true },
  { id: 'sp5', name: 'Mobilní tarif', amount: 699, color: PAYMENT_COLORS[2], frequency: 'monthly', dayOfMonth: 20, category: 'Ostatní', active: true },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('debts')
  const [debts, setDebts] = useLocalStorage<Debt[]>('finance-debts', SAMPLE_DEBTS)
  const [payments, setPayments] = useLocalStorage<RecurringPayment[]>('finance-payments', SAMPLE_PAYMENTS)

  const activeDebts = debts.filter(d => !d.archived)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Background gradient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -150,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 70%)',
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7, 8, 14, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--violet), var(--rose))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(167,139,250,0.3)',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 2" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
              Finance
            </span>
          </div>

          {/* Tab switcher */}
          <nav style={{ display: 'flex', gap: 2, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
            <TabButton active={tab === 'debts'} onClick={() => setTab('debts')} badge={activeDebts.length > 0 ? activeDebts.length : undefined}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6" strokeDasharray="3 2" />
                <path d="M8 5v3l1.5 1.5" />
              </svg>
              Dluhy
            </TabButton>
            <TabButton active={tab === 'payments'} onClick={() => setTab('payments')} badge={payments.filter(p => p.active).length > 0 ? payments.filter(p => p.active).length : undefined}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="3" width="12" height="12" rx="2" />
                <path d="M11 1v4M5 1v4M2 7h12" />
              </svg>
              Platby
            </TabButton>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          {tab === 'debts' ? (
            <DebtTab debts={debts} onDebtsChange={setDebts} />
          ) : (
            <PaymentTab payments={payments} onPaymentsChange={setPayments} />
          )}
        </div>
      </main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '7px 16px',
        borderRadius: 6,
        fontSize: 13,
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        background: active ? 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.12))' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        border: active ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
        transition: 'all 0.2s',
        position: 'relative',
      }}
    >
      {children}
      {badge !== undefined && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: active ? 'var(--violet)' : 'var(--border-active)',
          color: active ? 'white' : 'var(--text-secondary)',
          fontSize: 10,
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}
