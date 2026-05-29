import type { ReactNode } from 'react'
import type { TabId, Debt, RecurringPayment, SavingsGoal } from '../types'

interface AppShellProps {
  tab: TabId
  onTabChange: (tab: TabId) => void
  debts: Debt[]
  payments: RecurringPayment[]
  goals: SavingsGoal[]
  headerExtra?: ReactNode
  children: ReactNode
}

export function AppShell({ tab, onTabChange, debts, payments, goals, headerExtra, children }: AppShellProps) {
  const activeDebts = debts.filter(d => !d.archived)
  const activeGoals = goals.filter(g => !g.archived)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Background blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, right: -100, width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.06) 0%, transparent 70%)',
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7, 8, 14, 0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--violet), var(--rose))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(167,139,250,0.3)',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12l4-5 3 3 5-7" />
                <path d="M11 3h3v3" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
              Finance
            </span>
          </div>

          {/* Center: tab switcher */}
          <nav style={{ display: 'flex', gap: 2, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 3 }}>
            <TabButton active={tab === 'debts'} onClick={() => onTabChange('debts')} badge={activeDebts.length > 0 ? activeDebts.length : undefined}>
              {/* Anchor — weight of financial obligation */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="4" r="2" />
                <path d="M5.5 6h5" />
                <path d="M8 6v8" />
                <path d="M4.5 12a4 4 0 0 0 7 0" />
              </svg>
              Dluhy
            </TabButton>
            <TabButton active={tab === 'payments'} onClick={() => onTabChange('payments')} badge={payments.filter(p => p.active).length > 0 ? payments.filter(p => p.active).length : undefined}>
              {/* Two rotating arrows — recurring cycle */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 3.5A6 6 0 0 1 14 8" />
                <path d="M14 6v2h-2" />
                <path d="M12 12.5A6 6 0 0 1 2 8" />
                <path d="M2 10v-2h2" />
              </svg>
              Platby
            </TabButton>
            <TabButton active={tab === 'savings'} onClick={() => onTabChange('savings')} badge={activeGoals.length > 0 ? activeGoals.length : undefined}>
              {/* Rising bars — accumulation of savings */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 13V9.5" />
                <path d="M8 13V5.5" />
                <path d="M13 13V2" />
                <path d="M1.5 13h13" />
              </svg>
              Spoření
            </TabButton>
          </nav>

          {/* Right: extra slot */}
          <div>
            {headerExtra}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

function TabButton({
  active, onClick, children, badge,
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
        display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px',
        borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600,
        background: active ? 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.12))' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        border: active ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
        transition: 'all 0.2s', position: 'relative',
      }}
    >
      {children}
      {badge !== undefined && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 18, height: 18, borderRadius: '50%',
          background: active ? 'var(--violet)' : 'var(--border-active)',
          color: active ? 'white' : 'var(--text-secondary)',
          fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 500,
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}
