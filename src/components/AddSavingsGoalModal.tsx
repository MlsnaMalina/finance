import { useState } from 'react'
import type { SavingsGoal } from '../types'
import { SAVINGS_COLORS, SAVINGS_EMOJIS, generateId } from '../utils/formatters'

interface AddSavingsGoalModalProps {
  onClose: () => void
  onSave: (goal: SavingsGoal) => void
}

export function AddSavingsGoalModal({ onClose, onSave }: AddSavingsGoalModalProps) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(SAVINGS_COLORS[0])
  const [emoji, setEmoji] = useState(SAVINGS_EMOJIS[0])

  const targetNum = parseFloat(target.replace(',', '.')) || 0
  const savedNum = parseFloat(saved.replace(',', '.')) || 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || targetNum <= 0) return

    const goal: SavingsGoal = {
      id: generateId(),
      name: name.trim(),
      targetAmount: targetNum,
      savedAmount: Math.min(savedNum, targetNum),
      color,
      emoji,
      deposits: savedNum > 0
        ? [{ id: generateId(), amount: Math.min(savedNum, targetNum), date: new Date().toISOString().split('T')[0], note: 'Počáteční stav' }]
        : [],
      archived: false,
      createdAt: new Date().toISOString(),
      description: description.trim() || undefined,
    }
    onSave(goal)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ padding: '32px' }}>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Nový cíl</p>
          <h2 style={{ fontSize: 22, letterSpacing: '-0.03em' }}>Přidat spoření</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Emoji picker */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Ikona</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SAVINGS_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 8,
                    fontSize: 20,
                    lineHeight: 1,
                    border: emoji === e ? '2px solid var(--violet)' : '2px solid var(--border)',
                    background: emoji === e ? 'var(--violet-dim)' : 'var(--card)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Název</label>
            <input
              className="input-base"
              type="text"
              placeholder="Např. Dovolená v Itálii"
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
              placeholder="Např. Léto 2026"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Cílová částka (Kč)</label>
              <input
                className="input-base"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={target}
                onChange={e => setTarget(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Již naspořeno (Kč)</label>
              <input
                className="input-base"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={saved}
                onChange={e => setSaved(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>Barva</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {SAVINGS_COLORS.map(c => (
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
              style={{ flex: 2, justifyContent: 'center', opacity: (!name.trim() || targetNum <= 0) ? 0.5 : 1 }}
              disabled={!name.trim() || targetNum <= 0}
            >
              Přidat cíl
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
