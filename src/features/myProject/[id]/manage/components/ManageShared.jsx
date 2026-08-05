import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Stack, Chip, alpha, Paper } from '@mui/material'
import { motion, useInView } from 'framer-motion'
import { COLORS } from './manageConstants'

export function AnimatedNumber({ value, duration = 1200, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const rafRef = useRef(null)

  useEffect(() => {
    if (!inView) return
    const num = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(num)) return
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(num * eased)
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, inView, duration])

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()
  return <span ref={ref}>{formatted}{suffix}</span>
}

export function SectionHeader({ icon, title }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.25 }}>
      <Box sx={{
        width: 28, height: 28, borderRadius: 1, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
      }}>
        {icon}
      </Box>
      <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.675rem', color: 'text.secondary' }}>
        {title}
      </Typography>
    </Stack>
  )
}

export function StatCard({ icon, label, value, suffix, color = COLORS.primary, decimals = 0, index = 0 }) {
  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, boxShadow: '0 10px 24px rgba(31,10,59,0.1)' }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{ flex: 1, minWidth: 130 }}
    >
      <Paper sx={{
        p: 1.5, borderRadius: 1.5, textAlign: 'center', height: '100%',
        border: '1px solid', borderColor: 'divider',
        transition: 'border-color 0.2s ease',
        '&:hover': { borderColor: 'primary.main' },
      }}>
        <Box sx={{ mb: 0.5, color }}>{icon}</Box>
        <Typography variant="h6" fontWeight={800} fontSize="1.1rem" sx={{ color, lineHeight: 1.15 }}>
          <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          {label}
        </Typography>
      </Paper>
    </motion.div>
  )
}

export function StatusChip({ status, config }) {
  const cfg = config?.[status]
  return (
    <Chip
      label={cfg?.label ?? status}
      size="small"
      sx={{
        height: 20, fontSize: '0.68rem', fontWeight: 700,
        color: cfg?.color, bgcolor: alpha(cfg?.color || '#5C5580', 0.1),
      }}
    />
  )
}
