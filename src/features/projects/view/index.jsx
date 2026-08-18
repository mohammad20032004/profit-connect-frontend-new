import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Box, Container, Typography, Stack, Avatar, Chip, Paper, InputBase, Grid, Skeleton, alpha, Divider,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  CodeOutlined, DesignServicesOutlined, AttachMoneyOutlined,
  AccessTimeOutlined, SearchOutlined, PostAddOutlined,
  FolderOpenOutlined, TrendingUpOutlined, CheckCircleOutlineOutlined,
  AssignmentOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { getProjects, getMyProjectsWithProposals } from '@/services/projectService'
import { fadeUp, staggerContainer } from '@/utils/animations'

const CATEGORY_ICONS = {
  'تطوير ويب': CodeOutlined,
  'تطوير تطبيقات': CodeOutlined,
  'تصميم UI/UX': DesignServicesOutlined,
  'تصميم جرافيك': DesignServicesOutlined,
  'تطوير خلفي': CodeOutlined,
  'تطوير أمامي': CodeOutlined,
  'Web Development': CodeOutlined,
  'Mobile Development': CodeOutlined,
  'UI/UX Design': DesignServicesOutlined,
  'Graphic Design': DesignServicesOutlined,
  'Backend Development': CodeOutlined,
  'Frontend Development': CodeOutlined,
}

const STATUS_CONFIG = {
  Open: { color: '#16A34A', bg: '#DCFCE7', darkBg: '#052E16', label: 'Open' },
  InProgress: { color: '#2563EB', bg: '#DBEAFE', darkBg: '#0C1929', label: 'In Progress' },
  Completed: { color: '#6B7280', bg: '#F3F4F6', darkBg: '#374151', label: 'Completed' },
  Cancelled: { color: '#DC2626', bg: '#FEE2E2', darkBg: '#450A0A', label: 'Cancelled' },
}

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'UI/UX Design',
  'Graphic Design', 'Backend Development', 'Frontend Development', 'Other',
]

function timeAgo(dateStr, lang) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return lang === 'ar' ? 'الآن' : 'Just now'
  if (mins < 60) return lang === 'ar' ? `منذ ${mins} د` : `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return lang === 'ar' ? `منذ ${hrs} س` : `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return lang === 'ar' ? `منذ ${days} ي` : `${days}d ago`
  return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
}

function formatBudget(budget) {
  if (!budget?.min && !budget?.max) return null
  const fmt = (n) => n?.toLocaleString()
  const cur = budget.currency || 'SAR'
  if (budget.min && budget.max) return `${fmt(budget.min)} - ${fmt(budget.max)} ${cur}`
  if (budget.min) return `${fmt(budget.min)}+ ${cur}`
  return `Up to ${fmt(budget.max)} ${cur}`
}

