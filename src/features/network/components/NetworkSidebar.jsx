﻿import { RADIUS } from '@/theme/tokens'
import { Box, Typography, Stack, alpha, Divider, CircularProgress, Chip, IconButton, Tooltip, Skeleton } from '@mui/material'
import { KeyboardArrowUpOutlined } from '@mui/icons-material'
import UserAvatar from '@/components/common/UserAvatar'
import { COLORS, fullName } from './shared'

function MenuItem({ icon: Icon, label, count, active, loading, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.25, px: 1.25, py: 1, mx: 0.5,
        borderRadius: RADIUS, cursor: 'pointer', userSelect: 'none', transition: 'all 0.15s ease',
        bgcolor: active ? alpha(COLORS.primary, 0.08) : 'transparent',
        '&:hover': {
          bgcolor: active ? alpha(COLORS.primary, 0.12) : alpha(COLORS.primary, 0.05),
        },
      }}
    >
      <Icon sx={{ fontSize: 22, color: active ? COLORS.primary : 'text.secondary', flexShrink: 0 }} />
      <Typography
        sx={{
          flex: 1, minWidth: 0, fontSize: '0.9rem', fontWeight: active ? 700 : 600,
          color: active ? COLORS.primary : 'text.primary',
        }}
        noWrap
      >
        {label}
      </Typography>
      {loading && <CircularProgress size={14} sx={{ color: COLORS.primary }} />}
      {count != null && count > 0 && (
        <Chip
          label={count}
          size="small"
          sx={{
            height: 20, minWidth: 20, fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
            bgcolor: active ? alpha(COLORS.primary, 0.18) : alpha(COLORS.primary, 0.08),
            color: active ? COLORS.primary : 'text.secondary',
            '& .MuiChip-label': { px: 0.75 },
          }}
        />
      )}
    </Box>
  )
}

export default function NetworkSidebar({
  tabs, tab, onTabChange, expanded, onToggleExpanded,
  following, followingLoading, onSelectUser, selectedId, t,
}) {
  const isFollowingTab = tab === 3

  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column', height: '100%',
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
        borderRadius: RADIUS, overflow: 'hidden',
      }}
    >
      {isFollowingTab && expanded ? (
        <>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', px: 1, py: 1.25, flexShrink: 0 }}
          >
            <Tooltip title={t('network.backToMenu', 'العودة إلى السايدبار الافتراضي')}>
              <span>
                <IconButton size="small" onClick={onToggleExpanded} sx={{ color: COLORS.primary }}>
                  <KeyboardArrowUpOutlined sx={{ fontSize: 22 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={800} noWrap>
                {t('network.followingTitle', 'الأشخاص الذين تتابعهم')}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {t('network.followingListHint', 'اختر اسماً لعرض ملفه الشخصي')}
              </Typography>
            </Box>
            {following.length > 0 && (
              <Chip
                label={following.length}
                size="small"
                sx={{ height: 20, minWidth: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(COLORS.success, 0.1), color: COLORS.success, '& .MuiChip-label': { px: 0.75 } }}
              />
            )}
          </Stack>
          <Divider sx={{ flexShrink: 0 }} />
          <Stack sx={{ flex: 1, overflowY: 'auto', p: 0.75, gap: 0.25 }}>
            {followingLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center', px: 0.75, py: 0.75 }}>
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={14} />
                    <Skeleton variant="text" width="50%" height={11} />
                  </Box>
                </Stack>
              ))
            ) : following.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                {t('network.noFollowing', 'لا تتابع أحداً بعد')}
              </Typography>
            ) : (
              following.map((u) => {
                const name = fullName(u)
                const headline = typeof u?.profile?.headline === 'string' ? u.profile.headline : ''
                const active = selectedId === u._id
                return (
                  <Box
                    key={u._id}
                    onClick={() => onSelectUser(u._id)}
                    sx={{
                      display: 'flex', gap: 1, alignItems: 'center', px: 1, py: 0.85,
                      borderRadius: RADIUS, cursor: 'pointer', transition: 'all 0.15s ease',
                      bgcolor: active ? alpha(COLORS.primary, 0.08) : 'transparent',
                      '&:hover': { bgcolor: active ? alpha(COLORS.primary, 0.12) : alpha(COLORS.primary, 0.06) },
                    }}
                  >
                    <UserAvatar
                      src={u?.profile?.avatar}
                      name={name}
                      role={u?.role}
                      gender={u?.profile?.gender}
                      sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 700, fontSize: '0.9rem' }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={active ? 700 : 600} color={active ? COLORS.primary : 'text.primary'} noWrap>{name}</Typography>
                      {headline && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', fontSize: '0.68rem' }}>
                          {headline}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )
              })
            )}
          </Stack>
        </>
      ) : (
        <>
          <Box sx={{ px: 1.5, py: 1.5, flexShrink: 0 }}>
            <Typography variant="h6" fontWeight={800}>
              {t('network.title', 'الشبكة')}
            </Typography>
          </Box>
          <Divider sx={{ flexShrink: 0 }} />
          <Stack sx={{ flex: 1, overflowY: 'auto', py: 0.75 }} spacing={0.25}>
            {tabs.map((tb, i) => (
              <MenuItem
                key={tb.key}
                icon={tb.icon}
                label={tb.label}
                count={tb.count}
                loading={tb.loading}
                active={tab === i}
                onClick={() => onTabChange(i)}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  )
}