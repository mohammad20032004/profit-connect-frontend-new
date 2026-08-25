import { Star, StarOutlined } from '@mui/icons-material'

export const INDUSTRY_OPTIONS = [
  'web-development', 'mobile-development', 'ai-ml', 'ui-ux-design', 'cybersecurity',
  'cloud-devops', 'data-science', 'blockchain', 'game-dev', 'marketing', 'finance', 'other',
]

export const SORT_OPTIONS = ['sortRating', 'sortFollowers', 'sortNewest']

export const RATING_OPTIONS = [0, 3, 4]

export const INDUSTRY_COLORS = {
  'web-development': '#6366F1',
  'mobile-development': '#8B5CF6',
  'ai-ml': '#EC4899',
  'ui-ux-design': '#F59E0B',
  'cybersecurity': '#EF4444',
  'cloud-devops': '#10B981',
  'data-science': '#3B82F6',
  'blockchain': '#F97316',
  'game-dev': '#14B8A6',
  'marketing': '#A855F7',
  'finance': '#06B6D4',
  'other': '#6B7280',
}

export const formatLocation = (loc) => {
  if (!loc) return ''
  if (typeof loc === 'string') return loc
  return [loc.city, loc.country].filter(Boolean).join(', ') || ''
}

export const renderStars = (rating, size = 16) => {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  const stars = []
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<Star key={i} sx={{ fontSize: size, color: '#F59E0B' }} />)
    } else if (i === full && hasHalf) {
      stars.push(<Star key={i} sx={{ fontSize: size, color: '#FCD34D' }} />)
    } else {
      stars.push(<StarOutlined key={i} sx={{ fontSize: size, color: 'action.disabled' }} />)
    }
  }
  return stars
}
