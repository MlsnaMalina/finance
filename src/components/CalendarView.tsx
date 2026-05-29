import { useState } from 'react'
import type { RecurringPayment, Debt } from '../types'
import { formatCurrency, MONTH_NAMES, DAY_NAMES } from '../utils/formatters'
import { PaymentModal } from './PaymentModal'

interface CalendarViewProps {
  payments: RecurringPayment[]
  onPaymentsChange: (payments: RecurringPayment[]) => void
  balance?: number | null
  reserve?: number | null
  debts?: Debt[]
}

function getPaymentsForDay(payments: RecurringPayment[], day: number, month: number): RecurringPayment[] {
  return payments.filter(p => {
    if (!p.active) return false
    if (p.dayOfMonth !== day) return false
    if (p.frequency === 'yearly' && p.monthOfYear !== month) return false
    return true
  })
}

function getMinBalanceForDay(payments: RecurringPayment[], day: number, month: number, daysInMonth: number): number {
  let total = 0
  for (let d = day; d <= daysInMonth; d++) {
    for (const p of payments) {
      if (!p.active) continue
      if (p.dayOfMonth !== d) continue
      if (p.frequency === 'yearly' && p.monthOfYear !== month) continue
      total += p.amount
    }
  }
  return total
}

export function CalendarView({ payments, onPaymentsChange, balance, reserve, debts = [] }: CalendarViewProps) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [editPayment, setEditPayment] = useState<RecurringPayment | null>(null)
  const [addForDay, setAddForDay] = useState<number | null>(null)

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7 // Mon=0

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  // Countdown to nearest upcoming yearly payment
  const nextYearly = (() => {
    const upcoming = payments
      .filter(p => p.active && p.frequency === 'yearly' && p.monthOfYear != null)
      .map(p => {
        const thisYear = new Date(today.getFullYear(), (p.monthOfYear! - 1), p.dayOfMonth)
        const nextYear = new Date(today.getFullYear() + 1, (p.monthOfYear! - 1), p.dayOfMonth)
        const target = thisYear >= today ? thisYear : nextYear
        const days = Math.ceil((target.getTime() - today.setHours(0,0,0,0)) / 86400000)
        return { payment: p, days, date: target }
      })
      .sort((a, b) => a.days - b.days)
    return upcoming[0] ?? null
  })()

  function handleSavePayment(p: RecurringPayment) {
    const exists = payments.find(x => x.id === p.id)
    if (exists) onPaymentsChange(payments.map(x => x.id === p.id ? p : x))
    else onPaymentsChange([...payments, { ...p, dayOfMonth: addForDay ?? p.dayOfMonth }])
    setEditPayment(null)
    setAddForDay(null)
  }

  function handleDeletePayment(id: string) {
    onPaymentsChange(payments.filter(p => p.id !== id))
    setEditPayment(null)
  }

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const activeDebtsWithPayment = debts.filter(d => !d.archived && d.monthlyPayment && d.monthlyPayment > 0)

  // Count total event slots in this month for compact mode decision
  const totalMonthEvents = payments.filter(p => {
    if (!p.active) return false
    if (p.frequency === 'yearly' && p.monthOfYear !== month) return false
    return true
  }).length + activeDebtsWithPayment.length
  const compact = totalMonthEvents >= 8

  return (
    <div>
      {/* Countdown to nearest yearly payment */}
      {nextYearly && (
        <div style={{
          marginBottom: 24,
          padding: '10px 16px',
          background: 'rgba(251,191,36,0.07)',
          border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
            {nextYearly.days === 0 ? 'Dnes' : `Za ${nextYearly.days} ${nextYearly.days === 1 ? 'den' : nextYearly.days < 5 ? 'dny' : 'dní'}`}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {nextYearly.payment.name} — {formatCurrency(nextYearly.payment.amount)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
            {nextYearly.date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      )}

      {/* Calendar header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 8 }}>
        <button onClick={prevMonth} className="btn-ghost" style={{ padding: '8px 12px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 4L6 8l4 4" />
          </svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.03em' }}>
            {MONTH_NAMES[month - 1]}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{year}</p>
        </div>
        <button onClick={nextMonth} className="btn-ghost" style={{ padding: '8px 12px' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      {/* Day names header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: 11,
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.06em',
            padding: '6px 0',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />
          }
          const dayPayments = getPaymentsForDay(payments, day, month)
          const dayDebts = activeDebtsWithPayment.filter(d => (d.monthlyPaymentDay ?? 1) === day)
          const hasYearly = dayPayments.some(p => p.frequency === 'yearly')
          const minBalance = getMinBalanceForDay(payments, day, month, daysInMonth)
          const isToday = isCurrentMonth && day === today.getDate()
          const isPast = isCurrentMonth && day < today.getDate()

          let minBalanceColor = 'var(--text-tertiary)'
          if (balance != null && minBalance > 0) {
            const threshold = reserve ?? 0
            if (balance >= minBalance + threshold) minBalanceColor = 'var(--emerald)'
            else if (balance >= minBalance) minBalanceColor = 'var(--amber)'
            else minBalanceColor = 'var(--rose)'
          }

          return (
            <button
              key={day}
              onClick={() => setAddForDay(day)}
              style={{
                background: isToday ? 'var(--violet-dim)' : hasYearly ? 'rgba(251,191,36,0.04)' : 'var(--card)',
                border: `1px solid ${isToday ? 'var(--violet)' : hasYearly ? 'rgba(251,191,36,0.3)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: compact ? '8px 6px 6px' : '10px 8px 8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
                minHeight: compact ? 62 : 88,
                display: 'flex',
                flexDirection: 'column',
                gap: compact ? 3 : 4,
                opacity: isPast ? 0.55 : 1,
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isToday) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-active)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--card-hover)'
                }
              }}
              onMouseLeave={e => {
                if (!isToday) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLElement).style.background = 'var(--card)'
                }
              }}
            >
              {/* Day number */}
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 14,
                fontWeight: isToday ? 700 : 500,
                color: isToday ? 'var(--violet)' : 'var(--text-primary)',
                lineHeight: 1,
              }}>
                {day}
              </span>

              {/* Min balance */}
              {minBalance > 0 && (
                <span
                  title="Zbývající platby od tohoto dne do konce měsíce"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: minBalanceColor,
                    lineHeight: 1,
                    letterSpacing: '-0.01em',
                    cursor: 'help',
                    borderBottom: `1px dashed ${minBalanceColor}66`,
                  }}>
                  {formatCurrency(minBalance)}
                </span>
              )}

              {/* Payment chips / dots */}
              {(dayPayments.length > 0 || dayDebts.length > 0) && (
                compact ? (
                  /* Compact: dot row */
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 'auto' }}>
                    {dayPayments.map(p => (
                      <div
                        key={p.id}
                        onClick={e => { e.stopPropagation(); setEditPayment(p) }}
                        title={`${p.name} — ${formatCurrency(p.amount)}`}
                        style={{
                          width: p.frequency === 'yearly' ? 7 : 6,
                          height: p.frequency === 'yearly' ? 7 : 6,
                          borderRadius: p.frequency === 'yearly' ? 2 : '50%',
                          background: p.frequency === 'yearly' ? 'var(--amber)' : p.color,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                    {dayDebts.map(d => (
                      <div
                        key={d.id}
                        title={`${d.name} — splátka ${formatCurrency(d.monthlyPayment!)}`}
                        style={{
                          width: 6, height: 6,
                          borderRadius: '50%',
                          background: d.color,
                          border: `1px dashed ${d.color}`,
                          opacity: 0.7,
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  /* Full: chip row */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 'auto', flex: 1, justifyContent: 'flex-end' }}>
                    {dayPayments.slice(0, 3).map(p => (
                      <div
                        key={p.id}
                        onClick={e => { e.stopPropagation(); setEditPayment(p) }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 5px',
                          borderRadius: 4,
                          background: p.frequency === 'yearly' ? 'rgba(251,191,36,0.12)' : `${p.color}1A`,
                          border: `1px solid ${p.frequency === 'yearly' ? 'rgba(251,191,36,0.35)' : `${p.color}33`}`,
                          cursor: 'pointer',
                        }}
                      >
                        {p.frequency === 'yearly' ? (
                          <span style={{ fontSize: 7, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.04em', flexShrink: 0 }}>ROK</span>
                        ) : (
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        )}
                        <span style={{
                          fontSize: 9, color: p.frequency === 'yearly' ? 'var(--amber)' : p.color,
                          fontFamily: 'var(--font-mono)', fontWeight: 500,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                        }}>
                          {formatCurrency(p.amount)}
                        </span>
                      </div>
                    ))}
                    {dayDebts.slice(0, 2).map(d => (
                      <div
                        key={d.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '2px 5px', borderRadius: 4,
                          background: `${d.color}18`, border: `1px dashed ${d.color}55`, cursor: 'default',
                        }}
                      >
                        <svg width="6" height="6" viewBox="0 0 10 10" fill={d.color} style={{ flexShrink: 0 }}>
                          <path d="M5 0C3.3 0 2 1.3 2 3c0 1 .5 1.9 1.2 2.5L5 10l1.8-4.5C7.5 4.9 8 4 8 3c0-1.7-1.3-3-3-3z" />
                        </svg>
                        <span style={{
                          fontSize: 9, color: d.color, fontFamily: 'var(--font-mono)', fontWeight: 500,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', opacity: 0.85,
                        }}>
                          {formatCurrency(d.monthlyPayment!)}
                        </span>
                      </div>
                    ))}
                    {(dayPayments.length > 3 || dayDebts.length > 2) && (
                      <span style={{ fontSize: 9, color: 'var(--text-tertiary)', paddingLeft: 5 }}>
                        +{Math.max(0, dayPayments.length - 3) + Math.max(0, dayDebts.length - 2)}
                      </span>
                    )}
                  </div>
                )
              )}
            </button>
          )
        })}
      </div>

      {/* Day detail: add new payment for selected day */}
      {addForDay !== null && (
        <PaymentModal
          payment={undefined}
          onClose={() => setAddForDay(null)}
          onSave={p => handleSavePayment({ ...p, dayOfMonth: addForDay })}
        />
      )}

      {/* Edit payment modal */}
      {editPayment && (
        <PaymentModal
          payment={editPayment}
          onClose={() => setEditPayment(null)}
          onSave={handleSavePayment}
          onDelete={handleDeletePayment}
        />
      )}
    </div>
  )
}

