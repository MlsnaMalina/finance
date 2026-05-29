import type { RecurringPayment, Expense } from '../types'
import { formatCurrency, MONTH_NAMES } from '../utils/formatters'

interface AnnualComparisonProps {
  payments: RecurringPayment[]
  expenses: Expense[]
  income: number | null
  onClose: () => void
}

interface MonthData {
  year: number
  month: number
  label: string
  fixed: number
  variable: number
  total: number
  pct: number
  over80: boolean
}

export function AnnualComparison({ payments, expenses, income, onClose }: AnnualComparisonProps) {
  const now = new Date()

  const months: MonthData[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = d.getMonth() + 1

    const monthly = payments.filter(p => p.active && p.frequency === 'monthly')
    const yearly = payments.filter(p => p.active && p.frequency === 'yearly' && p.monthOfYear === m)
    const fixed = [...monthly, ...yearly].reduce((s, p) => s + p.amount, 0)

    const variable = expenses
      .filter(e => { const ed = new Date(e.date); return ed.getFullYear() === y && ed.getMonth() + 1 === m })
      .reduce((s, e) => s + e.amount, 0)

    const total = fixed + variable
    const pct = income && income > 0 ? (total / income) * 100 : 0

    months.push({ year: y, month: m, label: `${MONTH_NAMES[m - 1].slice(0, 3)} ${y}`, fixed, variable, total, pct, over80: pct >= 80 })
  }

  const maxTotal = Math.max(...months.map(m => m.total), income ?? 0, 1)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 680,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
              Roční srovnání
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
              Posledních 12 měsíců — fixní + variabilní výdaje
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px 8px' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <LegendItem color="#A78BFA" label="Fixní platby" />
          <LegendItem color="#F472B6" label="Výdaje" />
          {income && <LegendItem color="rgba(52,211,153,0.4)" label={`Příjem ${formatCurrency(income)}`} dashed />}
        </div>

        {/* Monthly bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {months.map(m => (
            <MonthRow key={`${m.year}-${m.month}`} data={m} maxTotal={maxTotal} income={income} />
          ))}
        </div>

        {/* Summary */}
        <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-2)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'center' }}>
            <SummaryItem
              label="Průměrné výdaje/měs."
              value={formatCurrency(Math.round(months.reduce((s, m) => s + m.total, 0) / 12))}
            />
            <SummaryItem
              label="Nejvyšší měsíc"
              value={months.reduce((a, m) => m.total > a.total ? m : a, months[0])?.label ?? '—'}
            />
            <SummaryItem
              label="Měsíců nad 80 %"
              value={String(months.filter(m => m.over80).length)}
              color="var(--rose)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MonthRow({ data, maxTotal, income }: { data: MonthData; maxTotal: number; income: number | null }) {
  const isCurrentMonth = (() => {
    const n = new Date()
    return data.year === n.getFullYear() && data.month === n.getMonth() + 1
  })()

  const fixedW = (data.fixed / maxTotal) * 100
  const varW = (data.variable / maxTotal) * 100
  const incomeW = income ? Math.min((income / maxTotal) * 100, 100) : null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px', gap: 12, alignItems: 'center' }}>
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: isCurrentMonth ? 700 : 400,
        color: isCurrentMonth ? 'var(--text-primary)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
      }}>
        {data.label}
        {isCurrentMonth && <span style={{ color: 'var(--violet)', marginLeft: 4, fontSize: 10 }}>●</span>}
      </span>

      <div style={{ position: 'relative', height: 20 }}>
        {/* Track */}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-2)', borderRadius: 4 }} />
        {/* Fixed portion */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${fixedW}%`, background: '#A78BFA',
          borderRadius: varW > 0 ? '4px 0 0 4px' : 4,
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
        {/* Variable portion */}
        {varW > 0 && (
          <div style={{
            position: 'absolute', left: `${fixedW}%`, top: 0, bottom: 0,
            width: `${varW}%`,
            background: data.over80 ? 'var(--rose)' : '#F472B6',
            borderRadius: '0 4px 4px 0',
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        )}
        {/* Income line */}
        {incomeW !== null && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${incomeW}%`,
            width: 2,
            background: 'rgba(52,211,153,0.6)',
            borderRadius: 1,
          }} />
        )}
      </div>

      <div style={{ textAlign: 'right' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 12,
          color: data.over80 ? 'var(--rose)' : 'var(--text-secondary)',
          fontWeight: data.over80 ? 600 : 400,
        }}>
          {data.total > 0 ? formatCurrency(data.total) : '—'}
        </span>
        {income && data.total > 0 && (
          <span style={{ fontSize: 10, color: data.over80 ? 'var(--rose)' : 'var(--text-tertiary)', marginLeft: 4 }}>
            {Math.round(data.pct)}%
          </span>
        )}
      </div>
    </div>
  )
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 20, height: 8, borderRadius: 2, background: color,
        border: dashed ? '1px dashed rgba(52,211,153,0.6)' : 'none',
      }} />
      <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{label}</span>
    </div>
  )
}

function SummaryItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: color ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}
