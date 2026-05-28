import { useState } from 'react'
import type { Debt } from '../types'
import { formatCurrency } from '../utils/formatters'

interface AddPaymentModalProps {
  debt: Debt
  onClose: () => void
  onSave: (amount: number, date: string, note?: string) => void
}

export function AddPaymentModal({ debt, onClose, onSave }: AddPaymentModalProps) {
  const today = new Date().toISOString().split('T')[0]
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today)
  const [note, setNote] = useState('')

  const remaining = Math.max(debt.totalAmount - debt.paidAmount, 0)
  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (parsedAmount <= 0) return
    onSave(parsedAmount, date, note || undefined)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ padding: '32px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Zadat splátku</p>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.03em' }}>{debt.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Zbývá splatit: <span style={{ fontFamily: 'var(--font-mono)', color: debt.color }}>{formatCurrency(remaining)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Částka (Kč)</label>
            <input
              className="input-base"
              type="text"
              inputMode="decimal"
              placeholder={`max. ${formatCurrency(remaining)}`}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
            {parsedAmount > remaining && (
              <p style={{ fontSize: 12, color: 'var(--amber)', marginTop: 4 }}>
                Zadaná částka přesahuje zbývající dluh
              </p>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Datum platby</label>
            <input
              className="input-base"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Poznámka (volitelné)</label>
            <input
              className="input-base"
              type="text"
              placeholder="Např. mimořádná splátka"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
              Zrušit
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center', opacity: parsedAmount <= 0 ? 0.5 : 1 }}
              disabled={parsedAmount <= 0}
            >
              Uložit splátku
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
