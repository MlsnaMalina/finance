export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const DEBT_COLORS = [
  '#A78BFA', // violet
  '#F472B6', // rose
  '#38BDF8', // sky
  '#34D399', // emerald
  '#FBBF24', // amber
  '#FB923C', // orange
  '#818CF8', // indigo
  '#2DD4BF', // teal
]

export const PAYMENT_COLORS = [
  '#A78BFA',
  '#F472B6',
  '#38BDF8',
  '#34D399',
  '#FBBF24',
  '#FB923C',
  '#818CF8',
  '#2DD4BF',
  '#F87171',
  '#C084FC',
]

export const SAVINGS_COLORS = [
  '#34D399', // emerald
  '#38BDF8', // sky
  '#A78BFA', // violet
  '#F472B6', // rose
  '#FBBF24', // amber
  '#2DD4BF', // teal
  '#818CF8', // indigo
  '#FB923C', // orange
]

export const SAVINGS_EMOJIS = [
  '✈️', '🏖️', '🏠', '🚗', '💻', '📱',
  '🎓', '💍', '🐕', '🎸', '🏋️', '🌿',
  '🛍️', '🛡️', '🎁', '💰',
]

export const CATEGORIES = [
  'Předplatné',
  'Pojištění',
  'Nájem',
  'Energie',
  'Doprava',
  'Zdraví',
  'Ostatní',
]

export const MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
]

export const DAY_NAMES = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
