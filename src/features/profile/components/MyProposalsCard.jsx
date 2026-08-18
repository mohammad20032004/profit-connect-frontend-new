import { useState, useEffect } from 'react'
import { Box, Paper, Typography, Stack, Chip, alpha, CircularProgress, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  WorkOutlineOutlined, AttachMoneyOutlined, ScheduleOutlined, TrendingUpOutlined,
} from '@mui/icons-material'
import { getMyProposals } from '@/services/projectService'
import { COLORS, formatCurrency } from '@/features/myProject/[id]/manage/components/manageConstants'

const PROP_STATUS = {
  Pending: { color: COLORS.warning, labelKey: 'proposals.proposalStatus.Pending' },
  Accepted: { color: COLORS.success, labelKey: 'proposals.proposalStatus.Accepted' },
  Rejected: { color: COLORS.error, labelKey: 'proposals.proposalStatus.Rejected' },
}

const PROJECT_STATUS_COLOR = {
  Open: COLORS.success,
  InProgress: COLORS.navy,
  Completed: COLORS.purple,
  Cancelled: COLORS.error,
}

const projectStatusLabel = (s) => {
  if (!s) return ''
  return s.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export default function MyProposalsCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getMyProposals()
      .then((res) => {
        if (active && res?.success) setProposals(res.data || [])
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 1, border: '1px solid', borderColor: alpha(COLORS.primary, 0.18), bgcolor: 'background.paper', width: '100%', textAlign: 'left' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(COLORS.primary, 0.08), color: COLORS.primary,
          }}>
            <WorkOutlineOutlined sx={{ fontSize: 17 }} />
          </Box>
          <Typography variant="subtitle2" fontWeight="bold">{t('profile.myProposals', 'My Proposals')}</Typography>
        </Stack>
        <Chip size="small" label={proposals.length}
          sx={{ height: 20, minWidth: 22, fontSize: '0.66rem', fontWeight: 800, bgcolor: alpha(COLORS.primary, 0.08), color: COLORS.primary }} />
      </Stack>

      {loading ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={18} />
          <Typography variant="caption" color="text.secondary">...</Typography>
        </Stack>
      ) : proposals.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 1.5 }}>
          {t('profile.noProposals', 'No proposals submitted yet')}
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ maxHeight: 340, overflowY: 'auto', pr: 0.5 }}>
          {proposals.map((p) => {
            const proj = p.project || {}
            const propCfg = PROP_STATUS[p.status] || PROP_STATUS.Pending
            const projStatusColor = PROJECT_STATUS_COLOR[proj.status] || COLORS.navy
            const budget = proj.budget || {}
            return (
              <Box key={p._id} onClick={() => navigate(`/projects/${proj._id}`)} sx={{
                cursor: 'pointer', p: 1.25, borderRadius: 2,
                border: '1px solid', borderColor: 'divider',
                bgcolor: alpha(COLORS.primary, 0.02),
                transition: 'all 0.2s ease',
                '&:hover': { borderColor: alpha(COLORS.primary, 0.4), bgcolor: alpha(COLORS.primary, 0.04), boxShadow: '0 4px 12px rgba(31,10,59,0.06)' },
              }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.82rem' }}>{proj.title || t('profile.untitledProject', 'Untitled project')}</Typography>

                  <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip size="small" label={t(`proposals.proposalStatus.${p.status}`, p.status)}
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, color: propCfg.color, bgcolor: alpha(propCfg.color, 0.1) }} />
                    {proj.status && (
                      <Chip size="small" label={projectStatusLabel(proj.status)}
                        sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, color: projStatusColor, bgcolor: alpha(projStatusColor, 0.1) }} />
                    )}
                  </Stack>

                  <Stack spacing={0.4} sx={{ mt: 0.25 }}>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <AttachMoneyOutlined sx={{ fontSize: 13, color: COLORS.success }} />
                      <Typography variant="body2" fontWeight={800} color="success.main" sx={{ fontSize: '0.75rem' }}>
                        {t('profile.bidAmount', 'Bid')}: {formatCurrency(p.bidAmount, budget.currency)}
                      </Typography>
                    </Stack>
                    {(Number(budget.min) > 0 || Number(budget.max) > 0) && (
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <TrendingUpOutlined sx={{ fontSize: 13, color: COLORS.navy }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem' }}>
                          {t('profile.projectBudget', 'Budget')}: {formatCurrency(budget.min, budget.currency)} - {formatCurrency(budget.max, budget.currency)}
                        </Typography>
                      </Stack>
                    )}
                    {p.deliveryTime && (
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <ScheduleOutlined sx={{ fontSize: 13, color: COLORS.warning }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.66rem' }}>
                          {t('profile.deliveryTime', 'Delivery')}: {p.deliveryTime}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Box>
            )
          })}
        </Stack>
      )}

      <Divider sx={{ my: 1.25 }} />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', fontSize: '0.6rem' }}>
        {t('profile.proposalsHint', 'Projects you have bid on')}
      </Typography>
    </Paper>
  )
}
