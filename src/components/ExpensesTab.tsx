import { useState } from 'react'
import type { Expense } from '../types'
import { formatCurrency, EXPENSE_CATEGORIES, MONTH_NAMES } from '../utils/formatters'
import { AddExpenseModal } from './AddExpenseModal'

interface ExpensesTabProps {
  expenses: Expense[]
  onExpensesChange: (e: Expense[]) => void
}

export function ExpensesTab({ expenses, onExpensesChange }: ExpensesTabProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [showAdd, setShowAdd] = useState(false)
  const [editExpense, setEditExpense] = useState<Expense | null>(null)

  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })

  const total = monthExpenses.reduce((s, e) => s + e.amount, 0)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const n = new Date()
    if (year > n.getFullYear() || (year === n.getFullYear() && month >= n.getMonth() + 1)) return
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

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <MonthPicker year={year} month={month} onPrev={prevMonth} onNext={nextMonth} isCurrentMonth={isCurrentMonth} />
        <div style={{ flex: 1 }} />
        {total > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '6px 14px',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Celkem</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--rose)', fontWeight: 600 }}>{formatCurrency(total)}</span>
          </div>
        )}
        <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Přidat výdaj
        </button>
      </div>

      {monthExpenses.length === 0 ? (
        <EmptyState onAdd={() => setShowAdd(true)} month={MONTH_NAMES[month - 1]} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Left: category breakdown */}
          <CategoryBreakdown expenses={monthExpenses} total={total} />

          {/* Right: expense list */}
          <ExpenseList expenses={monthExpenses} onEdit={setEditExpense} />
        </div>
      )}

      {showAdd && <AddExpenseModal onClose={() => setShowAdd(false)} onSave={handleSave} />}
      {editExpense && (
        <AddExpenseModal
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

function MonthPicker({ year, month, onPrev, onNext, isCurrentMonth }: {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  isCurrentMonth: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <NavBtn onClick={onPrev} dir="left" />
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
        minWidth: 160, textAlign: 'center', letterSpacing: '-0.01em',
      }}>
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
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1,
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = 'var(--border-active)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {dir === 'left'
          ? <path d="M10 3L5 8l5 5" />
          : <path d="M6 3l5 5-5 5" />
        }
      </svg>
    </button>
  )
}

function CategoryBreakdown({ expenses, total }: { expenses: Expense[]; total: number }) {
  const byCategory = EXPENSE_CATEGORIES.map(cat => {
    const sum = expenses.filter(e => e.category === cat.name).reduce((s, e) => s + e.amount, 0)
    return { ...cat, sum }
  }).filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum)

  if (byCategory.length === 0) return null

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 20,
      position: 'sticky', top: 80,
    }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
        Podle kategorií
      </h3>

      {/* Donut */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <MultiDonut segments={byCategory.map(c => ({ color: c.color, value: c.sum }))} total={total} size={160} />
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {byCategory.map(cat => {
          const pct = Math.round((cat.sum / total) * 100)
          return (
            <div key={cat.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                <span style={{ flex: 1, fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: cat.color, fontWeight: 600 }}>{formatCurrency(cat.sum)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 3, background: 'var(--bg-2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MultiDonut({ segments, total, size }: { segments: { color: string; value: number }[]; total: number; size: number }) {
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2
  const gapAngle = 0.03

  let arcs: { color: string; dashOffset: number; dashArray: string; rotate: number }[] = []
  let currentAngle = -Math.PI / 2

  for (const seg of segments) {
    const fraction = seg.value / total
    const arcLength = fraction * circumference
    const gapLength = gapAngle * circumference
    const drawn = Math.max(0, arcLength - gapLength)
    const dash = `${drawn} ${circumference - drawn}`
    const rotateDeg = (currentAngle * 180) / Math.PI + 90
    arcs.push({ color: seg.color, dashOffset: 0, dashArray: dash, rotate: rotateDeg })
    currentAngle += fraction * 2 * Math.PI
  }

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={arc.dashArray}
          strokeDashoffset={arc.dashOffset}
          style={{
            transform: `rotate(${arc.rotate}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            filter: `drop-shadow(0 0 6px ${arc.color}55)`,
          }}
        />
      ))}
    </svg>
  )
}

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
        background: `${cat.color}15`,
        border: `1px solid ${cat.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>
        {cat.emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {expense.name}
        </p>
        {expense.note && (
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {expense.note}
          </p>
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

function EmptyState({ onAdd, month }: { onAdd: () => void; month: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(244,114,182,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', fontSize: 30,
      }}>
        🛒
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>
        Žádné výdaje za {month}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Sleduj, za co utrácíš, a zjisti, kde šetřit.
      </p>
      <button onClick={onAdd} className="btn-primary">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M8 3v10M3 8h10" />
        </svg>
        Přidat první výdaj
      </button>
    </div>
  )
}
