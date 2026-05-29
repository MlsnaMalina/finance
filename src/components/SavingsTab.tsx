import { useState } from 'react'
import type { SavingsGoal } from '../types'
import { SavingsCard } from './SavingsCard'
import { AddSavingsGoalModal } from './AddSavingsGoalModal'
import { formatCurrency, formatDate } from '../utils/formatters'

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
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Přidat cíl
        </button>
      </div>

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
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="12" cy="12" r="2" fill="var(--emerald)" stroke="none" />
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

      {/* Wins timeline */}
      {archived.length > 0 && (
        <SavingsWinsTimeline
          archived={archived}
          showArchived={showArchived}
          onToggle={() => setShowArchived(s => !s)}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
        />
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

function SavingsWinsTimeline({ archived, showArchived, onToggle, onUnarchive, onDelete }: {
  archived: SavingsGoal[]
  showArchived: boolean
  onToggle: () => void
  onUnarchive: (id: string) => void
  onDelete: (id: string) => void
}) {
  const sorted = [...archived].sort((a, b) => {
    const aDate = a.deposits.length > 0 ? a.deposits[a.deposits.length - 1].date : a.createdAt
    const bDate = b.deposits.length > 0 ? b.deposits[b.deposits.length - 1].date : b.createdAt
    return bDate.localeCompare(aDate)
  })

  const totalSaved = archived.reduce((s, g) => s + g.savedAmount, 0)

  return (
    <div style={{ marginTop: 48 }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--text-secondary)', fontSize: 13,
          fontFamily: 'var(--font-display)', fontWeight: 600,
          marginBottom: showArchived ? 24 : 0, letterSpacing: '0.02em',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          style={{ transform: showArchived ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 4l4 4-4 4" />
        </svg>
        Dosažené cíle
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-mono)',
          background: 'rgba(167,139,250,0.12)', color: 'var(--violet)',
          border: '1px solid rgba(167,139,250,0.2)',
          borderRadius: 20, padding: '1px 8px',
        }}>
          {archived.length} · {formatCurrency(totalSaved)}
        </span>
      </button>

      {showArchived && (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{
            position: 'absolute', left: 7, top: 8, bottom: 8,
            width: 2, background: 'linear-gradient(to bottom, var(--violet), rgba(167,139,250,0.1))',
            borderRadius: 1,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sorted.map((g, i) => {
              const lastDeposit = g.deposits.length > 0 ? g.deposits[g.deposits.length - 1] : null
              const lastDate = lastDeposit?.date ?? g.createdAt.split('T')[0]
              const monthsDiff = (() => {
                const start = new Date(g.createdAt.split('T')[0])
                const end = new Date(lastDate)
                return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
              })()
              const completed = g.savedAmount >= g.targetAmount

              return (
                <div key={g.id} style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    position: 'absolute', left: -24, top: 14,
                    width: 14, height: 14, borderRadius: '50%',
                    background: i === 0 ? 'var(--violet)' : 'var(--card)',
                    border: `2px solid ${i === 0 ? 'var(--violet)' : g.color}`,
                    boxShadow: i === 0 ? '0 0 10px rgba(167,139,250,0.4)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 8,
                  }}>
                    {i === 0 && <span style={{ lineHeight: 1 }}>★</span>}
                  </div>

                  <div style={{
                    flex: 1,
                    background: i === 0 ? 'rgba(167,139,250,0.05)' : 'var(--card)',
                    border: `1px solid ${i === 0 ? 'rgba(167,139,250,0.2)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{g.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {g.name}
                        </p>
                        {completed && (
                          <span style={{ fontSize: 10, color: 'var(--emerald)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.04em' }}>
                            SPLNĚNO
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: g.color, letterSpacing: '-0.02em' }}>
                          {formatCurrency(g.savedAmount)}
                          {!completed && <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}> / {formatCurrency(g.targetAmount)}</span>}
                        </span>
                        {lastDeposit && (
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                            {formatDate(lastDate)}
                          </span>
                        )}
                        {monthsDiff > 0 && (
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                            · {monthsDiff} {monthsDiff === 1 ? 'měsíc' : monthsDiff < 5 ? 'měsíce' : 'měsíců'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => onUnarchive(g.id)} className="btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }}>
                        Obnovit
                      </button>
                      <button onClick={() => onDelete(g.id)} className="btn-ghost" style={{ padding: '5px 8px', fontSize: 11, color: 'var(--red)' }}>
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
