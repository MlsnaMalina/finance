import { useState, useRef, useEffect } from 'react'
import type { RecurringPayment, Expense } from '../types'
import { formatCurrency, EXPENSE_CATEGORIES, MONTH_NAMES } from '../utils/formatters'
import { AddExpenseModal } from './AddExpenseModal'
import { AnnualComparison } from './AnnualComparison'

interface TrackerViewProps {
  payments: RecurringPayment[]
  expenses: Expense[]
  onExpensesChange: (e: Expense[]) => void
  income: number | null
  onIncomeChange: (v: number | null) => void
}

export function TrackerView({ payments, expenses, onExpensesChange, income, onIncomeChange }: TrackerViewProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [showAdd, setShowAdd] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [showAnnual, setShowAnnual] = useState(false)

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1
  const currentDay = isCurrentMonth ? now.getDate() : new Date(year, month, 0).getDate()

  // Fixed payments for this month
  const activeMonthly = payments.filter(p => p.active && p.frequency === 'monthly')
  const activeYearly = payments.filter(p => p.active && p.frequency === 'yearly' && p.monthOfYear === month)
  const allFixed = [...activeMonthly, ...activeYearly]
  const totalFixed = allFixed.reduce((s, p) => s + p.amount, 0)

  // Paid fixed = those whose dayOfMonth <= currentDay
  const paidFixed = allFixed.filter(p => p.dayOfMonth <= currentDay).reduce((s, p) => s + p.amount, 0)

  // Variable expenses for selected month
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
  const totalVariable = monthExpenses.reduce((s, e) => s + e.amount, 0)

  const totalSpent = totalFixed + totalVariable
  const remaining = income !== null ? income - totalSpent : null
  const spentPct = income !== null && income > 0 ? (totalSpent / income) * 100 : 0
  const over80 = spentPct >= 80

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (isCurrentMonth) return
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handleSave(e: Expense) {
    const exists = expenses.find(x => x.id === e.id)
    if (exists) onExpensesChange(expenses.map(x => x.id === e.id ? e : x))
    else onExpensesChange([...expenses, e])
    setShowAdd(false)
    setEditExpense(null)
  }

  function handleDelete(id: string) {
    onExpensesChange(expenses.filter(e => e.id !== id))
    setEditExpense(null)
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <MonthPicker year={year} month={month} onPrev={prevMonth} onNext={nextMonth} isCurrentMonth={isCurrentMonth} />
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowAnnual(true)}
          className="btn-ghost"
          style={{ padding: '8px 14px', fontSize: 12, gap: 6, display: 'flex', alignItems: 'center' }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="2" y="3" width="12" height="11" rx="2" />
            <path d="M5 1v4M11 1v4M2 7h12" />
            <path d="M5 10h2M9 10h2M5 13h2" />
          </svg>
          Roční srovnání
        </button>
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Přidat výdaj
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Left: rings + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <ConcentricRings
            totalFixed={totalFixed}
            paidFixed={paidFixed}
            expenses={monthExpenses}
            income={income}
            totalSpent={totalSpent}
            remaining={remaining}
            over80={over80}
          />

          <StatsCard
            income={income}
            onIncomeChange={onIncomeChange}
            totalFixed={totalFixed}
            paidFixed={paidFixed}
            totalVariable={totalVariable}
            remaining={remaining}
            spentPct={spentPct}
            over80={over80}
          />
        </div>

        {/* Right: expense list */}
        <ExpenseList expenses={monthExpenses} onEdit={setEditExpense} />
      </div>

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {editExpense && (
        <AddExpenseModal
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
      {showAnnual && (
        <AnnualComparison
          payments={payments}
          expenses={expenses}
          income={income}
          onClose={() => setShowAnnual(false)}
        />
      )}
    </div>
  )
}

// ─── Concentric Rings ──────────────────────────────────────────────────────

function ConcentricRings({ totalFixed, paidFixed, expenses, income, totalSpent, remaining, over80 }: {
  totalFixed: number
  paidFixed: number
  expenses: Expense[]
  income: number | null
  totalSpent: number
  remaining: number | null
  over80: boolean
}) {
  const size = 260
  const cx = size / 2
  const cy = size / 2

  const outerR = 108
  const outerStroke = 18
  const innerR = 76
  const innerStroke = 16

  const outerCirc = 2 * Math.PI * outerR
  const innerCirc = 2 * Math.PI * innerR

  // Outer ring: fixed payments progress (CW from top)
  // Full arc represents totalFixed/income portion, filled portion = paidFixed
  const outerFraction = income && income > 0 ? Math.min(totalFixed / income, 1) : (totalFixed > 0 ? 1 : 0)
  const outerPaidFraction = totalFixed > 0 ? Math.min(paidFixed / totalFixed, 1) : 0
  const outerTotalDash = outerFraction * outerCirc
  const outerPaidDash = outerPaidFraction * outerTotalDash

  // Inner ring: variable expenses by category (CCW from top = mirrored CW)
  const totalVariable = expenses.reduce((s, e) => s + e.amount, 0)
  const innerFraction = income && income > 0 ? Math.min(totalVariable / income, 1) : (totalVariable > 0 ? Math.min(totalVariable / Math.max(totalSpent, 1), 1) : 0)

  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    sum: expenses.filter(e => e.category === cat.name).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.sum > 0)

  const innerSegments = byCategory.map(cat => ({
    color: cat.color,
    length: (cat.sum / (totalVariable || 1)) * innerFraction * innerCirc,
  }))

  // Compute segment offsets for inner ring
  const innerSegs: { color: string; dash: string; offset: number }[] = []
  let accumulated = 0
  for (const seg of innerSegments) {
    innerSegs.push({
      color: seg.color,
      dash: `${seg.length} ${innerCirc - seg.length}`,
      offset: -accumulated,
    })
    accumulated += seg.length
  }

  const centerColor = over80 ? 'var(--rose)' : 'var(--text-primary)'
  const centerLabel = remaining !== null ? formatCurrency(remaining) : income !== null ? formatCurrency(income) : '—'

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <svg width={size} height={size}>
        {/* Outer ring track */}
        <circle
          cx={cx} cy={cy} r={outerR}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={outerStroke}
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Outer ring: upcoming fixed (muted) */}
        {outerTotalDash > 0 && (
          <circle
            cx={cx} cy={cy} r={outerR}
            fill="none"
            stroke="rgba(167,139,250,0.2)"
            strokeWidth={outerStroke}
            strokeLinecap="round"
            strokeDasharray={`${outerTotalDash} ${outerCirc - outerTotalDash}`}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        )}
        {/* Outer ring: paid fixed (bright) */}
        {outerPaidDash > 0 && (
          <AnimatedCircle
            cx={cx} cy={cy} r={outerR}
            stroke="#A78BFA"
            strokeWidth={outerStroke}
            dash={outerPaidDash}
            circ={outerCirc}
            glow="#A78BFA"
          />
        )}

        {/* Inner ring track */}
        <circle
          cx={cx} cy={cy} r={innerR}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={innerStroke}
        />
        {/* Inner ring: expense segments (CCW = mirrored) */}
        <g style={{ transform: 'scaleX(-1)', transformOrigin: `${cx}px ${cy}px` }}>
          <g style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}>
            {innerSegs.map((seg, i) => (
              <circle
                key={i}
                cx={cx} cy={cy} r={innerR}
                fill="none"
                stroke={seg.color}
                strokeWidth={innerStroke}
                strokeLinecap="butt"
                strokeDasharray={seg.dash}
                strokeDashoffset={seg.offset}
                style={{ filter: `drop-shadow(0 0 5px ${seg.color}66)` }}
              />
            ))}
          </g>
        </g>

        {/* Center text */}
        <text
          x={cx} y={cy - 8}
          textAnchor="middle"
          fill={centerColor}
          fontSize="11"
          fontFamily="var(--font-body)"
          style={{ letterSpacing: '0.03em' }}
        >
          {remaining !== null ? 'zbývá' : 'příjem'}
        </text>
        <text
          x={cx} y={cy + 14}
          textAnchor="middle"
          fill={centerColor}
          fontSize="18"
          fontWeight="700"
          fontFamily="var(--font-mono)"
          style={{ letterSpacing: '-0.02em' }}
        >
          {centerLabel}
        </text>
        {over80 && (
          <text
            x={cx} y={cy + 32}
            textAnchor="middle"
            fill="var(--rose)"
            fontSize="10"
            fontFamily="var(--font-body)"
          >
            ⚠ nad 80 %
          </text>
        )}
      </svg>

      {/* Category legend */}
      {byCategory.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 8 }}>
          {byCategory.map(cat => (
            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                {cat.emoji} {cat.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnimatedCircle({ cx, cy, r, stroke, strokeWidth, dash, circ, glow }: {
  cx: number; cy: number; r: number
  stroke: string; strokeWidth: number
  dash: number; circ: number; glow: string
}) {
  const ref = useRef<SVGCircleElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.strokeDashoffset = String(circ)
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
      el.style.strokeDashoffset = String(circ - dash)
    })
    return () => cancelAnimationFrame(raf)
  }, [circ, dash])

  return (
    <circle
      ref={ref}
      cx={cx} cy={cy} r={r}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={circ}
      strokeDashoffset={circ}
      style={{
        transform: 'rotate(-90deg)',
        transformOrigin: `${cx}px ${cy}px`,
        filter: `drop-shadow(0 0 8px ${glow}66)`,
      }}
    />
  )
}

