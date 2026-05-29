import { useEffect, useRef, useState } from 'react'
import type { Debt, SavingsGoal, SavingsDeposit, DebtPayment } from '../types'
import { formatCurrency } from '../utils/formatters'

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

type Step = 'choose' | 'debt' | 'savings'

interface QuickAddFABProps {
  debts: Debt[]
  goals: SavingsGoal[]
  onDebtsChange: (d: Debt[]) => void
  onGoalsChange: (g: SavingsGoal[]) => void
}

export function QuickAddFAB({ debts, goals, onDebtsChange, onGoalsChange }: QuickAddFABProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 300,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--violet), var(--rose))',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(167,139,250,0.45)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(167,139,250,0.6)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(167,139,250,0.45)'
        }}
        title="Rychlé přidání"
      >
        <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
          <path d="M8 3v10M3 8h10" />
        </svg>
      </button>

      {open && (
        <QuickAddModal
          debts={debts}
          goals={goals}
          onDebtsChange={onDebtsChange}
          onGoalsChange={onGoalsChange}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function QuickAddModal({ debts, goals, onDebtsChange, onGoalsChange, onClose }: QuickAddFABProps & { onClose: () => void }) {
  const [step, setStep] = useState<Step>('choose')
  const [saved, setSaved] = useState(false)

  const activeDebts = debts.filter(d => !d.archived && d.totalAmount > d.paidAmount)
  const activeGoals = goals.filter(g => !g.archived && g.savedAmount < g.targetAmount)

  function handleSaveDebt(debtId: string, amount: number, date: string) {
    const payment: DebtPayment = { id: generateId(), amount, date }
    onDebtsChange(debts.map(d => {
      if (d.id !== debtId) return d
      return { ...d, paidAmount: d.paidAmount + amount, payments: [...d.payments, payment] }
    }))
    flash()
  }

  function handleSaveSavings(goalId: string, amount: number, date: string, note: string) {
    const deposit: SavingsDeposit = { id: generateId(), amount, date, note: note || undefined }
    onGoalsChange(goals.map(g => {
      if (g.id !== goalId) return g
      return { ...g, savedAmount: g.savedAmount + amount, deposits: [...g.deposits, deposit] }
    }))
    flash()
  }

  function flash() {
    setSaved(true)
    setTimeout(() => onClose(), 900)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ padding: '28px', maxWidth: 380, width: '100%' }}>
        {saved ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(52,211,153,0.15)', border: '2px solid var(--emerald)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
            }}>
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="var(--emerald)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l4 4 6-7" />
              </svg>
            </div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16 }}>Uloženo</p>
          </div>
        ) : step === 'choose' ? (
          <ChooseStep
            onChoose={setStep}
            hasDebts={activeDebts.length > 0}
            hasGoals={activeGoals.length > 0}
            onClose={onClose}
          />
        ) : step === 'debt' ? (
          <DebtStep debts={activeDebts} onSave={handleSaveDebt} onBack={() => setStep('choose')} onClose={onClose} />
        ) : (
          <SavingsStep goals={activeGoals} onSave={handleSaveSavings} onBack={() => setStep('choose')} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

function ChooseStep({ onChoose, hasDebts, hasGoals, onClose }: {
  onChoose: (s: Step) => void
  hasDebts: boolean
  hasGoals: boolean
  onClose: () => void
}) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Co chceš zaznamenat?</h2>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 8px' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <TypeButton
          label="Splátka dluhu"
          description="Zaznam platbu na existující dluh"
          disabled={!hasDebts}
          disabledNote="Žádné aktivní dluhy"
          color="var(--rose)"
          icon={<path d="M3 8l4 4 6-7" />}
          onClick={() => onChoose('debt')}
        />
        <TypeButton
          label="Vklad na spoření"
          description="Přidej částku k spořicímu cíli"
          disabled={!hasGoals}
          disabledNote="Žádné aktivní cíle"
          color="var(--emerald)"
          icon={<path d="M8 12V4M5 7l3-3 3 3" />}
          onClick={() => onChoose('savings')}
        />
      </div>
    </>
  )
}

