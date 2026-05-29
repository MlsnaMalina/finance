export interface DebtPayment {
  id: string
  amount: number
  date: string
  note?: string
}

export interface Debt {
  id: string
  name: string
  totalAmount: number
  paidAmount: number
  color: string
  payments: DebtPayment[]
  archived: boolean
  createdAt: string
  description?: string
}

export type PaymentFrequency = 'monthly' | 'yearly'

export interface RecurringPayment {
  id: string
  name: string
  amount: number
  color: string
  frequency: PaymentFrequency
  dayOfMonth: number
  monthOfYear?: number
  category: string
  active: boolean
  icon?: string
}

export interface SavingsDeposit {
  id: string
  amount: number
  date: string
  note?: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  color: string
  emoji: string
  deposits: SavingsDeposit[]
  archived: boolean
  createdAt: string
  description?: string
  deadline?: string
}

export type TabId = 'debts' | 'payments' | 'savings'