// ─── Stats Card ────────────────────────────────────────────────────────────

function StatsCard({ income, onIncomeChange, totalFixed, paidFixed, totalVariable, remaining, spentPct, over80 }: {
  income: number | null
  onIncomeChange: (v: number | null) => void
  totalFixed: number
  paidFixed: number
  totalVariable: number
  remaining: number | null
  spentPct: number
  over80: boolean
}) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Income row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Příjem domácnosti</span>
        <InlineAmount value={income} onChange={onIncomeChange} color="var(--emerald)" />
      </div>

      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Fixed payments */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA' }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            Fixní platby
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#A78BFA' }}>
            {formatCurrency(paidFixed)}
          </span>
          {totalFixed > paidFixed && (
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>
              / {formatCurrency(totalFixed)}
            </span>
          )}
        </div>
      </div>

      {/* Variable expenses */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F472B6' }} />
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            Výdaje
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#F472B6' }}>
          {formatCurrency(totalVariable)}
        </span>
      </div>

      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Remaining + percentage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: over80 ? 'var(--rose)' : 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontWeight: over80 ? 600 : 400 }}>
          {over80 ? '⚠ Zbývá' : 'Zbývá'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {income !== null && (
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: over80 ? 'var(--rose)' : 'var(--text-tertiary)' }}>
              {Math.round(spentPct)} % utraceno
            </span>
          )}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: over80 ? 'var(--rose)' : 'var(--emerald)' }}>
            {remaining !== null ? formatCurrency(remaining) : '—'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      {income !== null && (
        <div style={{ height: 4, background: 'var(--bg-2)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(spentPct, 100)}%`,
            background: over80 ? 'var(--rose)' : 'linear-gradient(90deg, #A78BFA, #F472B6)',
            borderRadius: 99,
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>
      )}
    </div>
  )
}

function InlineAmount({ value, onChange, color }: {
  value: number | null
  onChange: (v: number | null) => void
  color: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      setDraft(value !== null ? String(value) : '')
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [editing, value])

  function commit() {
    const num = parseFloat(draft.replace(/\s/g, '').replace(',', '.'))
    onChange(isNaN(num) ? null : Math.max(0, num))
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
        style={{
          background: 'transparent', border: 'none',
          borderBottom: `1px solid ${color}`,
          padding: '0 2px', fontFamily: 'var(--font-mono)',
          fontSize: 13, color: 'var(--text-primary)', width: 100, outline: 'none',
        }}
        placeholder="0"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Klikni pro úpravu"
      style={{
        background: 'transparent', border: 'none', padding: '0 2px',
        cursor: 'text', fontFamily: 'var(--font-mono)', fontSize: 13,
        color: value !== null ? color : 'var(--text-tertiary)',
        borderBottom: '1px solid transparent', transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderBottomColor = 'var(--border-active)')}
      onMouseLeave={e => (e.currentTarget.style.borderBottomColor = 'transparent')}
    >
      {value !== null ? formatCurrency(value) : 'Nastavit Kč/měs'}
    </button>
  )
}

// ─── Expense List ──────────────────────────────────────────────────────────

function ExpenseList({ expenses, onEdit }: { expenses: Expense[]; onEdit: (e: Expense) => void }) {
  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const byDate: Record<string, Expense[]> = {}
  for (const e of sorted) {
    if (!byDate[e.date]) byDate[e.date] = []
    byDate[e.date].push(e)
  }

  const dates = Object.keys(byDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Dnes'
    if (d.toDateString() === yesterday.toDateString()) return 'Včera'
    return `${d.getDate()}. ${MONTH_NAMES[d.getMonth()]}`
  }

  if (expenses.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '60px 20px', color: 'var(--text-tertiary)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)' }}>
          Žádné výdaje v tomto měsíci
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, marginTop: 4 }}>
          Klikni + Přidat výdaj a začni sledovat útrata
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {dates.map(date => {
        const dayTotal = byDate[date].reduce((s, e) => s + e.amount, 0)
        return (
          <div key={date}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {formatDateLabel(date)}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
                {formatCurrency(dayTotal)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {byDate[date].map(e => <ExpenseRow key={e.id} expense={e} onEdit={() => onEdit(e)} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ExpenseRow({ expense, onEdit }: { expense: Expense; onEdit: () => void }) {
  const cat = EXPENSE_CATEGORIES.find(c => c.name === expense.category) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]

  return (
    <div
      onClick={onEdit}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '12px 14px',
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-active)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: `${cat.color}15`, border: `1px solid ${cat.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
      }}>
        {cat.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {expense.name}
        </p>
        {expense.note && (
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{expense.note}</p>
        )}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: cat.color, fontWeight: 600 }}>
          −{formatCurrency(expense.amount)}
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{cat.name}</p>
      </div>
    </div>
  )
}

// ─── Month Picker ──────────────────────────────────────────────────────────

function MonthPicker({ year, month, onPrev, onNext, isCurrentMonth }: {
  year: number; month: number; onPrev: () => void; onNext: () => void; isCurrentMonth: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <NavBtn onClick={onPrev} dir="left" />
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, minWidth: 160, textAlign: 'center', letterSpacing: '-0.01em' }}>
        {MONTH_NAMES[month - 1]} {year}
      </div>
      <NavBtn onClick={onNext} dir="right" disabled={isCurrentMonth} />
    </div>
  )
}

function NavBtn({ onClick, dir, disabled }: { onClick: () => void; dir: 'left' | 'right'; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1, transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = 'var(--border-active)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {dir === 'left' ? <path d="M10 3L5 8l5 5" /> : <path d="M6 3l5 5-5 5" />}
      </svg>
    </button>
  )
}
