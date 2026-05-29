import { useState } from 'react'
import type { SavingsGoal, SavingsDeposit } from '../types'
import { GaugeChart } from './GaugeChart'
import { formatCurrency, formatDate, generateId } from '../utils/formatters'

interface SavingsCardProps {
  goal: SavingsGoal
  onUpdate: (goal: SavingsGoal) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  index: number
}

export function SavingsCard({ goal, onUpdate, onArchive, onDelete, index }: SavingsCardProps) {
  const [showDeposit, setShowDeposit] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const pct = goal.targetAmount > 0 ? Math.min(goal.savedAmount / goal.targetAmount, 1) : 0
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0)
  const isComplete = goal.savedAmount >= goal.targetAmount

  const avgMonthly = calcAvgMonthly(goal.deposits)
  const monthsLeft = avgMonthly && avgMonthly > 0 && remaining > 0
    ? Math.ceil(remaining / avgMonthly)
    : null

  return (
    <>
      <div
        className="animate-fade-up"
        style={{
          animationDelay: `${index * 80}ms`,
          background: 'var(--card)',
          border: isComplete
            ? `1px solid ${goal.color}50`
            : '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 22px 20px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.3s',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
        onMouseEnter={e => {
          if (!isComplete) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-active)'
        }}
        onMouseLeave={e => {
          if (!isComplete) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
        }}
      >
        {/* Subtle ambient glow behind gauge area */}
        <div style={{
          position: 'absolute',
          bottom: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${goal.color}12 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: 2,
                lineHeight: 1.2,
              }}>
                {goal.name}
              </h3>
              {goal.description && (
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', opacity: 0.7 }}>
                  {goal.description}
                </p>
              )}
            </div>
          </div>

          {/* Menu */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setShowMenu(m => !m)}
              className="btn-ghost"
              style={{ padding: '4px 8px', borderRadius: 6 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 4,
                background: 'var(--bg-2)', border: '1px solid var(--border-active)',
                borderRadius: 'var(--radius-sm)', overflow: 'hidden',
                zIndex: 20, minWidth: 160, boxShadow: 'var(--shadow-card)',
              }}>
                <button
                  onClick={() => { setShowMenu(false); onArchive(goal.id) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', color: 'var(--text-secondary)', fontSize: 13, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 6.5h12v8H2z" />
                    <path d="M1 3.5h14v3H1z" />
                    <path d="M8 9.5v3M6.5 11l1.5 1.5L9.5 11" />
                  </svg>
                  Archivovat
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete(goal.id) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', color: 'var(--red)', fontSize: 13, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" />
                  </svg>
                  Smazat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gauge */}
        <div style={{ position: 'relative', zIndex: 1, padding: '0 4px', marginBottom: 12 }}>
          <GaugeChart
            pct={pct}
            color={goal.color}
            savedAmount={goal.savedAmount}
            targetAmount={goal.targetAmount}
            uid={goal.id}
            delayMs={80 + index * 100}
          />
        </div>

        {/* Prediction / completion */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: 14, minHeight: 16 }}>
          {isComplete ? (
            <p style={{
              fontSize: 12, color: goal.color, fontWeight: 600,
              fontFamily: 'var(--font-display)', textAlign: 'center',
            }}>
              🎉 Cíl splněn!
            </p>
          ) : monthsLeft !== null ? (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>
              Za{' '}
              <span style={{ color: goal.color, fontWeight: 500 }}>
                {monthsLeft === 1 ? '1 měsíc' : monthsLeft < 5 ? `${monthsLeft} měsíce` : `${monthsLeft} měsíců`}
              </span>
              {' '}· avg{' '}
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: 11 }}>
                {formatCurrency(Math.round(avgMonthly!))}
              </span>
              /m
            </p>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.6 }}>
              Přidej vklad pro výpočet predikce
            </p>
          )}
        </div>

        {/* Last deposit hint */}
        {goal.deposits.length > 0 && !isComplete && (
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 14, paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Poslední vklad · {formatDate([...goal.deposits].sort((a, b) => b.date.localeCompare(a.date))[0].date)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: goal.color }}>
              +{formatCurrency([...goal.deposits].sort((a, b) => b.date.localeCompare(a.date))[0].amount)}
            </span>
          </div>
        )}

        {/* Action button */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {isComplete ? (
            <div style={{
              padding: '10px', borderRadius: 'var(--radius-sm)',
              background: `${goal.color}15`, border: `1px solid ${goal.color}30`,
              textAlign: 'center', fontSize: 13, color: goal.color,
              fontFamily: 'var(--font-display)', fontWeight: 600,
            }}>
              Splněno
            </div>
          ) : (
            <button
              onClick={() => setShowDeposit(true)}
              style={{
                width: '100%', padding: '10px',
                border: `1px solid ${goal.color}33`,
                borderRadius: 'var(--radius-sm)',
                color: goal.color, fontSize: 13,
                fontFamily: 'var(--font-display)', fontWeight: 600,
                background: `${goal.color}0A`,
                transition: 'background 0.2s, border-color 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = `${goal.color}18`
                ;(e.currentTarget as HTMLElement).style.borderColor = `${goal.color}66`
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = `${goal.color}0A`
                ;(e.currentTarget as HTMLElement).style.borderColor = `${goal.color}33`
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
              Přidat vklad
            </button>
          )}
        </div>
      </div>

      {showDeposit && (
        <DepositModal
          goal={goal}
          onClose={() => setShowDeposit(false)}
          onSave={(amount, date, note) => {
            const deposit: SavingsDeposit = { id: generateId(), amount, date, note }
            onUpdate({
              ...goal,
              savedAmount: goal.savedAmount + amount,
              deposits: [...goal.deposits, deposit],
            })
            setShowDeposit(false)
          }}
        />
      )}
    </>
  )
}

function DepositModal({
  goal,
  onClose,
  onSave,
}: {
  goal: SavingsGoal
  onClose: () => void
  onSave: (amount: number, date: string, note: string) => void
}) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const amountNum = parseFloat(amount.replace(',', '.')) || 0

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ padding: '32px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {goal.name}
          </p>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.03em' }}>Přidat vklad</h2>
        </div>
        <form
          onSubmit={e => { e.preventDefault(); if (amountNum > 0) onSave(amountNum, date, note.trim()) }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Částka (Kč)</label>
            <input className="input-base" type="text" inputMode="decimal" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Datum</label>
            <input className="input-base" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Poznámka (volitelné)</label>
            <input className="input-base" type="text" placeholder="Např. Výplata" value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Zrušit</button>
            <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: amountNum <= 0 ? 0.5 : 1 }} disabled={amountNum <= 0}>
              Uložit vklad
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function calcAvgMonthly(deposits: SavingsDeposit[]): number | null {
  if (deposits.length === 0) return null
  if (deposits.length === 1) return deposits[0].amount
  const sorted = [...deposits].sort((a, b) => a.date.localeCompare(b.date))
  const months = (new Date(sorted[sorted.length - 1].date).getTime() - new Date(sorted[0].date).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  if (months < 0.5) return null
  return deposits.reduce((s, d) => s + d.amount, 0) / months
}
