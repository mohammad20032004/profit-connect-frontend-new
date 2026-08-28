﻿import { RADIUS } from '@/theme/tokens'
import { useState, useMemo } from 'react'
import { Box, Badge, Menu, MenuItem, Typography, Chip, Divider, Stack } from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/utils/money'
import { formatDeadline } from '@/utils/deadline'

const statusColors = {
  Open: 'success',
  InProgress: 'primary',
  Completed: 'default',
  Cancelled: 'error',
}

export default function HeaderProjectsButton() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.user)
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const lang = i18n.language === 'ar' ? 'ar' : 'en'

  const items = useMemo(() => {
    const freelance = user?.freelance
    const applied = freelance?.asFreelancer?.appliedProjects || []
    const posted = freelance?.asClient?.postedProjects || []
    const list = [
      ...applied.map((p) => ({ kind: 'freelancer', project: p.project || p, proposalStatus: p.status })),
      ...posted.map((p) => ({ kind: 'client', project: p })),
    ]
    return list
      .filter((it) => it.project && it.project._id)
      .map((it) => ({
        ...it,
        id: it.project._id,
        title: it.project.title,
        category: it.project.category,
        status: it.project.status,
        budget: it.project.budget,
        deadline: it.project.deadline,
        progress: it.project.progress,
      }))
  }, [user])

  const count = items.length

  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const goTo = (it) => {
    handleClose()
    const isOwn = it.kind === 'client' || (it.kind === 'freelancer' && it.proposalStatus === 'Accepted')
    navigate(isOwn ? `/my-project/${it.id}` : `/projects/${it.id}`)
  }

  const budgetText = (b) => {
    if (!b || (!b.min && !b.max)) return '-'
    const cur = b.currency || 'USD'
    if (b.min && b.max) return `${formatMoney(b.min, cur)} – ${formatMoney(b.max, cur)}`
    return formatMoney(b.min || b.max, cur)
  }

  return (
    <>
      <Box
        component="span"
        onClick={handleOpen}
        aria-label={t('nav.myProjects')}
        title={t('nav.myProjects')}
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          color: 'text.secondary',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': { bgcolor: 'action.selected', color: 'text.primary' },
        }}
      >
        <Badge color="primary" badgeContent={count} max={99} overlap="circular" invisible={count === 0}>
          <DashboardOutlinedIcon sx={{ fontSize: 22 }} />
        </Badge>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              width: 360,
              maxWidth: '92vw',
              maxHeight: 440,
              overflowY: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              borderRadius: 3,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>{t('nav.myProjects')}</Typography>
        </Box>
        <Divider />
        {count === 0 ? (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <WorkOutlineOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">{t('nav.myProjectsEmpty')}</Typography>
          </Box>
        ) : (
          items.map((it) => (
            <MenuItem
              key={it.id}
              onClick={() => goTo(it)}
              sx={{ display: 'block', px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>{it.title}</Typography>
                <Chip
                  size="small"
                  label={t(`projects.statusOptions.${it.status}`, it.status)}
                  color={statusColors[it.status] || 'default'}
                  variant={it.status === 'Completed' ? 'filled' : 'outlined'}
                />
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ mt: 0.5, flexWrap: 'wrap', color: 'text.secondary' }}>
                {it.category && <Typography variant="caption">{it.category}</Typography>}
                <Typography variant="caption">• {budgetText(it.budget)}</Typography>
                {it.deadline ? (
                  <Typography variant="caption">• {formatDeadline(it.deadline, lang)}</Typography>
                ) : null}
                {typeof it.progress === 'number' ? (
                  <Typography variant="caption">• {it.progress}%</Typography>
                ) : null}
              </Stack>
              {it.kind === 'freelancer' && it.proposalStatus ? (
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  {t(`projects.status${it.proposalStatus}`, it.proposalStatus)}
                </Typography>
              ) : null}
            </MenuItem>
          ))
        )}
        <Box sx={{ p: 1 }}>
          <MenuItem onClick={() => { handleClose(); navigate('/projects') }} sx={{ justifyContent: 'center', borderRadius: RADIUS }}>
            <Typography variant="body2" fontWeight={700} color="primary">{t('nav.viewAllProjects')}</Typography>
          </MenuItem>
        </Box>
      </Menu>
    </>
  )
}
