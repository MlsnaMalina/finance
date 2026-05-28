import { useState } from 'react'
import type { Debt } from '../types'
import { DebtCard } from './DebtCard'
import { AddDebtModal } from './AddDebtModal'
import { formatCurrency } from '../utils/formatters'

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

      {/* Archived section */}
      {archived.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <button
            onClick={() => setShowArchived(s => !s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              marginBottom: 16,
              letterSpacing: '0.02em',
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
              {archived.map(d => (
                <div key={d.id} style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{d.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(d.totalAmount)}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleUnarchive(d.id)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>
                      Obnovit
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12, color: 'var(--red)' }}>
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
            position: 'fixed',
            bottom: 32,
            right: 32,
            borderRadius: 50,
            padding: '14px 24px',
            fontSize: 14,
            boxShadow: '0 8px 32px rgba(167, 139, 250, 0.35)',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Přidat dluh
        </button>
      )}

      {showAdd && <AddDebtModal onClose={() => setShowAdd(false)} onSave={d => { onDebtsChange([...debts, d]); setShowAdd(false) }} />}
    </div>
  )
}
