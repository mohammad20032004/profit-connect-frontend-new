import { Box } from '@mui/material'
import { Skeleton } from '@mui/material'

export function HeroSkeleton() {
  return (
    <Box sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Skeleton variant="rounded" height={340} sx={{ borderRadius: 3 }} />
    </Box>
  )
}

export function CardSkeleton({ hasCover = true }) {
  return (
    <Box sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {hasCover && <Skeleton variant="rounded" height={130} />}
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start' }}>
          <Skeleton variant="circular" width={60} height={60} sx={hasCover ? { mt: -5 } : {}} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" height={24} />
            <Skeleton variant="text" width="80%" height={18} sx={{ mt: 0.5 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, mt: 2 }}>
          <Skeleton variant="rounded" width={85} height={24} sx={{ borderRadius: 5 }} />
          <Skeleton variant="rounded" width={70} height={24} sx={{ borderRadius: 5 }} />
        </Box>
        <Skeleton variant="text" width="100%" sx={{ mt: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 1 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="20%" height={20} />
        </Box>
      </Box>
    </Box>
  )
}

export function StatsSkeleton() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
      {[0, 1, 2, 3].map((i) => (
        <Box key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, alignItems: 'center' }}>
            <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: 1.5 }} />
            <Box>
              <Skeleton variant="text" width={48} height={28} />
              <Skeleton variant="text" width={72} height={16} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
