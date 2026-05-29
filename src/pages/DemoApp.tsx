import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TabId, Debt, RecurringPayment, SavingsGoal } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DebtTab } from '../components/DebtTab'
import { PaymentTab } from '../components/PaymentTab'
import { SavingsTab } from '../components/SavingsTab'
import { DEBT_COLORS, PAYMENT_COLORS, SAVINGS_COLORS } from '../utils/formatters'
import { AppShell } from './AppShell'
import { BackupMenu } from '../components/BackupMenu'

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
    payments: [{ id: 'p4', amount: 3000, date: '2025-01-15' }],
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

const SAMPLE_GOALS: SavingsGoal[] = [
  {
    id: 'sg1',
    name: 'Dovolená v Itálii',
    targetAmount: 45000,
    savedAmount: 32400,
    color: SAVINGS_COLORS[0],
    emoji: '✈️',
    deposits: [
      { id: 'sd1', amount: 5000, date: '2025-01-15', note: 'Leden' },
      { id: 'sd2', amount: 8000, date: '2025-02-15', note: 'Únor' },
      { id: 'sd3', amount: 7000, date: '2025-03-15' },
      { id: 'sd4', amount: 6000, date: '2025-04-15' },
      { id: 'sd5', amount: 6400, date: '2025-05-15' },
    ],
    archived: false,
    createdAt: '2025-01-01',
    description: 'Léto 2026',
  },
  {
    id: 'sg2',
    name: 'Nový laptop',
    targetAmount: 35000,
    savedAmount: 8750,
    color: SAVINGS_COLORS[1],
    emoji: '💻',
    deposits: [
      { id: 'sd6', amount: 3000, date: '2025-03-01' },
      { id: 'sd7', amount: 2750, date: '2025-04-01' },
      { id: 'sd8', amount: 3000, date: '2025-05-01' },
    ],
    archived: false,
    createdAt: '2025-03-01',
  },
  {
    id: 'sg3',
    name: 'Finanční rezerva',
    targetAmount: 100000,
    savedAmount: 28000,
    color: SAVINGS_COLORS[2],
    emoji: '🛡️',
    deposits: [
      { id: 'sd9', amount: 10000, date: '2025-01-01' },
      { id: 'sd10', amount: 10000, date: '2025-02-01' },
      { id: 'sd11', amount: 8000, date: '2025-03-01' },
    ],
    archived: false,
    createdAt: '2025-01-01',
  },
]

export function DemoApp() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabId>('debts')
  const [debts, setDebts] = useLocalStorage<Debt[]>('demo-finance-debts-v2', SAMPLE_DEBTS)
  const [payments, setPayments] = useLocalStorage<RecurringPayment[]>('demo-finance-payments-v2', SAMPLE_PAYMENTS)
  const [goals, setGoals] = useLocalStorage<SavingsGoal[]>('demo-finance-goals-v2', SAMPLE_GOALS)
  const [balance, setBalance] = useLocalStorage<number | null>('demo-finance-balance', null)
  const [reserve, setReserve] = useLocalStorage<number | null>('demo-finance-reserve', null)

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      debts={debts}
      payments={payments}
      goals={goals}
      headerExtra={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BackupMenu debts={debts} payments={payments} goals={goals} onDebtsChange={setDebts} onPaymentsChange={setPayments} onGoalsChange={setGoals} />
          <DemoBadge onLogin={() => navigate('/')} />
        </div>
      }
    >
      {tab === 'debts' && <DebtTab debts={debts} onDebtsChange={setDebts} />}
      {tab === 'payments' && <PaymentTab payments={payments} onPaymentsChange={setPayments} balance={balance} reserve={reserve} onBalanceChange={setBalance} onReserveChange={setReserve} />}
      {tab === 'savings' && <SavingsTab goals={goals} onGoalsChange={setGoals} />}
    </AppShell>
  )
}

function DemoBadge({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        fontSize: 11, fontFamily: 'var(--font-body)',
        color: 'var(--text-secondary)',
        background: 'rgba(167,139,250,0.1)',
        border: '1px solid rgba(167,139,250,0.25)',
        borderRadius: 20, padding: '3px 10px', letterSpacing: '0.04em',
      }}>
        Demo verze
      </span>
      <button
        onClick={onLogin}
        style={{
          fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600,
          color: 'var(--violet)', background: 'transparent', border: 'none',
          cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(167,139,250,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        Přihlásit se →
      </button>
    </div>
  )
}
