import { useState } from 'react'
import type { RecurringPayment } from '../types'
import { formatCurrency, MONTH_NAMES, DAY_NAMES } from '../utils/formatters'
import { PaymentModal } from './PaymentModal'

interface CalendarViewProps {
  payments: RecurringPayment[]
  onPaymentsChange: (payments: RecurringPayment[]) => void
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

export function CalendarView({ payments, onPaymentsChange }: CalendarViewProps) {
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

  // Total for this month
  const monthTotal = payments.filter(p => p.active).reduce((s, p) => {
    if (p.frequency === 'yearly' && p.monthOfYear !== month) return s
    return s + p.amount
  }, 0)

  // Monthly total (only recurring monthly)
  const monthlyTotal = payments.filter(p => p.active && p.frequency === 'monthly').reduce((s, p) => s + p.amount, 0)

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

  return (
    <div>
      {/* Month summary */}
      {monthTotal > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 28,
        }}>
          <SummaryCard label="Celkem tento měsíc" value={formatCurrency(monthTotal)} color="var(--violet)" />
          <SummaryCard label="Měsíční platby" value={formatCurrency(monthlyTotal)} color="var(--sky)" />
          <SummaryCard label="Jednorázové (letos)" value={formatCurrency(monthTotal - monthlyTotal)} color="var(--amber)" />
        </div>
      )}

      {/* Calendar header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
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
          const minBalance = getMinBalanceForDay(payments, day, month, daysInMonth)
          const isToday = isCurrentMonth && day === today.getDate()
          const isPast = isCurrentMonth && day < today.getDate()

          return (
            <button
              key={day}
              onClick={() => setAddForDay(day)}
              style={{
                background: isToday ? 'var(--violet-dim)' : 'var(--card)',
                border: `1px solid ${isToday ? 'var(--violet)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '10px 8px 8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
                minHeight: 88,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
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
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--text-tertiary)',
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}>
                  {formatCurrency(minBalance)}
                </span>
              )}

              {/* Payment dots */}
              {dayPayments.length > 0 && (
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
                        background: `${p.color}1A`,
                        border: `1px solid ${p.color}33`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                      <span style={{
                        fontSize: 9,
                        color: p.color,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}>
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                  {dayPayments.length > 3 && (
                    <span style={{ fontSize: 9, color: 'var(--text-tertiary)', paddingLeft: 5 }}>
                      +{dayPayments.length - 3}
                    </span>
                  )}
                </div>
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

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '16px 18px',
    }}>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color, letterSpacing: '-0.02em', fontWeight: 500 }}>{value}</p>
    </div>
  )
}
