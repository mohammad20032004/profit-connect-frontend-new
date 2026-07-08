import { motion } from 'framer-motion'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'

export default function AnimatedBox({ children, sx, delay = 0, ...props }) {
  const enabled = useSelector((s) => s.user.user?.settings?.animationEnabled !== false)

  if (!enabled) {
    return <Box sx={sx} {...props}>{children}</Box>
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut', delay }}
      sx={sx}
      {...props}
    >
      {children}
    </Box>
  )
}
