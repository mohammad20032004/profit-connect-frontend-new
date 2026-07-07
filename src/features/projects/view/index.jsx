import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Container, Typography, Stack, CircularProgress, Button, Card, CardContent, Avatar, Chip, Paper, TextField, MenuItem, alpha,
} from '@mui/material'
import {
  WorkOutlineOutlined, CodeOutlined, DesignServicesOutlined, AttachMoneyOutlined,
  AccessTimeOutlined, PersonOutlined, AddOutlined, SearchOutlined, PostAddOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'
import { getProjects, getMyProjectsWithProposals } from '@/services/projectService'

const categoryIcons = {
  'تطوير ويب': <CodeOutlined sx={{ fontSize: 20 }} />,
  'تطوير تطبيقات': <CodeOutlined sx={{ fontSize: 20 }} />,
  'تصميم UI/UX': <DesignServicesOutlined sx={{ fontSize: 20 }} />,
  'تصميم جرافيك': <DesignServicesOutlined sx={{ fontSize: 20 }} />,
  'تطوير خلفي': <CodeOutlined sx={{ fontSize: 20 }} />,
  'تطوير أمامي': <CodeOutlined sx={{ fontSize: 20 }} />,
  'Web Development': <CodeOutlined sx={{ fontSize: 20 }} />,
  'Mobile Development': <CodeOutlined sx={{ fontSize: 20 }} />,
  'UI/UX Design': <DesignServicesOutlined sx={{ fontSize: 20 }} />,
  'Graphic Design': <DesignServicesOutlined sx={{ fontSize: 20 }} />,
  'Backend Development': <CodeOutlined sx={{ fontSize: 20 }} />,
  'Frontend Development': <CodeOutlined sx={{ fontSize: 20 }} />,
}

const statusColors = {
  Open: 'success',
  InProgress: 'info',
  Completed: 'default',
  Cancelled: 'error',
}

const categories = [
  'Web Development', 'Mobile Development', 'UI/UX Design',
  'Graphic Design', 'Backend Development', 'Frontend Development',
  'Other',
]

export default function ProjectsList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const theme = useTheme()
  const currentUser = useSelector((state) => state.user.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [mine, setMine] = useState(false)

  const fetch = useCallback(async () => {
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

  useEffect(() => { fetch() }, [fetch])

  const handleCategoryChange = (val) => {
    setCategory(val)
    if (val) searchParams.set('category', val)
    else searchParams.delete('category')
    setSearchParams(searchParams)
  }

  const handleSearch = () => {
    if (search) searchParams.set('search', search)
    else searchParams.delete('search')
    setSearchParams(searchParams)
    fetch()
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
     

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            select
            label={t('projects.category', 'Category')}
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{t('projects.allCategories', 'All Categories')}</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{t(`projects.categoryOptions.${cat}`, cat)}</MenuItem>
            ))}
          </TextField>
          <TextField
            placeholder={t('projects.searchPlaceholder', 'Search projects...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            slotProps={{ input: { startAdornment: <SearchOutlined sx={{ fontSize: 20, mr: 0.5, color: 'text.disabled' }} /> } }}
            sx={{ flex: 1 }}
          />
          <Button variant={mine ? 'contained' : 'outlined'} color={mine ? 'secondary' : 'primary'}
            startIcon={<WorkOutlineOutlined />}
            onClick={() => setMine(v => !v)}
            sx={{ flexShrink: 0, borderRadius: 999, px: 2.5, fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap', minWidth: 140 }}
          >
            {mine ? t('projects.myProjects', 'My Projects') : t('projects.myProjects', 'My Projects')}
          </Button>
          <Button variant="contained" startIcon={<PostAddOutlined />} component={Link} to="/projects/create"
            sx={{ flexShrink: 0, borderRadius: 999, px: 3, fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            {t('projects.postProject', 'Post a New Project')}
          </Button>
        </Stack>
      </Paper>

      {error ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Button variant="outlined" onClick={fetch}>{t('projects.retry', 'Retry')}</Button>
        </Paper>
      ) : loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : projects.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <WorkOutlineOutlined sx={{ fontSize: 64, color: alpha(theme.palette.text.disabled, 0.4), mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>{t('projects.noProjects', 'No projects yet')}</Typography>
          <Button variant="contained" onClick={() => navigate('/projects/create')}>
            {t('projects.create', 'Post a Project')}
          </Button>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {projects.map((p) => (
            <Card
              key={p._id}
              sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: theme.shadows[4], transform: 'translateY(-2px)' } }}
              onClick={() => navigate(mine ? `/myProject/${p._id}` : `/projects/${p._id}`)}
            >
              <CardContent sx={{ display: 'flex', gap: 2.5 }}>
                <Avatar
                  sx={{ width: 52, height: 52, bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }}
                >
                  {categoryIcons[p.category] || <WorkOutlineOutlined sx={{ fontSize: 20 }} />}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>{p.title}</Typography>
                    <Chip label={t(`projects.statusOptions.${p.status}`, p.status)} size="small" color={statusColors[p.status] || 'default'} variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                  </Stack>
                  {p.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.6 }} noWrap>
                      {p.description}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    {p.budget?.min && (
                      <Chip icon={<AttachMoneyOutlined sx={{ fontSize: 15 }} />} label={`${p.budget.currency || 'SAR'} ${p.budget.min.toLocaleString()}${p.budget.max ? ` - ${p.budget.max.toLocaleString()}` : ''}`} size="small" variant="outlined" sx={{ fontSize: '0.78rem' }} />
                    )}
                    {p.deadline && (
                      <Chip icon={<AccessTimeOutlined sx={{ fontSize: 15 }} />} label={new Date(p.deadline).toLocaleDateString()} size="small" variant="outlined" sx={{ fontSize: '0.78rem' }} />
                    )}
                    {p.skills?.length > 0 && p.skills.slice(0, 3).map((s) => (
                      <Chip key={s} label={s} size="small" sx={{ fontSize: '0.75rem', bgcolor: alpha(theme.palette.primary.main, 0.06) }} />
                    ))}
                    <Chip icon={<PersonOutlined sx={{ fontSize: 15 }} />} label={t('projects.clientLabel', 'Client')} size="small" variant="outlined" sx={{ fontSize: '0.78rem' }} />
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  )
}
