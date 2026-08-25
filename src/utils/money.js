const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  SYP: 'ل.س',
  SAR: '﷼',
  AED: 'د.إ',
  EGP: 'ج.م',
}

export function formatMoney(value, currency = 'USD') {
  const n = Number(value)
  if (!n || Number.isNaN(n)) return currency ? `${currencySymbols[currency] || `${currency} `}0` : '0'
  const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  const symbol = currencySymbols[currency]
  if (symbol) return `${symbol}${compact}`
  return `${currency} ${compact}`
}
