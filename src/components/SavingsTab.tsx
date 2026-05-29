import { useState } from 'react'
import type { SavingsGoal } from '../types'
import { SavingsCard } from './SavingsCard'
import { AddSavingsGoalModal } from './AddSavingsGoalModal'
import { formatCurrency } from '../utils/formatters'

interface SavingsTabProps {
  goals: SavingsGoal[]
  onGoalsChange: (goals: SavingsGoal[]) => void
}

export function SavingsTab({ goals, onGoalsChange }: SavingsTabProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const active = goals.filter(g => !g.archived)
  const archived = goals.filter(g => g.archived)

  const totalTarget = active.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = active.reduce((s, g) => s + g.savedAmount, 0)
  const totalRemaining = totalTarget - totalSaved

  function handleUpdate(updated: SavingsGoal) {
    onGoalsChange(goals.map(g => g.id === updated.id ? updated : g))
  }

  function handleArchive(id: string) {
    onGoalsChange(goals.map(g => g.id === id ? { ...g, archived: true } : g))
  }

  function handleDelete(id: string) {
    if (window.confirm('Opravdu smazat tento cíl?')) {
      onGoalsChange(goals.filter(g => g.id !== id))
    }
  }

  function handleUnarchive(id: string) {
    onGoalsChange(goals.map(g => g.id === id ? { ...g, archived: false } : g))
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Summary bar */}
      {active.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 32,
        }}>
          {[
            { label: 'Celkový cíl', value: formatCurrency(totalTarget), color: 'var(--text-primary)' },
            { label: 'Celkem naspořeno', value: formatCurrency(totalSaved), color: 'var(--emerald)' },
            { label: 'Zbývá naspořit', value: formatCurrency(totalRemaining), color: 'var(--violet)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>
                {label}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color, letterSpacing: '-0.02em', fontWeight: 500 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Active goals grid */}
      {active.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(52,211,153,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Žádné cíle spoření</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Přidej svůj první cíl a sleduj, jak se ti sen přibližuje.
          </p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            Přidat cíl
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {active.map((g, i) => (
            <SavingsCard
              key={g.id}
              goal={g}
              onUpdate={handleUpdate}
              onArchive={handleArchive}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <button
            onClick={() => setShowArchived(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              color: 'var(--text-secondary)', fontSize: 13,
              fontFamily: 'var(--font-display)', fontWeight: 600,
              marginBottom: 16, letterSpacing: '0.02em',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              style={{ transform: showArchived ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M6 4l4 4-4 4" />
            </svg>
            Archiv ({archived.length})
          </button>
          {showArchived && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, opacity: 0.6 }}>
              {archived.map(g => (
                <div key={g.id} style={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '16px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{g.emoji}</span>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{g.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleUnarchive(g.id)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>
                      Obnovit
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12, color: 'var(--red)' }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      {active.length > 0 && (
        <button
          onClick={() => setShowAdd(true)}
          className="btn-primary"
          style={{
            position: 'fixed', bottom: 32, right: 32,
            borderRadius: 50, padding: '14px 24px', fontSize: 14,
            boxShadow: '0 8px 32px rgba(52,211,153,0.25)',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Přidat cíl
        </button>
      )}

      {showAdd && (
        <AddSavingsGoalModal
          onClose={() => setShowAdd(false)}
          onSave={g => { onGoalsChange([...goals, g]); setShowAdd(false) }}
        />
      )}
    </div>
  )
}
