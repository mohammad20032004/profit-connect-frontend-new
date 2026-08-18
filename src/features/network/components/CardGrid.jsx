import { Children, cloneElement, isValidElement } from 'react'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'

const listGridSx = {
  display: 'grid',
  gap: 1.5,
  alignItems: 'stretch',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
}

const fadeUpKeyframes = {
  '@keyframes cardFadeUp': {
    from: { opacity: 0, transform: 'translateY(16px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}

export default function CardGrid({ children, sx, grid = true }) {
  const enabled = useSelector((s) => s.user.user?.settings?.animationEnabled !== false)

  const items = enabled
    ? Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child
        return cloneElement(child, {
          sx: {
            animation: 'cardFadeUp 0.45s ease backwards',
            animationDelay: `${i * 0.08}s`,
            ...(child.props.sx || {}),
          },
        })
      })
    : children

  return (
    <Box
      sx={{
        ...(grid ? listGridSx : { display: 'flex', flexDirection: 'column', gap: 1.5 }),
        ...sx,
        ...fadeUpKeyframes,
      }}
    >
      {items}
    </Box>
  )
}
