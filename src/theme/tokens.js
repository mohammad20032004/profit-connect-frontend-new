// Central design tokens for ProfitConnect.
// Use these instead of hardcoding colors/sizes in components so the brand
// can be re-themed from one place. The MUI theme (src/theme/index.js) mirrors
// `primary.main` -> BRAND and `error.main` -> DANGER.

export const BRAND = '#3D1C6E'
export const BRAND_DARK = '#2A1250'
export const DANGER = '#DC2626'
export const DANGER_DARK = '#F87171'
export const SUCCESS = '#16A34A'
export const WARNING = '#F59E0B'
export const INFO = '#2563EB'

// border radius (subtle, matches the original card/paper look)
export const RADIUS = 3

// spacing scale (multiples of the 8px base unit)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}

// viewport threshold below which fixed widths must be avoided (<360px phones)
export const MOBILE_MAX = 360
