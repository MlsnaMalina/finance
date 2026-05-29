import { useState } from 'react'
import type { Expense } from '../types'
import { EXPENSE_CATEGORIES, generateId } from '../utils/formatters'

interface AddExpenseModalProps {
  expense?: Expense
  onClose: () => void
  onSave: (e: Expense) => void
  onDelete?: (id: string) => void
}

export function AddExpenseModal({ expense, onClose, onSave, onDelete }: AddExpenseModalProps) {
  const today = new Date().toISOString().split('T')[0]
  const [name, setName] = useState(expense?.name ?? '')
  const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : '')
  const [category, setCategory] = useState(expense?.category ?? EXPENSE_CATEGORIES[0].name)
  const [date, setDate] = useState(expense?.date ?? today)
  const [note, setNote] = useState(expense?.note ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) { setError('Zadej název výdaje'); return }
    const num = parseFloat(amount.replace(/\s/g, '').replace(',', '.'))
    if (isNaN(num) || num <= 0) { setError('Zadej platnou částku'); return }
    onSave({
      id: expense?.id ?? generateId(),
      name: trimmedName,
      amount: num,
      category,
      date,
      note: note.trim() || undefined,
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>
            {expense ? 'Upravit výdaj' : 'Přidat výdaj'}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 8px' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Název">
            <input
              className="input"
              value={name}
              onChange={e => { setName(e.target.value); setError(null) }}
              placeholder="Potraviny Albert"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Částka (Kč)">
              <input
                className="input"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(null) }}
                placeholder="320"
                inputMode="decimal"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
            </Field>
            <Field label="Datum">
              <input
                className="input"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Kategorie">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {EXPENSE_CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 6px', borderRadius: 8, fontSize: 11,
                    fontFamily: 'var(--font-body)', lineHeight: 1.3,
                    background: category === cat.name ? `${cat.color}18` : 'var(--bg-2)',
                    border: `1px solid ${category === cat.name ? cat.color + '55' : 'var(--border)'}`,
                    color: category === cat.name ? cat.color : 'var(--text-secondary)',
                    transition: 'all 0.15s', cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                  <span style={{ textAlign: 'center' }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Poznámka (volitelná)">
            <input
              className="input"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Týdenní nákup..."
            />
          </Field>

          {error && (
            <p style={{ fontSize: 12, color: 'var(--rose)', margin: 0 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {expense && onDelete && (
              <button
                onClick={() => { if (confirm('Smazat výdaj?')) onDelete(expense.id) }}
                className="btn-ghost"
                style={{ padding: '10px 16px', color: 'var(--rose)', borderColor: 'rgba(244,114,182,0.3)' }}
              >
                Smazat
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button onClick={onClose} className="btn-ghost" style={{ padding: '10px 16px' }}>Zrušit</button>
            <button onClick={handleSave} className="btn-primary" style={{ padding: '10px 20px' }}>
              {expense ? 'Uložit' : 'Přidat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  )
}
