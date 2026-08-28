﻿import { BRAND, DANGER } from '@/theme/tokens'
export const COLORS = {
  primary: BRAND,
  navy: '#1F3670',
  success: '#16A34A',
  warning: '#D97706',
  error: DANGER,
  purple: '#7C3AED',
}

export function fullName(user) {
  if (!user) return ''
  if (typeof user === 'string') return user
  const prof = user.profile || {}
  return [prof.firstName, prof.lastName].filter(Boolean).join(' ') || user.username || user.name || prof.fullname || ''
}
