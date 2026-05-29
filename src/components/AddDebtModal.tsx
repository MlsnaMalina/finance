import { useState } from 'react'
import type { Debt } from '../types'
import { DEBT_COLORS, generateId } from '../utils/formatters'

interface AddDebtModalProps {
  onClose: () => void
  onSave: (debt: Debt) => void
  debt?: Debt
}

export function AddDebtModal({ onClose, onSave, debt: editing }: AddDebtModalProps) {
  const [name, setName] = useState(editing?.name ?? '')
  const [total, setTotal] = useState(editing ? String(editing.totalAmount) : '')
  const [paid, setPaid] = useState('')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [color, setColor] = useState(editing?.color ?? DEBT_COLORS[0])
  const [monthlyPayment, setMonthlyPayment] = useState(editing?.monthlyPayment ? String(editing.monthlyPayment) : '')
  const [monthlyPaymentDay, setMonthlyPaymentDay] = useState(editing?.monthlyPaymentDay ? String(editing.monthlyPaymentDay) : '')

  const totalNum = parseFloat(total.replace(',', '.')) || 0
  const paidNum = parseFloat(paid.replace(',', '.')) || 0
  const monthlyNum = parseFloat(monthlyPayment.replace(',', '.')) || 0
  const dayNum = parseInt(monthlyPaymentDay) || undefined

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || totalNum <= 0) return
    if (editing) {
      onSave({
        ...editing,
        name: name.trim(),
        totalAmount: totalNum,
        color,
        description: description.trim() || undefined,
        monthlyPayment: monthlyNum > 0 ? monthlyNum : undefined,
        monthlyPaymentDay: monthlyNum > 0 && dayNum ? dayNum : undefined,
      })
    } else {
      const debt: Debt = {
        id: generateId(),
        name: name.trim(),
        totalAmount: totalNum,
        paidAmount: Math.min(paidNum, totalNum),
        color,
        payments: paidNum > 0 ? [{ id: generateId(), amount: paidNum, date: new Date().toISOString().split('T')[0], note: 'Počáteční stav' }] : [],
        archived: false,
        createdAt: new Date().toISOString(),
        description: description.trim() || undefined,
        monthlyPayment: monthlyNum > 0 ? monthlyNum : undefined,
        monthlyPaymentDay: monthlyNum > 0 && dayNum ? dayNum : undefined,
      }
      onSave(debt)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ padding: '32px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{editing ? 'Upravit' : 'Nový dluh'}</p>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.03em' }}>{editing ? editing.name : 'Přidat dluh'}</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Název</label>
            <input
              className="input-base"
              type="text"
              placeholder="Např. Půjčka od banky"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Popis (volitelné)</label>
            <input
              className="input-base"
              type="text"
              placeholder="Např. Hypotéka na byt"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: editing ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Celková výše (Kč)</label>
              <input
                className="input-base"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={total}
                onChange={e => setTotal(e.target.value)}
              />
            </div>
            {!editing && (
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Již splaceno (Kč)</label>
                <input
                  className="input-base"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={paid}
                  onChange={e => setPaid(e.target.value)}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Měsíční splátka (Kč, volitelné)</label>
              <input
                className="input-base"
                type="text"
                inputMode="decimal"
                placeholder="Např. 5 000"
                value={monthlyPayment}
                onChange={e => setMonthlyPayment(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Den splátky v měsíci</label>
              <input
                className="input-base"
                type="text"
                inputMode="numeric"
                placeholder="Např. 15"
                value={monthlyPaymentDay}
                onChange={e => setMonthlyPaymentDay(e.target.value)}
                disabled={!monthlyPayment}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>Barva</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {DEBT_COLORS.map(c => (
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
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
              Zrušit
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center', opacity: (!name.trim() || totalNum <= 0) ? 0.5 : 1 }}
              disabled={!name.trim() || totalNum <= 0}
            >
              {editing ? 'Uložit změny' : 'Přidat dluh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
