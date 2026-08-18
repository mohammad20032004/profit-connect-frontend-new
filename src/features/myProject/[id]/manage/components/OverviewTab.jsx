import { useState, useEffect } from 'react'
import { Box, Paper, Typography, Stack, Grid, LinearProgress, Avatar, alpha } from '@mui/material'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  SpeedOutlined, CalendarMonthOutlined, FlagOutlined, GroupOutlined, PaymentsOutlined,
  AttachMoneyOutlined, CheckCircleOutlineOutlined, HourglassTopOutlined, TaskAltOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { AnimatedNumber, StatCard, SectionHeader } from './ManageShared'
import { COLORS, formatDate, formatCurrency } from './manageConstants'
import { scaleIn, staggerContainer } from '@/utils/animations'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

function ProgressRing({ value, size = 150, stroke = 12 }) {
  const { t } = useTranslation()
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const color = pct === 100 ? COLORS.success : pct >= 50 ? COLORS.primary : COLORS.warning

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <motion.svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={alpha(color, 0.12)} strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </motion.svg>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>
          <AnimatedNumber value={pct} suffix="%" />
        </Typography>
        <Typography variant="caption" color="text.secondary">{t('manage.progress', 'Progress')}</Typography>
      </Box>
    </Box>
  )
}

function TimelineProgress({ overview }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const [pct, setPct] = useState(null)

  useEffect(() => {
    if (!overview.startDate || !overview.endDate) return
    const start = new Date(overview.startDate).getTime()
    const end = new Date(overview.endDate).getTime()
    if (isNaN(start) || isNaN(end) || end <= start) return
    const frame = requestAnimationFrame(() => {
      const value = Math.min(Math.max(((Date.now() - start) / (end - start)) * 100, 0), 100)
      setPct(Math.round(value))
    })
    return () => cancelAnimationFrame(frame)
  }, [overview.startDate, overview.endDate])

  if (pct == null) {
    return <Typography variant="body2" color="text.secondary">{t('manage.noDates', 'Set start and end dates to track timeline')}</Typography>
  }

  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" fontWeight={600}>{formatDate(overview.startDate, lang)}</Typography>
        <Typography variant="body2" fontWeight={700} color="primary.main">
          <AnimatedNumber value={pct} suffix="%" />
        </Typography>
        <Typography variant="body2" fontWeight={600}>{formatDate(overview.endDate, lang)}</Typography>
      </Stack>
      <Box sx={{ position: 'relative', mt: 1 }}>
        <LinearProgress variant="determinate" value={pct} sx={{ height: 10 }} />
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            position: 'absolute', top: -4, left: `calc(${pct}% - 8px)`,
            width: 18, height: 18, borderRadius: '50%', backgroundColor: COLORS.primary,
            border: '3px solid #fff', boxShadow: '0 2px 8px rgba(31,10,59,0.3)',
          }}
        />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {t('manage.durationDays', 'Duration')}: <strong>{overview.durationDays ?? 0}</strong> {lang === 'ar' ? 'ظٹظˆظ…' : 'days'} â€¢ {t('manage.status', 'Status')}: <strong>{overview.status}</strong>
      </Typography>
    </>
  )
}

