import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Debt, RecurringPayment } from '../types'

interface UserData {
  debts: Debt[]
  payments: RecurringPayment[]
}

interface UseSupabaseDataReturn {
  debts: Debt[]
  setDebts: (updater: Debt[] | ((prev: Debt[]) => Debt[])) => void
  payments: RecurringPayment[]
  setPayments: (updater: RecurringPayment[] | ((prev: RecurringPayment[]) => RecurringPayment[])) => void
  loading: boolean
}

export function useSupabaseData(userId: string): UseSupabaseDataReturn {
  const [debts, setDebtsState] = useState<Debt[]>([])
  const [payments, setPaymentsState] = useState<RecurringPayment[]>([])
  const [loading, setLoading] = useState(true)

  // Refs so setter closures always see fresh values
  const debtsRef = useRef<Debt[]>([])
  const paymentsRef = useRef<RecurringPayment[]>([])
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  debtsRef.current = debts
  paymentsRef.current = payments

  useEffect(() => {
    let cancelled = false

    supabase
      .from('user_data')
      .select('debts, payments')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          if (data) {
            setDebtsState((data as UserData).debts ?? [])
            setPaymentsState((data as UserData).payments ?? [])
          }
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [userId])

  function persist(nextDebts: Debt[], nextPayments: RecurringPayment[]) {
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      supabase
        .from('user_data')
        .upsert({
          user_id: userId,
          debts: nextDebts,
          payments: nextPayments,
          updated_at: new Date().toISOString(),
        })
        .then(() => {})
    }, 400)
  }

  function setDebts(updater: Debt[] | ((prev: Debt[]) => Debt[])) {
    setDebtsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(next, paymentsRef.current)
      return next
    })
  }

  function setPayments(updater: RecurringPayment[] | ((prev: RecurringPayment[]) => RecurringPayment[])) {
    setPaymentsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persist(debtsRef.current, next)
      return next
    })
  }

  return { debts, setDebts, payments, setPayments, loading }
}
