export function formatDeadline(deadline, lang = 'en') {
  if (!deadline) return null
  const n = Number(deadline)
  if (!Number.isNaN(n) && n > 0) {
    if (lang === 'ar') return n === 1 ? 'شهر' : `${n} أشهر`
    return n === 1 ? 'month' : `${n} months`
  }
  const d = new Date(deadline)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
}
