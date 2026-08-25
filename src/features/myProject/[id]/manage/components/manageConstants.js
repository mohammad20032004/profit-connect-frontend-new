export const COLORS = {
  primary: '#3D1C6E',
  secondary: '#1F3670',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  navy: '#576FA2',
  purple: '#7D5DAB',
}

export const PALETTE = [COLORS.primary, COLORS.warning, COLORS.success, COLORS.navy, COLORS.purple, COLORS.error]

export function formatDate(value, locale) {
  if (!value) return '—'
  const d = new Date(value)
  if (isNaN(d)) return value
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '—'
  return `${currency} ${Number(amount).toLocaleString()}`
}
