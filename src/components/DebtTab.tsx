import { useState } from 'react'
import type { Debt } from '../types'
import { DebtCard } from './DebtCard'
import { AddDebtModal } from './AddDebtModal'
import { formatCurrency, formatDate } from '../utils/formatters'

interface DebtTabProps {
  debts: Debt[]
  onDebtsChange: (debts: Debt[]) => void
}

export function DebtTab({ debts, onDebtsChange }: DebtTabProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const active = debts.filter(d => !d.archived)
  const archived = debts.filter(d => d.archived)
  const totalDebt = active.reduce((s, d) => s + d.totalAmount, 0)
  const totalPaid = active.reduce((s, d) => s + d.paidAmount, 0)
  const totalRemaining = totalDebt - totalPaid

  function handleUpdate(updated: Debt) {
    onDebtsChange(debts.map(d => d.id === updated.id ? updated : d))
  }

  function handleArchive(id: string) {
    onDebtsChange(debts.map(d => d.id === id ? { ...d, archived: true } : d))
  }

  function handleDelete(id: string) {
    if (window.confirm('Opravdu smazat tento dluh?')) {
      onDebtsChange(debts.filter(d => d.id !== id))
    }
  }

  function handleUnarchive(id: string) {
    onDebtsChange(debts.map(d => d.id === id ? { ...d, archived: false } : d))
  }

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Přidat dluh
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
            { label: 'Celkový dluh', value: formatCurrency(totalDebt), color: 'var(--text-primary)' },
            { label: 'Celkem splaceno', value: formatCurrency(totalPaid), color: 'var(--emerald)' },
            { label: 'Zbývá splatit', value: formatCurrency(totalRemaining), color: 'var(--rose)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
            }}>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>{label}</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color, letterSpacing: '-0.02em', fontWeight: 500 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active debts grid */}
      {active.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--violet-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>Žádné dluhy</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Přidej svůj první dluh a začni sledovat splácení.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
            Přidat dluh
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {active.map((d, i) => (
            <DebtCard key={d.id} debt={d} onUpdate={handleUpdate} onArchive={handleArchive} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}

      {/* Wins timeline */}
      {archived.length > 0 && (
        <DebtWinsTimeline
          archived={archived}
          showArchived={showArchived}
          onToggle={() => setShowArchived(s => !s)}
          onUnarchive={handleUnarchive}
          onDelete={handleDelete}
        />
      )}


      {showAdd && <AddDebtModal onClose={() => setShowAdd(false)} onSave={d => { onDebtsChange([...debts, d]); setShowAdd(false) }} />}
    </div>
  )
}

function DebtWinsTimeline({ archived, showArchived, onToggle, onUnarchive, onDelete }: {
  archived: Debt[]
  showArchived: boolean
  onToggle: () => void
  onUnarchive: (id: string) => void
  onDelete: (id: string) => void
}) {
  const sorted = [...archived].sort((a, b) => {
    const aDate = a.payments.length > 0 ? a.payments[a.payments.length - 1].date : a.createdAt
    const bDate = b.payments.length > 0 ? b.payments[b.payments.length - 1].date : b.createdAt
    return bDate.localeCompare(aDate)
  })

  const totalWon = archived.reduce((s, d) => s + d.totalAmount, 0)

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
        Splacené dluhy
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-mono)',
          background: 'rgba(52,211,153,0.12)', color: 'var(--emerald)',
          border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: 20, padding: '1px 8px',
        }}>
          {archived.length} · {formatCurrency(totalWon)}
        </span>
      </button>

      {showArchived && (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Timeline vertical line */}
          <div style={{
            position: 'absolute', left: 7, top: 8, bottom: 8,
            width: 2, background: 'linear-gradient(to bottom, var(--emerald), rgba(52,211,153,0.1))',
            borderRadius: 1,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sorted.map((d, i) => {
              const lastPayment = d.payments.length > 0 ? d.payments[d.payments.length - 1] : null
              const firstDate = d.createdAt.split('T')[0]
              const lastDate = lastPayment?.date ?? firstDate
              const monthsDiff = (() => {
                const start = new Date(firstDate)
                const end = new Date(lastDate)
                return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
              })()

              return (
                <div key={d.id} style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute', left: -24, top: 14,
                    width: 14, height: 14, borderRadius: '50%',
                    background: i === 0 ? 'var(--emerald)' : 'var(--card)',
                    border: `2px solid ${i === 0 ? 'var(--emerald)' : d.color}`,
                    boxShadow: i === 0 ? '0 0 10px rgba(52,211,153,0.4)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {i === 0 && (
                      <svg width="7" height="7" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 4l3 3 5-6" />
                      </svg>
                    )}
                  </div>

                  {/* Card */}
                  <div style={{
                    flex: 1,
                    background: i === 0 ? 'rgba(52,211,153,0.05)' : 'var(--card)',
                    border: `1px solid ${i === 0 ? 'rgba(52,211,153,0.2)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {d.name}
                        </p>
                        {i === 0 && (
                          <span style={{ fontSize: 10, color: 'var(--emerald)', fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.04em' }}>
                            NEJNOVĚJŠÍ
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: d.color, letterSpacing: '-0.02em' }}>
                          {formatCurrency(d.totalAmount)}
                        </span>
                        {lastPayment && (
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                            splaceno {formatDate(lastDate)}
                          </span>
                        )}
                        {monthsDiff > 0 && (
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                            · trvalo {monthsDiff} {monthsDiff === 1 ? 'měsíc' : monthsDiff < 5 ? 'měsíce' : 'měsíců'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => onUnarchive(d.id)} className="btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }}>
                        Obnovit
                      </button>
                      <button onClick={() => onDelete(d.id)} className="btn-ghost" style={{ padding: '5px 8px', fontSize: 11, color: 'var(--red)' }}>
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
