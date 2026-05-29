import { useRef, useState } from 'react'
import type { Debt, RecurringPayment, SavingsGoal, Expense } from '../types'

interface BackupData {
  version: number
  exportedAt: string
  debts: Debt[]
  payments: RecurringPayment[]
  goals: SavingsGoal[]
  expenses: Expense[]
}

interface BackupMenuProps {
  debts: Debt[]
  payments: RecurringPayment[]
  goals: SavingsGoal[]
  expenses: Expense[]
  onDebtsChange: (d: Debt[]) => void
  onPaymentsChange: (p: RecurringPayment[]) => void
  onGoalsChange: (g: SavingsGoal[]) => void
  onExpensesChange: (e: Expense[]) => void
}

export function BackupMenu({ debts, payments, goals, expenses, onDebtsChange, onPaymentsChange, onGoalsChange, onExpensesChange }: BackupMenuProps) {
  const [open, setOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const data: BackupData = {
      version: 2,
      exportedAt: new Date().toISOString().split('T')[0],
      debts,
      payments,
      goals,
      expenses,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance-zaloha-${data.exportedAt}.json`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  function handleImportClick() {
    setError(null)
    fileRef.current?.click()
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string) as Partial<BackupData>
        if (!raw.debts || !raw.payments || !raw.goals) {
          setError('Soubor neobsahuje platná data (chybí dluhy, platby nebo cíle).')
          return
        }
        setImporting(true)
        onDebtsChange(raw.debts)
        onPaymentsChange(raw.payments)
        onGoalsChange(raw.goals)
        onExpensesChange(raw.expenses ?? [])
        setImporting(false)
        setOpen(false)
      } catch {
        setError('Nepodařilo se načíst soubor — zkontroluj, že jde o platný JSON.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(o => !o); setError(null) }}
        title="Záloha dat"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontFamily: 'var(--font-body)',
          color: 'var(--text-secondary)', background: 'transparent',
          border: '1px solid var(--border)', borderRadius: 8,
          padding: '6px 10px', cursor: 'pointer', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-active)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v8M5 7l3 3 3-3M3 12h10" />
        </svg>
        Záloha
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 199 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)', padding: 8,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <MenuItem
              icon={<path d="M8 2v8M5 7l3 3 3-3M3 12h10" />}
              label="Exportovat data"
              description="Stáhni JSON se všemi daty"
              onClick={handleExport}
            />
            <MenuItem
              icon={<path d="M8 14V6M5 9l3-3 3 3M3 4h10" />}
              label="Importovat data"
              description="Načti zálohu ze souboru"
              onClick={handleImportClick}
              loading={importing}
            />
            {error && (
              <p style={{ fontSize: 11, color: 'var(--rose)', padding: '6px 10px', margin: '4px 0 0' }}>
                {error}
              </p>
            )}
          </div>
        </>
      )}

      <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

function MenuItem({
  icon, label, description, onClick, loading,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  loading?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        width: '100%', textAlign: 'left',
        padding: '10px 10px', borderRadius: 6,
        background: 'transparent', border: 'none', cursor: loading ? 'wait' : 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
        {icon}
      </svg>
      <div>
        <p style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{description}</p>
      </div>
    </button>
  )
}
