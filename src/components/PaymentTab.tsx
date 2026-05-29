import { useState, useRef, useEffect } from 'react'
import type { RecurringPayment } from '../types'
import { CalendarView } from './CalendarView'
import { PaymentModal } from './PaymentModal'
import { formatCurrency, MONTH_NAMES } from '../utils/formatters'

interface PaymentTabProps {
  payments: RecurringPayment[]
  onPaymentsChange: (payments: RecurringPayment[]) => void
  balance: number | null
  reserve: number | null
  onBalanceChange: (v: number | null) => void
  onReserveChange: (v: number | null) => void
}

export function PaymentTab({ payments, onPaymentsChange, balance, reserve, onBalanceChange, onReserveChange }: PaymentTabProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [editPayment, setEditPayment] = useState<RecurringPayment | null>(null)
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  function handleSave(p: RecurringPayment) {
    const exists = payments.find(x => x.id === p.id)
    if (exists) onPaymentsChange(payments.map(x => x.id === p.id ? p : x))
    else onPaymentsChange([...payments, p])
    setShowAdd(false)
    setEditPayment(null)
  }

  function handleDelete(id: string) {
    onPaymentsChange(payments.filter(p => p.id !== id))
    setEditPayment(null)
  }

  function toggleActive(id: string) {
    onPaymentsChange(payments.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  const monthly = payments.filter(p => p.active && p.frequency === 'monthly')
  const yearly = payments.filter(p => p.active && p.frequency === 'yearly')

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: 3,
          gap: 2,
          flexShrink: 0,
        }}>
          {(['calendar', 'list'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: 12,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                background: view === v ? 'var(--violet-dim)' : 'transparent',
                color: view === v ? 'var(--violet)' : 'var(--text-secondary)',
                border: view === v ? '1px solid rgba(167,139,250,0.3)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {v === 'calendar' ? 'Kalendář' : 'Seznam'}
            </button>
          ))}
        </div>

        <BalanceWidget payments={payments} balance={balance} reserve={reserve} onBalanceChange={onBalanceChange} onReserveChange={onReserveChange} />

        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Přidat platbu
        </button>
      </div>

      {view === 'calendar' ? (
        payments.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <CalendarView payments={payments} onPaymentsChange={onPaymentsChange} balance={balance} reserve={reserve} />
        )
      ) : (
        /* List view */
        <div>
          {payments.length === 0 ? (
            <EmptyState onAdd={() => setShowAdd(true)} />
          ) : (
            <>
              {monthly.length > 0 && (
                <Section title="Měsíční platby" payments={monthly} onEdit={setEditPayment} onToggle={toggleActive} />
              )}
              {yearly.length > 0 && (
                <Section title="Roční platby" payments={yearly} onEdit={setEditPayment} onToggle={toggleActive} />
              )}
              {payments.filter(p => !p.active).length > 0 && (
                <Section title="Neaktivní" payments={payments.filter(p => !p.active)} onEdit={setEditPayment} onToggle={toggleActive} muted />
              )}
            </>
          )}
        </div>
      )}

      {showAdd && <PaymentModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {editPayment && (
        <PaymentModal
          payment={editPayment}
          onClose={() => setEditPayment(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

function Section({
  title, payments, onEdit, onToggle, muted
}: {
  title: string
  payments: RecurringPayment[]
  onEdit: (p: RecurringPayment) => void
  onToggle: (id: string) => void
  muted?: boolean
}) {
  const total = payments.reduce((s, p) => s + p.amount, 0)
  return (
    <div style={{ marginBottom: 32, opacity: muted ? 0.6 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {title}
        </h3>
        {!muted && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
            {formatCurrency(total)} / {payments[0]?.frequency === 'yearly' ? 'rok' : 'měsíc'}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {payments.map(p => (
          <PaymentRow key={p.id} payment={p} onEdit={() => onEdit(p)} onToggle={() => onToggle(p.id)} />
        ))}
      </div>
    </div>
  )
}

function PaymentRow({ payment, onEdit, onToggle }: { payment: RecurringPayment; onEdit: () => void; onToggle: () => void }) {
  const dayLabel = payment.frequency === 'yearly'
    ? `${payment.dayOfMonth}. ${MONTH_NAMES[(payment.monthOfYear ?? 1) - 1]}`
    : `${payment.dayOfMonth}. každý měsíc`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: payment.active ? payment.color : 'var(--text-tertiary)',
        flexShrink: 0,
        boxShadow: payment.active ? `0 0 8px ${payment.color}55` : 'none',
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600, color: payment.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {payment.name}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{dayLabel} · {payment.category}</p>
      </div>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: payment.active ? payment.color : 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '-0.02em' }}>
        {formatCurrency(payment.amount)}
      </span>

      <button
        onClick={onToggle}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: payment.active ? 'var(--violet-dim)' : 'var(--bg-2)',
          border: `1px solid ${payment.active ? 'var(--violet)' : 'var(--border)'}`,
          position: 'relative',
          transition: 'all 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: payment.active ? 'var(--violet)' : 'var(--text-tertiary)',
          position: 'absolute',
          top: 2,
          left: payment.active ? 18 : 2,
          transition: 'left 0.2s, background 0.2s',
        }} />
      </button>

      <button onClick={onEdit} className="btn-ghost" style={{ padding: '6px 8px', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M11 2l3 3-8 8H3v-3l8-8z" />
        </svg>
      </button>
    </div>
  )
}

function BalanceWidget({
  payments, balance, reserve, onBalanceChange, onReserveChange,
}: {
  payments: RecurringPayment[]
  balance: number | null
  reserve: number | null
  onBalanceChange: (v: number | null) => void
  onReserveChange: (v: number | null) => void
}) {
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentDay = today.getDate()
  const daysInCurrentMonth = new Date(today.getFullYear(), currentMonth, 0).getDate()

  let remainingThisMonth = 0
  for (let d = currentDay; d <= daysInCurrentMonth; d++) {
    for (const p of payments) {
      if (!p.active) continue
      if (p.dayOfMonth !== d) continue
      if (p.frequency === 'yearly' && p.monthOfYear !== currentMonth) continue
      remainingThisMonth += p.amount
    }
  }

  const afterPayments = balance !== null ? balance - remainingThisMonth : null
  const cushion = afterPayments !== null && reserve !== null ? afterPayments - reserve : null

  let statusColor = 'var(--text-tertiary)'
  let statusText = 'Zadej aktuální zůstatek pro přehled'
  if (balance !== null) {
    if (cushion !== null) {
      if (cushion >= 0) {
        statusColor = 'var(--emerald)'
        statusText = `Po výdajích zbyde ${formatCurrency(cushion)} nad rezervou`
      } else {
        statusColor = 'var(--rose)'
        statusText = `Do rezervy chybí ${formatCurrency(Math.abs(cushion))}`
      }
    } else {
      statusColor = afterPayments! >= 0 ? 'var(--emerald)' : 'var(--rose)'
      statusText = afterPayments! >= 0
        ? `Po výdajích zbyde ${formatCurrency(afterPayments!)}`
        : `Na výdaje chybí ${formatCurrency(Math.abs(afterPayments!))}`
    }
  }

  const statusTitle = balance === null
    ? 'Zadej aktuální zůstatek pro přehled'
    : statusText

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      padding: '0 12px',
      height: 36,
      minWidth: 0,
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
        Zůstatek
      </span>
      <InlineAmount value={balance} onChange={onBalanceChange} />

      <div style={{ width: 1, height: 14, background: 'var(--border)', flexShrink: 0 }} />

      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-display)', fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
        Rezerva
      </span>
      <InlineAmount value={reserve} onChange={onReserveChange} hint="Min. částka, kterou chci mít vždy k dispozici" />

      <div
        title={statusTitle}
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: statusColor,
          flexShrink: 0,
          marginLeft: 4,
          boxShadow: balance !== null ? `0 0 6px ${statusColor}88` : 'none',
          cursor: 'default',
        }}
      />
    </div>
  )
}

function InlineAmount({ value, onChange, hint }: {
  value: number | null
  onChange: (v: number | null) => void
  hint?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(value !== null ? String(value) : '')
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [editing, value])

  function commit() {
    const num = parseFloat(draft.replace(/\s/g, '').replace(',', '.'))
    onChange(isNaN(num) ? null : Math.max(0, num))
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid var(--violet)',
          padding: '0 2px',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-primary)',
          width: 90,
          outline: 'none',
        }}
        placeholder="0"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title={hint ?? 'Klikni pro úpravu'}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '0 2px',
        cursor: 'text',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: value !== null ? 'var(--text-primary)' : 'var(--text-tertiary)',
        letterSpacing: '-0.01em',
        borderBottom: '1px solid transparent',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderBottomColor = 'var(--border-active)')}
      onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
    >
      {value !== null ? formatCurrency(value) : '— Kč'}
    </button>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'rgba(251, 191, 36, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Žádné platby</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Přidej pravidelné platby a sleduj, co tě čeká každý měsíc.</p>
      <button onClick={onAdd} className="btn-primary">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
        Přidat platbu
      </button>
    </div>
  )
}