function TypeButton({ label, description, disabled, disabledNote, color, icon, onClick }: {
  label: string
  description: string
  disabled: boolean
  disabledNote: string
  color: string
  icon: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 'var(--radius-md)',
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left', width: '100%',
        opacity: disabled ? 0.45 : 1,
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'var(--card)' } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-2)' }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: `${color}20`, border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{disabled ? disabledNote : description}</p>
      </div>
    </button>
  )
}

function DebtStep({ debts, onSave, onBack, onClose }: {
  debts: Debt[]
  onSave: (id: string, amount: number, date: string) => void
  onBack: () => void
  onClose: () => void
}) {
  const [selectedId, setSelectedId] = useState(debts[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const selected = debts.find(d => d.id === selectedId)
  const amountNum = parseFloat(amount.replace(',', '.')) || 0

  return (
    <form onSubmit={e => { e.preventDefault(); if (amountNum > 0 && selectedId) onSave(selectedId, amountNum, date) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <button type="button" onClick={onBack} className="btn-ghost" style={{ padding: '4px 8px' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 4L6 8l4 4" /></svg>
        </button>
        <h2 style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Splátka dluhu</h2>
        <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '4px 8px', marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Dluh</label>
        <select
          className="input-base"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{ width: '100%' }}
        >
          {debts.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} — zbývá {formatCurrency(d.totalAmount - d.paidAmount)}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <ProgressBar paid={selected.paidAmount} total={selected.totalAmount} color={selected.color} />
      )}

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Částka (Kč)</label>
        <input ref={inputRef} className="input-base" type="text" inputMode="decimal" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Datum</label>
        <input className="input-base" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Zrušit</button>
        <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: amountNum <= 0 ? 0.5 : 1 }} disabled={amountNum <= 0}>
          Uložit splátku
        </button>
      </div>
    </form>
  )
}

function SavingsStep({ goals, onSave, onBack, onClose }: {
  goals: SavingsGoal[]
  onSave: (id: string, amount: number, date: string, note: string) => void
  onBack: () => void
  onClose: () => void
}) {
  const [selectedId, setSelectedId] = useState(goals[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const selected = goals.find(g => g.id === selectedId)
  const amountNum = parseFloat(amount.replace(',', '.')) || 0

  return (
    <form onSubmit={e => { e.preventDefault(); if (amountNum > 0 && selectedId) onSave(selectedId, amountNum, date, note) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <button type="button" onClick={onBack} className="btn-ghost" style={{ padding: '4px 8px' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 4L6 8l4 4" /></svg>
        </button>
        <h2 style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Vklad na spoření</h2>
        <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '4px 8px', marginLeft: 'auto' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Cíl</label>
        <select
          className="input-base"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{ width: '100%' }}
        >
          {goals.map(g => (
            <option key={g.id} value={g.id}>
              {g.name} — zbývá {formatCurrency(g.targetAmount - g.savedAmount)}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <ProgressBar paid={selected.savedAmount} total={selected.targetAmount} color={selected.color} />
      )}

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Částka (Kč)</label>
        <input ref={inputRef} className="input-base" type="text" inputMode="decimal" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Datum</label>
        <input className="input-base" type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Poznámka (volitelné)</label>
        <input className="input-base" type="text" placeholder="Např. Výplata" value={note} onChange={e => setNote(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Zrušit</button>
        <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: amountNum <= 0 ? 0.5 : 1 }} disabled={amountNum <= 0}>
          Uložit vklad
        </button>
      </div>
    </form>
  )
}

function ProgressBar({ paid, total, color }: { paid: number; total: number; color: string }) {
  const pct = Math.min(100, (paid / total) * 100)
  return (
    <div style={{ background: 'var(--bg-2)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s' }} />
    </div>
  )
}
