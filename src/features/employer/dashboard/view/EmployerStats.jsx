import { useState, useEffect, useRef } from 'react'
import { Box, Paper, Typography, Stack, Grid, CircularProgress, alpha } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { PeopleOutlined, TrendingUpOutlined, WorkOutlineOutlined, StarOutlineOutlined } from '@mui/icons-material'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { getCompanyStats } from '@/services/employerService'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
)

const COLORS = {
  primary: '#3D1C6E',
  primaryLight: '#5C3594',
  secondary: '#1F3670',
  secondaryLight: '#3B5591',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  purple: '#7D5DAB',
  navy: '#576FA2',
}

const PALETTE = [COLORS.primary, COLORS.warning, COLORS.success, COLORS.navy, COLORS.purple, COLORS.error]

function ChartCard({ title, icon, children, span }) {
  return (
    <Grid size={{ xs: 12, md: span || 6 }}>
      <Paper sx={{
        p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider',
        height: '100%',
      }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.5 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: 1, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          }}>
            {icon}
          </Box>
          <Typography variant="caption" fontWeight={700}
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.675rem', color: 'text.secondary' }}>
            {title}
          </Typography>
        </Stack>
        {children}
      </Paper>
    </Grid>
  )
}

function StatMini({ label, value, color }) {
  return (
    <Paper sx={{
      flex: 1, py: 1.25, px: 1, borderRadius: 1, textAlign: 'center',
      border: '1px solid', borderColor: 'divider',
      borderTop: `3px solid ${color}`,
    }}>
      <Typography variant="h6" fontWeight={800} fontSize="1rem" sx={{ color, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary"
        sx={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mt: 0.25, display: 'block' }}>
        {label}
      </Typography>
    </Paper>
  )
}

function chartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(26,10,48,0.9)',
        titleFont: { size: 11, weight: '600' },
        bodyFont: { size: 11 },
        padding: 8,
        cornerRadius: 4,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxRotation: 45 },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { size: 10 }, beginAtZero: true },
      },
    },
  }
}

function doughnutOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 10 } },
      },
      tooltip: {
        backgroundColor: 'rgba(26,10,48,0.9)',
        titleFont: { size: 11, weight: '600' },
        bodyFont: { size: 11 },
        padding: 8,
        cornerRadius: 4,
      },
    },
  }
}

