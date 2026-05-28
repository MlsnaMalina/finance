import { useState } from 'react'
import type { RecurringPayment, PaymentFrequency } from '../types'
import { PAYMENT_COLORS, CATEGORIES, MONTH_NAMES, generateId } from '../utils/formatters'

interface PaymentModalProps {
  payment?: RecurringPayment
  onClose: () => void
  onSave: (payment: RecurringPayment) => void
  onDelete?: (id: string) => void
}

export function PaymentModal({ payment, onClose, onSave, onDelete }: PaymentModalProps) {
  const [name, setName] = useState(payment?.name ?? '')
  const [amount, setAmount] = useState(payment ? String(payment.amount) : '')
  const [color, setColor] = useState(payment?.color ?? PAYMENT_COLORS[0])
  const [frequency, setFrequency] = useState<PaymentFrequency>(payment?.frequency ?? 'monthly')
  const [dayOfMonth, setDayOfMonth] = useState(payment?.dayOfMonth ?? 1)
  const [monthOfYear, setMonthOfYear] = useState(payment?.monthOfYear ?? 1)
  const [category, setCategory] = useState(payment?.category ?? CATEGORIES[0])
  const isEdit = !!payment

  const amountNum = parseFloat(amount.replace(',', '.')) || 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || amountNum <= 0) return
    onSave({
      id: payment?.id ?? generateId(),
      name: name.trim(),
      amount: amountNum,
      color,
      frequency,
      dayOfMonth,
      monthOfYear: frequency === 'yearly' ? monthOfYear : undefined,
      category,
      active: payment?.active ?? true,
    })
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ padding: '32px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {isEdit ? 'Upravit platbu' : 'Nová platba'}
          </p>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.03em' }}>
            {isEdit ? payment.name : 'Přidat platbu'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Název</label>
            <input
              className="input-base"
              type="text"
              placeholder="Např. Netflix, Pojištění..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Částka (Kč)</label>
              <input
                className="input-base"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Kategorie</label>
              <select className="input-base" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Frekvence</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([['monthly', 'Měsíčně'], ['yearly', 'Ročně']] as [PaymentFrequency, string][]).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFrequency(val)}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${frequency === val ? 'var(--violet)' : 'var(--border)'}`,
                    background: frequency === val ? 'var(--violet-dim)' : 'var(--bg-2)',
                    color: frequency === val ? 'var(--violet)' : 'var(--text-secondary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Day / Month picker */}
          <div style={{ display: 'grid', gridTemplateColumns: frequency === 'yearly' ? '1fr 1fr' : '1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Den v měsíci</label>
              <select className="input-base" value={dayOfMonth} onChange={e => setDayOfMonth(Number(e.target.value))}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}.</option>
                ))}
              </select>
            </div>
            {frequency === 'yearly' && (
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Měsíc</label>
                <select className="input-base" value={monthOfYear} onChange={e => setMonthOfYear(Number(e.target.value))}>
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Color picker */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>Barva</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {PAYMENT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`color-swatch${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {isEdit && onDelete && (
              <button
                type="button"
                onClick={() => { if (window.confirm('Smazat tuto platbu?')) onDelete(payment.id) }}
                className="btn-ghost"
                style={{ color: 'var(--red)', padding: '10px 12px' }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" />
                </svg>
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
              Zrušit
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center', opacity: (!name.trim() || amountNum <= 0) ? 0.5 : 1 }}
              disabled={!name.trim() || amountNum <= 0}
            >
              {isEdit ? 'Uložit změny' : 'Přidat platbu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