function ProjectSkeleton() {
  return (
    <Paper sx={{ p: 2.5, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 1.5 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={22} />
            <Skeleton variant="text" width="30%" height={16} sx={{ mt: 0.25 }} />
          </Box>
          <Skeleton variant="rounded" width={64} height={22} sx={{ borderRadius: 99 }} />
        </Stack>
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="70%" height={16} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rounded" width={100} height={24} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 99 }} />
        </Stack>
      </Stack>
    </Paper>
  )
}

export default function ProjectsList() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const navigate = useNavigate()
  const theme = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [mine, setMine] = useState(false)

  const isLight = theme.palette.mode === 'light'
  const primaryMain = theme.palette.primary.main

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      let res
      if (mine) {
        res = await getMyProjectsWithProposals()
      } else {
        const params = {}
        if (category) params.category = category
        if (search) params.search = search
        res = await getProjects(params)
      }
      if (res?.success) setProjects(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }, [category, search, mine, t])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleCategoryChange = (val) => {
    const next = val === category ? '' : val
    setCategory(next)
    if (next) searchParams.set('category', next)
    else searchParams.delete('category')
    setSearchParams(searchParams)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (search) searchParams.set('search', search)
      else searchParams.delete('search')
      setSearchParams(searchParams)
      fetchProjects()
    }
  }

  const handleMineToggle = () => {
    setMine((v) => !v)
    setCategory('')
    searchParams.delete('category')
    setSearchParams(searchParams)
  }

  const clearAllFilters = () => {
    setCategory('')
    setSearch('')
    setMine(false)
    setSearchParams({})
  }

  const hasActiveFilters = category || mine

  const stats = {
    total: projects.length,
    open: projects.filter((p) => p.status === 'Open').length,
    inProgress: projects.filter((p) => p.status === 'InProgress').length,
    completed: projects.filter((p) => p.status === 'Completed').length,
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3, gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                {t('projects.title', 'Projects')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {mine
                  ? (lang === 'ar' ? 'مشاريعك المرسلوعة والمشاريع التي عملت عليها' : 'Your posted projects and projects you worked on')
                  : (lang === 'ar' ? 'تصفح المشاريع المتاحة وقدم عروضك' : 'Browse available projects and submit your proposals')
                }
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PostAddOutlined />}
              component={Link}
              to="/projects/create"
              sx={{ flexShrink: 0, px: 3 }}
            >
              {t('projects.postProject', 'Post a New Project')}
            </Button>
          </Stack>
        </motion.div>

        {/* Stats Row */}
        {!mine && !loading && projects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <Stack direction="row" spacing={1.5} sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }}>
              {[
                { label: lang === 'ar' ? 'إجمالي' : 'Total', value: stats.total, icon: FolderOpenOutlined, color: primaryMain },
                { label: lang === 'ar' ? 'متاح' : 'Open', value: stats.open, icon: TrendingUpOutlined, color: '#16A34A' },
                { label: lang === 'ar' ? 'قيد التنفيذ' : 'In Progress', value: stats.inProgress, icon: AccessTimeOutlined, color: '#2563EB' },
                { label: lang === 'ar' ? 'مكتمل' : 'Completed', value: stats.completed, icon: CheckCircleOutlineOutlined, color: '#6B7280' },
              ].map((s) => (
                <Paper
                  key={s.label}
                  sx={{
                    px: 2, py: 1.5, borderRadius: 2, minWidth: 120, flex: 1,
                    border: '1px solid', borderColor: 'divider',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}
                >
                  <Box sx={{
                    width: 36, height: 36, borderRadius: 1.5,
                    bgcolor: alpha(s.color, 0.08),
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <s.icon sx={{ fontSize: 18, color: s.color }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{s.value}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{s.label}</Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </motion.div>
        )}

        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center' }}>
              {/* Search */}
              <Paper
                sx={{
                  display: 'flex', alignItems: 'center', flex: 1, px: 1.5, py: 0.5,
                  border: '1px solid', borderColor: 'divider', borderRadius: 1.5,
                  bgcolor: isLight ? '#FFFFFF' : alpha('#FFFFFF', 0.03),
                  transition: 'all 0.2s ease',
                  '&:focus-within': { borderColor: primaryMain, boxShadow: `0 0 0 3px ${alpha(primaryMain, 0.08)}` },
                }}
              >
                <SearchOutlined sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                <InputBase
                  placeholder={t('projects.searchPlaceholder', 'Search projects...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  sx={{ flex: 1, py: 0.75, fontSize: '0.875rem' }}
                />
              </Paper>

              {/* Category Chips */}
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                {CATEGORIES.map((cat) => {
                  const IconComp = CATEGORY_ICONS[cat] || AssignmentOutlined
                  const isActive = category === cat
                  return (
                    <Chip
                      key={cat}
                      icon={<IconComp sx={{ fontSize: 14, color: isActive ? '#fff' : `${primaryMain} !important` }} />}
                      label={t(`projects.categoryOptions.${cat}`, cat)}
                      size="small"
                      onClick={() => handleCategoryChange(cat)}
                      sx={{
                        height: 30, fontSize: '0.72rem', fontWeight: isActive ? 700 : 500,
                        bgcolor: isActive ? primaryMain : alpha(primaryMain, 0.04),
                        color: isActive ? '#fff' : 'text.secondary',
                        border: isActive ? 'none' : `1px solid ${alpha(primaryMain, 0.12)}`,
                        borderRadius: 999,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: isActive ? theme.palette.primary.dark : alpha(primaryMain, 0.1),
                        },
                      }}
                    />
                  )
                })}
              </Stack>
            </Stack>
          </Paper>
        </motion.div>

        {/* My Projects Toggle & Active Filters */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant={mine ? 'contained' : 'outlined'}
              startIcon={<AssignmentOutlined />}
              onClick={handleMineToggle}
              sx={{ flexShrink: 0, px: 2.5, fontSize: '0.82rem' }}
            >
              {mine ? (lang === 'ar' ? 'مشاريعي' : 'My Projects') : (lang === 'ar' ? 'مشاريعي' : 'My Projects')}
            </Button>

            {hasActiveFilters && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {category && (
                    <Chip
                      label={t(`projects.categoryOptions.${category}`, category)}
                      size="small"
                      onDelete={() => handleCategoryChange(category)}
                      sx={{ bgcolor: alpha(primaryMain, 0.08), fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  )}
                  {mine && (
                    <Chip
                      label={lang === 'ar' ? 'مشاريعي' : 'My Projects'}
                      size="small"
                      onDelete={() => setMine(false)}
                      sx={{ bgcolor: alpha(primaryMain, 0.08), fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  )}
                  <Chip
                    label={lang === 'ar' ? 'مسح الكل' : 'Clear all'}
                    size="small"
                    onClick={clearAllFilters}
                    sx={{
                      fontWeight: 600, fontSize: '0.7rem', cursor: 'pointer',
                      bgcolor: alpha('#DC2626', 0.06), color: '#DC2626',
                      '&:hover': { bgcolor: alpha('#DC2626', 0.12) },
                    }}
                  />
                </Stack>
              </>
            )}

            <Box sx={{ flex: 1 }} />

            {!loading && projects.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {lang === 'ar' ? `${projects.length} مشروع` : `${projects.length} projects`}
              </Typography>
            )}
          </Stack>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, border: '1px solid', borderColor: alpha('#DC2626', 0.2) }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '50%', bgcolor: alpha('#DC2626', 0.08),
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
              }}>
                <AssignmentOutlined sx={{ fontSize: 28, color: '#DC2626' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                {lang === 'ar' ? 'حدث خطأ' : 'Something went wrong'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{error}</Typography>
              <Button variant="outlined" onClick={fetchProjects} sx={{ borderRadius: 999 }}>
                {t('projects.retry', 'Retry')}
              </Button>
            </Paper>
          </motion.div>
        )}

        {/* Loading State - Skeleton */}
        {loading && !error && (
          <Stack spacing={1.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </Stack>
        )}

        {/* Empty State */}
        {!loading && !error && projects.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: 3 }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '50%',
                bgcolor: alpha(primaryMain, 0.06),
                display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5,
              }}>
                <AssignmentOutlined sx={{ fontSize: 40, color: alpha(primaryMain, 0.35) }} />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75 }}>
                {mine
                  ? (lang === 'ar' ? 'لا توجد مشاريع بعد' : 'No projects yet')
                  : (lang === 'ar' ? 'لا توجد مشاريع متاحة' : 'No projects available')
                }
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                {mine
                  ? (lang === 'ar' ? 'لم تقم بنشر أي مشروع بعد. ابدأ بإنشاء مشروعك الأول!' : "You haven't posted any projects yet. Start by creating your first project!")
                  : (lang === 'ar' ? 'لم يتم العثور على مشاريع تطابق معايير البحث. جرّب تغيير الفلاتر.' : 'No projects match your current filters. Try adjusting your filters.')
                }
              </Typography>
              {mine ? (
                <Button variant="contained" startIcon={<PostAddOutlined />} component={Link} to="/projects/create" sx={{ borderRadius: 999 }}>
                  {t('projects.postProject', 'Post a New Project')}
                </Button>
              ) : (
                hasActiveFilters && (
                  <Button variant="outlined" onClick={clearAllFilters} sx={{ borderRadius: 999 }}>
                    {lang === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
                  </Button>
                )
              )}
            </Paper>
          </motion.div>
        )}

        {/* Projects Grid */}
        {!loading && !error && projects.length > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <Grid container spacing={2}>
              {projects.map((p) => {
                const IconComp = CATEGORY_ICONS[p.category] || AssignmentOutlined
                const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.Open
                const budget = formatBudget(p.budget)
                const clientName = p.client?.profile?.firstName
                  ? `${p.client.profile.firstName} ${p.client.profile.lastName || ''}`
                  : null

                return (
                  <Grid key={p._id} size={{ xs: 12, sm: 6 }}>
                    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                      <Paper
                        onClick={() => navigate(mine ? `/myProject/${p._id}` : `/projects/${p._id}`)}
                        sx={{
                          p: 2.5, borderRadius: 2, cursor: 'pointer', height: '100%',
                          border: '1px solid', borderColor: 'divider',
                          transition: 'all 0.2s ease',
                          display: 'flex', flexDirection: 'column',
                          '&:hover': {
                            borderColor: primaryMain,
                            boxShadow: `0 8px 24px rgba(${isLight ? '31,10,59' : '0,0,0'}, 0.08)`,
                          },
                        }}
                      >
                        {/* Top Row: Icon + Title + Status */}
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 44, height: 44, flexShrink: 0,
                              bgcolor: alpha(primaryMain, 0.08), color: 'primary.main',
                              border: `1px solid ${alpha(primaryMain, 0.12)}`,
                            }}
                          >
                            <IconComp sx={{ fontSize: 20 }} />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem', lineHeight: 1.3, mb: 0.25 }} noWrap>
                              {p.title}
                            </Typography>
                            <Chip
                              label={t(`projects.statusOptions.${p.status}`, statusCfg.label)}
                              size="small"
                              sx={{
                                height: 20, fontSize: '0.6rem', fontWeight: 700,
                                bgcolor: isLight ? statusCfg.bg : statusCfg.darkBg,
                                color: statusCfg.color,
                                borderRadius: 999,
                              }}
                            />
                          </Box>
                        </Stack>

                        {/* Description */}
                        {p.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6, fontSize: '0.82rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.description}
                          </Typography>
                        )}

                        {/* Skills */}
                        {p.skills?.length > 0 && (
                          <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
                            {p.skills.slice(0, 3).map((s) => (
                              <Chip
                                key={s}
                                label={s}
                                size="small"
                                sx={{
                                  height: 22, fontSize: '0.65rem', fontWeight: 600,
                                  bgcolor: alpha(primaryMain, 0.06),
                                  color: isLight ? primaryMain : theme.palette.primary.light,
                                  borderRadius: 999,
                                }}
                              />
                            ))}
                            {p.skills.length > 3 && (
                              <Chip
                                label={`+${p.skills.length - 3}`}
                                size="small"
                                sx={{ height: 22, fontSize: '0.65rem', borderRadius: 999, bgcolor: alpha(primaryMain, 0.04) }}
                              />
                            )}
                          </Stack>
                        )}

                        <Box sx={{ flex: 1 }} />

                        {/* Divider */}
                        <Divider sx={{ mb: 1.5 }} />

                        {/* Bottom Row */}
                        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                          {budget && (
                            <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                              <AttachMoneyOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
                                {budget}
                              </Typography>
                            </Stack>
                          )}
                          {p.deadline && (
                            <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                              <AccessTimeOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {new Date(p.deadline).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })}
                              </Typography>
                            </Stack>
                          )}
                          {clientName && (
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', ml: 'auto' }}>
                              <Avatar
                                src={p.client?.profile?.avatar}
                                sx={{
                                  width: 18, height: 18,
                                  fontSize: '0.5rem', fontWeight: 700,
                                  bgcolor: alpha(primaryMain, 0.1),
                                  border: `1px solid ${alpha(primaryMain, 0.15)}`,
                                }}
                              >
                                {clientName.charAt(0)}
                              </Avatar>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
                                {clientName}
                              </Typography>
                            </Stack>
                          )}
                          {p.createdAt && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.62rem' }}>
                              {timeAgo(p.createdAt, lang)}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    </motion.div>
                  </Grid>
                )
              })}
            </Grid>
          </motion.div>
        )}
      </Container>
    </Box>
  )
}