export default function EmployerStats({ companyId }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const [state, setState] = useState({ stats: null, fetched: false })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!companyId) return
    getCompanyStats(companyId)
      .then((res) => {
        if (mountedRef.current && res?.success) setState({ stats: res.data, fetched: true })
      })
      .catch(() => { if (mountedRef.current) setState((s) => ({ ...s, fetched: true })) })
    return () => {}
  }, [companyId])

  const { stats, fetched } = state

  if (!fetched) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (!stats) return null

  const opts = chartOptions()

  const followersData = {
    labels: (stats.monthlyFollowers || []).map((m) => m.month),
    datasets: [
      {
        label: lang === 'ar' ? 'إجمالي المتابعين' : 'Total Followers',
        data: (stats.monthlyFollowers || []).map((m) => m.totalFollowers),
        borderColor: COLORS.primary,
        backgroundColor: alpha(COLORS.primary, 0.08),
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: COLORS.primary,
      },
      {
        label: lang === 'ar' ? 'متابعين جدد' : 'New Followers',
        data: (stats.monthlyFollowers || []).map((m) => m.newFollowers),
        borderColor: COLORS.success,
        backgroundColor: alpha(COLORS.success, 0.08),
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: COLORS.success,
      },
    ],
  }

  const followersLineOpts = {
    ...opts,
    plugins: {
      ...opts.plugins,
      legend: { display: true, position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 10 } } },
    },
  }

  const jobsByTypeData = {
    labels: (stats.jobs?.byType || []).map((j) => j._id),
    datasets: [{
      data: (stats.jobs?.byType || []).map((j) => j.count),
      backgroundColor: PALETTE,
      borderWidth: 0,
    }],
  }

  const jobsByLevelData = {
    labels: (stats.jobs?.byWorkLevel || []).map((j) => j._id),
    datasets: [{
      label: lang === 'ar' ? 'الوظائف' : 'Jobs',
      data: (stats.jobs?.byWorkLevel || []).map((j) => j.count),
      backgroundColor: [COLORS.primary, COLORS.warning, COLORS.success],
      borderRadius: 4,
      barPercentage: 0.6,
    }],
  }

  const jobsByWorkPlaceData = {
    labels: (stats.jobs?.byWorkPlace || []).map((j) => j._id),
    datasets: [{
      data: (stats.jobs?.byWorkPlace || []).map((j) => j.count),
      backgroundColor: [COLORS.secondary, COLORS.purple, COLORS.navy],
      borderWidth: 0,
    }],
  }

  const dailyData = (stats.dailyFollowers || []).slice(-14)
  const dailyFollowersData = {
    labels: dailyData.map((d) => d.date?.slice(5) || d.dayName),
    datasets: [{
      label: lang === 'ar' ? 'متابعين جدد' : 'New Followers',
      data: dailyData.map((d) => d.newFollowers),
      backgroundColor: alpha(COLORS.primary, 0.6),
      hoverBackgroundColor: COLORS.primary,
      borderRadius: 3,
      barPercentage: 0.7,
    }],
  }

  const monthlyJobsData = {
    labels: (stats.monthlyJobs || []).map((m) => m.month),
    datasets: [{
      label: lang === 'ar' ? 'وظائف منشورة' : 'Jobs Posted',
      data: (stats.monthlyJobs || []).map((m) => m.jobsPosted),
      backgroundColor: alpha(COLORS.secondary, 0.7),
      hoverBackgroundColor: COLORS.secondary,
      borderRadius: 3,
      barPercentage: 0.6,
    }],
  }

  const ratingsDist = stats.ratings?.distribution || {}
  const ratingsLabels = ['5', '4', '3', '2', '1']
  const ratingsValues = ratingsLabels.map((k) => ratingsDist[k] || 0)
  const ratingsData = {
    labels: ratingsLabels.map((v) => `${v} ★`),
    datasets: [{
      label: lang === 'ar' ? 'التقييمات' : 'Ratings',
      data: ratingsValues,
      backgroundColor: [COLORS.success, '#4ADE80', COLORS.warning, '#FBBF24', COLORS.error],
      borderRadius: 4,
      barPercentage: 0.5,
    }],
  }

  return (
    <Stack spacing={1.5}>
      {/* Summary Stats */}
      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
        <StatMini label={lang === 'ar' ? 'إجمالي المتابعين' : 'Total Followers'} value={stats.followers?.total ?? 0} color={COLORS.primary} />
        <StatMini label={lang === 'ar' ? 'الوظائف المفتوحة' : 'Open Jobs'} value={stats.jobs?.open ?? 0} color={COLORS.success} />
        <StatMini label={lang === 'ar' ? 'إجمالي المتقدمين' : 'Total Applicants'} value={stats.applicants?.total ?? 0} color={COLORS.warning} />
        <StatMini label={lang === 'ar' ? 'متوسط التقييم' : 'Avg Rating'} value={stats.ratings?.averageRating ?? '—'} color={COLORS.purple} />
      </Stack>

      <Grid container spacing={1.5}>
        {/* Followers Growth Line Chart */}
        <ChartCard
          title={lang === 'ar' ? 'نمو المتابعين' : 'Followers Growth'}
          icon={<PeopleOutlined sx={{ fontSize: 14, color: 'primary.main' }} />}
          span={8}
        >
          <Box sx={{ height: 240 }}>
            <Line data={followersData} options={followersLineOpts} />
          </Box>
        </ChartCard>

        {/* Ratings Distribution */}
        <ChartCard
          title={lang === 'ar' ? 'توزيع التقييمات' : 'Ratings Distribution'}
          icon={<StarOutlineOutlined sx={{ fontSize: 14, color: 'primary.main' }} />}
          span={4}
        >
          <Box sx={{ height: 240 }}>
            <Bar data={ratingsData} options={{ ...opts, indexAxis: 'y' }} />
          </Box>
        </ChartCard>

        {/* Jobs by Type - Doughnut */}
        <ChartCard
          title={lang === 'ar' ? 'الوظائف حسب النوع' : 'Jobs by Type'}
          icon={<WorkOutlineOutlined sx={{ fontSize: 14, color: 'primary.main' }} />}
        >
          <Box sx={{ height: 220, display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={jobsByTypeData} options={doughnutOptions()} />
          </Box>
        </ChartCard>

        {/* Jobs by Workplace - Doughnut */}
        <ChartCard
          title={lang === 'ar' ? 'الوظائف حسب مكان العمل' : 'Jobs by Workplace'}
          icon={<WorkOutlineOutlined sx={{ fontSize: 14, color: 'primary.main' }} />}
        >
          <Box sx={{ height: 220, display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={jobsByWorkPlaceData} options={doughnutOptions()} />
          </Box>
        </ChartCard>

        {/* Jobs by Level - Bar */}
        <ChartCard
          title={lang === 'ar' ? 'الوظائف حسب المستوى' : 'Jobs by Level'}
          icon={<TrendingUpOutlined sx={{ fontSize: 14, color: 'primary.main' }} />}
        >
          <Box sx={{ height: 220 }}>
            <Bar data={jobsByLevelData} options={opts} />
          </Box>
        </ChartCard>

        {/* Daily Followers - Bar */}
        <ChartCard
          title={lang === 'ar' ? 'المتابعين اليوميين (آخر 14 يوم)' : 'Daily Followers (Last 14 days)'}
          icon={<PeopleOutlined sx={{ fontSize: 14, color: 'primary.main' }} />}
        >
          <Box sx={{ height: 220 }}>
            <Bar data={dailyFollowersData} options={opts} />
          </Box>
        </ChartCard>

        {/* Monthly Jobs Posted */}
        <ChartCard
          title={lang === 'ar' ? 'الوظائف الشهرية' : 'Monthly Jobs Posted'}
          icon={<WorkOutlineOutlined sx={{ fontSize: 14, color: 'primary.main' }} />}
        >
          <Box sx={{ height: 220 }}>
            <Bar data={monthlyJobsData} options={opts} />
          </Box>
        </ChartCard>

        {/* Performance Metrics */}
        <ChartCard
          title={lang === 'ar' ? 'مؤشرات الأداء' : 'Performance'}
          icon={<TrendingUpOutlined sx={{ fontSize: 14, color: 'primary.main' }} />}
        >
          <Stack spacing={1.25}>
            {[
              { label: lang === 'ar' ? 'عمر الشركة (أيام)' : 'Company Age (days)', value: stats.performance?.companyAgeDays ?? '—' },
              { label: lang === 'ar' ? 'وظائف / شهر' : 'Jobs / Month', value: stats.performance?.jobsPerMonth ?? '—' },
              { label: lang === 'ar' ? 'متقدمين / وظيفة' : 'Applicants / Job', value: stats.performance?.applicantsPerJob ?? '—' },
              { label: lang === 'ar' ? 'متابعين / يوم' : 'Followers / Day', value: stats.performance?.followersPerDay ?? '—' },
              { label: lang === 'ar' ? 'نمو المتابعين' : 'Follower Growth', value: `${stats.followers?.monthlyGrowthRate ?? 0}%` },
            ].map((item, i) => (
              <Stack key={i} direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontSize="0.8rem" color="text.secondary">{item.label}</Typography>
                <Typography variant="body2" fontWeight={700} fontSize="0.85rem">{item.value}</Typography>
              </Stack>
            ))}
          </Stack>
        </ChartCard>
      </Grid>
    </Stack>
  )
}
