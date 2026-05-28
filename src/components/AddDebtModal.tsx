import { useState } from 'react'
import type { Debt } from '../types'
import { DEBT_COLORS, generateId } from '../utils/formatters'

interface AddDebtModalProps {
  onClose: () => void
  onSave: (debt: Debt) => void
}

export function AddDebtModal({ onClose, onSave }: AddDebtModalProps) {
  const [name, setName] = useState('')
  const [total, setTotal] = useState('')
  const [paid, setPaid] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(DEBT_COLORS[0])

  const totalNum = parseFloat(total.replace(',', '.')) || 0
  const paidNum = parseFloat(paid.replace(',', '.')) || 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || totalNum <= 0) return
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
    }
    onSave(debt)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ padding: '32px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Nový dluh</p>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.03em' }}>Přidat dluh</h2>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
              Přidat dluh
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