export default function OverviewTab({ overview }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'

  const summary = overview.paymentsSummary || { total: 0, paid: 0, pending: 0 }
  const milestones = overview.milestones || []
  const team = overview.team || []

  const completedMs = milestones.filter((m) => m.status === 'Completed').length
  const inProgressMs = milestones.filter((m) => m.status === 'InProgress').length
  const notStartedMs = milestones.filter((m) => m.status === 'NotStarted').length

  const paymentsData = {
    labels: [t('manage.paid', 'Paid'), t('manage.pendingPay', 'Pending')],
    datasets: [{
      data: [summary.paid || 0, summary.pending || 0],
      backgroundColor: [COLORS.success, COLORS.warning],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  }

  const paymentsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    animation: { animateRotate: true, animateScale: true, duration: 1400, easing: 'easeOutQuart' },
    plugins: {
      legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 10 } } },
      tooltip: {
        backgroundColor: 'rgba(26,10,48,0.92)', titleFont: { size: 11, weight: '600' }, bodyFont: { size: 11 },
        padding: 10, cornerRadius: 6, displayColors: true, boxPadding: 4,
      },
    },
  }

  const milestoneBarData = {
    labels: [t('manage.msCompleted', 'Completed'), t('manage.msInProgress', 'In Progress'), t('manage.msNotStarted', 'Not Started')],
    datasets: [{
      label: '',
      data: [completedMs, inProgressMs, notStartedMs],
      backgroundColor: [COLORS.success, COLORS.primary, '#C4BBD9'],
      borderRadius: 1,
      barPercentage: 0.55,
    }],
  }

  const milestoneBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, beginAtZero: true, precision: 0 } },
    },
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
      <Stack spacing={2.5}>
        {/* Stat cards */}
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
          <StatCard icon={<SpeedOutlined sx={{ fontSize: 20 }} />} label={t('manage.progress', 'Progress')} value={overview.progress ?? 0} suffix="%" color={overview.progress >= 50 ? COLORS.primary : COLORS.warning} index={0} />
          <StatCard icon={<CalendarMonthOutlined sx={{ fontSize: 20 }} />} label={t('manage.durationDays', 'Duration')} value={overview.durationDays ?? 0} suffix={lang === 'ar' ? ' ظٹظˆظ…' : 'd'} color={COLORS.navy} index={1} />
          <StatCard icon={<FlagOutlined sx={{ fontSize: 20 }} />} label={t('manage.milestonesCount', 'Milestones')} value={overview.milestonesCount ?? 0} color={COLORS.purple} index={2} />
          <StatCard icon={<GroupOutlined sx={{ fontSize: 20 }} />} label={t('manage.teamCount', 'Team')} value={overview.teamCount ?? 0} color={COLORS.secondary} index={3} />
        </Stack>

        <Grid container spacing={2.5}>
          {/* Progress ring + payments */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div variants={scaleIn} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ height: '100%' }}>
              <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%' }}>
                <SectionHeader icon={<SpeedOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.overview', 'Overview')} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: 'center', justifyContent: 'space-around' }}>
                  <ProgressRing value={overview.progress ?? 0} />
                  <Stack spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('manage.totalBudget', 'Total Budget')}</Typography>
                      <Typography variant="h6" fontWeight={800}>{overview.budget ? formatCurrency(overview.budget.min, overview.budget.currency) : 'â€”'}</Typography>
                    </Box>
                    {overview.startDate && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">{t('manage.dateRange', 'Project Period')}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatDate(overview.startDate, lang)} â€” {formatDate(overview.endDate || overview.deadline, lang)}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('manage.deadline', 'Deadline')}</Typography>
                      <Typography variant="body2" fontWeight={600}>{formatDate(overview.deadline, lang)}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>

          {/* Payments doughnut */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div variants={scaleIn} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ height: '100%' }}>
              <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%' }}>
                <SectionHeader icon={<PaymentsOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.paymentsSummary', 'Payments Summary')} />
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ width: 180, height: 180 }}>
                    <Doughnut data={paymentsData} options={paymentsOptions} />
                  </Box>
                  <Stack spacing={1} sx={{ minWidth: 140 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <AttachMoneyOutlined sx={{ fontSize: 18, color: COLORS.navy }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{t('manage.totalAmount', 'Total')}</Typography>
                        <Typography variant="body1" fontWeight={700}>{formatCurrency(summary.total, overview.budget?.currency)}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <CheckCircleOutlineOutlined sx={{ fontSize: 18, color: COLORS.success }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{t('manage.paid', 'Paid')}</Typography>
                        <Typography variant="body1" fontWeight={700} color="success.main">{formatCurrency(summary.paid, overview.budget?.currency)}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <HourglassTopOutlined sx={{ fontSize: 18, color: COLORS.warning }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{t('manage.pendingPay', 'Pending')}</Typography>
                        <Typography variant="body1" fontWeight={700} color="warning.main">{formatCurrency(summary.pending, overview.budget?.currency)}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>

          {/* Time elapsed progress */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div variants={scaleIn} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ height: '100%' }}>
              <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%' }}>
                <SectionHeader icon={<CalendarMonthOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.timelineElapsed', 'Timeline Progress')} />
                <TimelineProgress overview={overview} />
              </Paper>
            </motion.div>
          </Grid>

          {/* Milestones breakdown */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div variants={scaleIn} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ height: '100%' }}>
              <Paper sx={{ p: 2.5, borderRadius: 1.5, height: '100%' }}>
                <SectionHeader icon={<TaskAltOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.milestonesBreakdown', 'Milestones')} />
                <Box sx={{ height: 190 }}>
                  {milestones.length === 0 ? (
                    <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography variant="body2" color="text.secondary">{t('manage.noMilestones', 'No milestones yet')}</Typography>
                    </Stack>
                  ) : (
                    <Bar data={milestoneBarData} options={milestoneBarOptions} />
                  )}
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Team preview */}
        {team.length > 0 && (
          <motion.div variants={scaleIn} custom={4} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Paper sx={{ p: 2.5, borderRadius: 1.5 }}>
              <SectionHeader icon={<GroupOutlined sx={{ fontSize: 14, color: 'primary.main' }} />} title={t('manage.team', 'Team')} />
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
                {team.map((m, i) => {
                  const user = m.freelancer || {}
                  const prof = user.profile || {}
                  const name = [prof.firstName, prof.lastName].filter(Boolean).join(' ') || user.email || 'â€”'
                  return (
                    <motion.div key={m._id} custom={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Avatar src={prof.avatar} sx={{ width: 38, height: 38 }}>{name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={700}>{name}</Typography>
                          <Typography variant="caption" color="text.secondary">{m.role || 'â€”'}</Typography>
                        </Box>
                      </Stack>
                    </motion.div>
                  )
                })}
              </Stack>
            </Paper>
          </motion.div>
        )}
      </Stack>
    </motion.div>
  )
}
