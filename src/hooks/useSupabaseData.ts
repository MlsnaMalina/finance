import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Debt, RecurringPayment, SavingsGoal } from '../types'

interface UserData {
  debts: Debt[]
  payments: RecurringPayment[]
  goals: SavingsGoal[]
}

interface UseSupabaseDataReturn {
  debts: Debt[]
  setDebts: (updater: Debt[] | ((prev: Debt[]) => Debt[])) => void
  payments: RecurringPayment[]
  setPayments: (updater: RecurringPayment[] | ((prev: RecurringPayment[]) => RecurringPayment[])) => void
  goals: SavingsGoal[]
  setGoals: (updater: SavingsGoal[] | ((prev: SavingsGoal[]) => SavingsGoal[])) => void
  loading: boolean
}

export function useSupabaseData(userId: string): UseSupabaseDataReturn {
  const [debts, setDebtsState] = useState<Debt[]>([])
  const [payments, setPaymentsState] = useState<RecurringPayment[]>([])
  const [goals, setGoalsState] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)

  const debtsRef = useRef<Debt[]>([])
  const paymentsRef = useRef<RecurringPayment[]>([])
  const goalsRef = useRef<SavingsGoal[]>([])
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  debtsRef.current = debts
  paymentsRef.current = payments
  goalsRef.current = goals

  useEffect(() => {
    let cancelled = false

    supabase
      .from('user_data')
      .select('debts, payments, goals')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          if (data) {
            const d = data as UserData
            setDebtsState(d.debts ?? [])
            setPaymentsState(d.payments ?? [])
            setGoalsState(d.goals ?? [])
          }
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [userId])

  function persist(nextDebts: Debt[], nextPayments: RecurringPayment[], nextGoals: SavingsGoal[]) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          debts: nextDebts,
          payments: nextPayments,
          goals: nextGoals,
          updated_at: new Date().toISOString(),
        })
        .then(() => {})
    }, 400)
  }

  function setDebts(updater: Debt[] | ((prev: Debt[]) => Debt[])) {
    setDebtsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next, paymentsRef.current, goalsRef.current)
      return next
    })
  }

  function setPayments(updater: RecurringPayment[] | ((prev: RecurringPayment[]) => RecurringPayment[])) {
    setPaymentsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(debtsRef.current, next, goalsRef.current)
      return next
    })
  }

  function setGoals(updater: SavingsGoal[] | ((prev: SavingsGoal[]) => SavingsGoal[])) {
    setGoalsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(debtsRef.current, paymentsRef.current, next)
      return next
    })
  }

  return { debts, setDebts, payments, setPayments, goals, setGoals, loading }
}
