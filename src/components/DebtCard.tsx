import { useState } from 'react'
import type { Debt } from '../types'
import { DonutChart } from './DonutChart'
import { formatCurrency, formatDate } from '../utils/formatters'
import { AddPaymentModal } from './AddPaymentModal'

interface DebtCardProps {
  debt: Debt
  onUpdate: (debt: Debt) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  index: number
}

export function DebtCard({ debt, onUpdate, onArchive, onDelete, index }: DebtCardProps) {
  const [showPayment, setShowPayment] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const pct = debt.totalAmount > 0 ? Math.min(debt.paidAmount / debt.totalAmount, 1) : 0
  const remaining = Math.max(debt.totalAmount - debt.paidAmount, 0)
  const isComplete = debt.paidAmount >= debt.totalAmount

  return (
    <>
      <div
        className="animate-fade-up"
        style={{
          animationDelay: `${index * 80}ms`,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          position: 'relative',
          transition: 'border-color 0.2s, background 0.2s',
          overflow: 'hidden',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-active)'
          ;(e.currentTarget as HTMLElement).style.background = 'var(--card-hover)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLElement).style.background = 'var(--card)'
        }}
      >
        {/* Glow blob */}
        <div style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: debt.color,
          opacity: 0.06,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {debt.name}
            </h3>
            {debt.description && (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', opacity: 0.7 }}>{debt.description}</p>
            )}
          </div>
          <div style={{ position: 'relative', marginLeft: 8 }}>
            <button
              onClick={() => setShowMenu(m => !m)}
              className="btn-ghost"
              style={{ padding: '4px 8px', borderRadius: 6 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-active)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  zIndex: 10,
                  minWidth: 160,
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {!isComplete && (
                  <button
                    onClick={() => { setShowMenu(false); onArchive(debt.id) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 13, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6.5h12v8H2z" />
                      <path d="M1 3.5h14v3H1z" />
                      <path d="M8 9.5v3M6.5 11l1.5 1.5L9.5 11" />
                    </svg>
                    Archivovat
                  </button>
                )}
                <button
                  onClick={() => { setShowMenu(false); onDelete(debt.id) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', color: 'var(--red)', fontSize: 13, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" strokeLinecap="round"/></svg>
                  Smazat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Donut + Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <DonutChart paid={debt.paidAmount} total={debt.totalAmount} color={debt.color} size={140} strokeWidth={13} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 22,
                fontWeight: 500,
                color: debt.color,
                letterSpacing: '-0.03em',
                lineHeight: 1,
              }}>
                {Math.round(pct * 100)}%
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>splaceno</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <StatRow label="Celkem" value={formatCurrency(debt.totalAmount)} />
            <StatRow label="Splaceno" value={formatCurrency(debt.paidAmount)} color={debt.color} />
            <StatRow label="Zbývá" value={formatCurrency(remaining)} emphasis />
          </div>
        </div>

        {/* Recent payments */}
        {debt.payments.length > 0 && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Poslední splátky</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[...debt.payments].reverse().slice(0, 3).map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatDate(p.date)}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: debt.color }}>
                    +{formatCurrency(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add payment button */}
        {!isComplete && (
          <button
            onClick={() => setShowPayment(true)}
            style={{
              marginTop: 16,
              width: '100%',
              padding: '10px',
              border: `1px solid ${debt.color}33`,
              borderRadius: 'var(--radius-sm)',
              color: debt.color,
              fontSize: 13,
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              background: `${debt.color}0A`,
              transition: 'background 0.2s, border-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = `${debt.color}18`
              ;(e.currentTarget as HTMLElement).style.borderColor = `${debt.color}66`
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = `${debt.color}0A`
              ;(e.currentTarget as HTMLElement).style.borderColor = `${debt.color}33`
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            Zadat splátku
          </button>
        )}

        {isComplete && (
          <div style={{
            marginTop: 16,
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--emerald-dim)',
            border: '1px solid rgba(52, 211, 153, 0.2)',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--emerald)',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
          }}>
            ✓ Dluh splacen!
          </div>
        )}
      </div>

      {showPayment && (
        <AddPaymentModal
          debt={debt}
          onClose={() => setShowPayment(false)}
          onSave={(amount, date, note) => {
            const payment = { id: `${Date.now()}`, amount, date, note }
            onUpdate({ ...debt, paidAmount: debt.paidAmount + amount, payments: [...debt.payments, payment] })
            setShowPayment(false)
          }}
        />
      )}
    </>
  )
}

function StatRow({ label, value, color, emphasis }: { label: string; value: string; color?: string; emphasis?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</p>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: emphasis ? 16 : 14,
        fontWeight: emphasis ? 500 : 400,
        color: color || (emphasis ? 'var(--text-primary)' : 'var(--text-secondary)'),
        letterSpacing: '-0.02em',
      }}>
        {value}
      </p>
    </div>
  )
}
