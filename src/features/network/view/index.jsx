import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Stack, alpha, CircularProgress, Avatar, IconButton, Tooltip,
  Tabs, Tab, TextField as MuiTextField, useMediaQuery, Divider, Chip,
} from '@mui/material'
import {
  GroupOutlined, PersonAddOutlined, PersonAddAlt1Outlined, HourglassTopOutlined,
  SearchOutlined, PeopleAltOutlined, PersonOffOutlined, CheckOutlined, CloseOutlined,
  PersonSearchOutlined, PersonRemoveOutlined, RefreshOutlined, StarBorderOutlined,
  WorkOutlineOutlined, EmojiEventsOutlined, ChevronRightOutlined, ChevronLeftOutlined, ClearOutlined,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import Button from '@/ui/Button'
import {
  getConnections, getIncomingRequests, getSentRequests,
  sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest,
  cancelConnectionRequest, removeConnection, searchUsers, getMyFollowers, getMyFollowing,
  toggleFollowUser, getDiscoverUsers, getTopUsers,
} from '@/services/networkService'
import { resolveMediaPath } from '@/services/profile'

const COLORS = {
  primary: '#3D1C6E',
  navy: '#1F3670',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
  purple: '#7C3AED',
}

const listGridSx = {
  display: 'grid',
  gap: 1.5,
  alignItems: 'stretch',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
}

function fullName(user) {
  if (!user) return ''
  if (typeof user === 'string') return user
  const prof = user.profile || {}
  return [prof.firstName, prof.lastName].filter(Boolean).join(' ') || user.username || user.name || prof.fullname || ''
}

function UserCard({ user, status, following, onConnect, onAccept, onReject, onCancel, onRemove, onToggleFollow, busyId, t, navigate }) {
  const avatarSrc = resolveMediaPath(user?.profile?.avatar)
  const name = fullName(user)
  const headline = user?.profile?.headline || user?.headline || ''
  const followersCount = user?.profile?.followersCount
  const rScore = user?.profile?.rScore
  const years = user?.professional?.yearsOfExperience
  const skills = user?.professional?.skills || []
  const role = user?.role
  const roleLabel = role ? t(`network.roles.${role}`, role) : ''

  return (
    <Paper variant="outlined" sx={{
      p: 1.75, borderRadius: 2, display: 'flex', gap: 1.5, alignItems: 'center',
      transition: 'all 0.2s ease',
      '&:hover': { boxShadow: '0 6px 20px rgba(31,10,59,0.08)', borderColor: alpha(COLORS.primary, 0.25) },
    }}>
      <Avatar
        src={avatarSrc}
        sx={{ width: 48, height: 48, flexShrink: 0, bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 700 }}
      >
        {name?.charAt(0)?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ cursor: 'pointer', '&:hover': { color: COLORS.primary } }}
          onClick={() => navigate(`/user-profile/${user._id}`)}>
          {name}
        </Typography>
        {headline && (
          <Typography variant="caption" color="text.secondary" noWrap>{headline}</Typography>
        )}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mt: 0.4 }}>
          {roleLabel && (
            <Chip label={roleLabel} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, borderRadius: 1 }} />
          )}
          {followersCount != null && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
              <PeopleAltOutlined sx={{ fontSize: 13 }} />
              {followersCount}
            </Typography>
          )}
          {rScore != null && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
              <StarBorderOutlined sx={{ fontSize: 13, color: COLORS.warning }} />
              {rScore}
            </Typography>
          )}
          {years != null && years > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
              <WorkOutlineOutlined sx={{ fontSize: 13 }} />
              {t('network.yearsExp', '{{count}}y', { count: years })}
            </Typography>
          )}
          {skills.slice(0, 3).map((s) => (
            <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.62rem', borderRadius: 1 }} />
          ))}
        </Stack>
      </Box>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
        {onToggleFollow && (
          <Button
            size="small"
            variant={following ? 'outlined' : 'contained'}
            color={following ? 'error' : 'primary'}
            startIcon={following ? <PersonOffOutlined sx={{ fontSize: 15 }} /> : <PersonAddAlt1Outlined sx={{ fontSize: 15 }} />}
            onClick={() => onToggleFollow(user)}
            disabled={busyId === user._id}
            sx={{ minWidth: 0, px: 1.25, fontSize: '0.72rem', textTransform: 'none', borderRadius: 1.5 }}
          >
            {following ? t('network.unfollow', 'Unfollow') : t('network.follow', 'Follow')}
          </Button>
        )}

        {onConnect && (
          <Button
            size="small"
            variant={status === 'none' ? 'contained' : 'outlined'}
            disabled={busyId === user._id}
            startIcon={status === 'none' ? <PersonAddOutlined sx={{ fontSize: 15 }} /> : <HourglassTopOutlined sx={{ fontSize: 15 }} />}
            onClick={() => onConnect(user)}
            sx={{ minWidth: 0, px: 1.25, fontSize: '0.72rem', textTransform: 'none', borderRadius: 1.5 }}
          >
            {status === 'connected'
              ? t('network.connected', 'Connected')
              : status === 'pending_sent'
                ? t('network.pending', 'Pending')
                : t('network.connect', 'Connect')}
          </Button>
        )}

        {onAccept && (
          <>
            <Tooltip title={t('network.accept', 'Accept')}>
              <span>
                <IconButton size="small" color="success" onClick={() => onAccept(user)} disabled={busyId === user._id}>
                  <CheckOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('network.reject', 'Reject')}>
              <span>
                <IconButton size="small" color="error" onClick={() => onReject(user)} disabled={busyId === user._id}>
                  <CloseOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </span>
            </Tooltip>
          </>
        )}

        {onCancel && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onCancel(user)}
            disabled={busyId === user._id}
            sx={{ minWidth: 0, px: 1.25, fontSize: '0.72rem', textTransform: 'none', borderRadius: 1.5 }}
          >
            {t('network.cancel', 'Cancel')}
          </Button>
        )}

        {onRemove && (
          <Tooltip title={t('network.remove', 'Remove connection')}>
            <span>
              <IconButton size="small" color="error" onClick={() => onRemove(user)} disabled={busyId === user._id}>
                {busyId === user._id ? <CircularProgress size={16} /> : <PersonRemoveOutlined sx={{ fontSize: 18 }} />}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  )
}

function TopUserCard({ user, rank, following, onToggleFollow, busyId, t, navigate, isRTL }) {
  const avatarSrc = resolveMediaPath(user?.profile?.avatar)
  const name = fullName(user)
  const headline = user?.profile?.headline || ''
  const rScore = user?.profile?.rScore
  const followersCount = user?.profile?.followersCount
  const skills = (user?.professional?.skills || []).slice(0, 3)
  const roleLabel = user?.role ? t(`network.roles.${user.role}`, user.role) : ''
  const medalColor = rank === 1 ? '#D4AF37' : rank === 2 ? '#A9A9A9' : rank === 3 ? '#CD7F32' : null
  const corner = isRTL ? { left: 10 } : { right: 10 }

  return (
    <Paper variant="outlined" sx={{
      width: 200, flex: '0 0 auto', p: 2, borderRadius: 2, textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75,
      position: 'relative', transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 8px 24px rgba(31,10,59,0.1)', borderColor: alpha(COLORS.primary, 0.25), transform: 'translateY(-2px)',
      },
    }}>
      {rank <= 3 ? (
        <EmojiEventsOutlined sx={{ fontSize: 22, color: medalColor, position: 'absolute', top: 10, ...corner }} />
      ) : (
        <Typography variant="caption" fontWeight={800} sx={{ position: 'absolute', top: 8, ...(isRTL ? { left: 12 } : { right: 12 }), color: 'text.disabled' }}>
          #{rank}
        </Typography>
      )}

      <Avatar
        src={avatarSrc}
        sx={{ width: 72, height: 72, mt: 1, bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 700, fontSize: '1.4rem' }}
      >
        {name?.charAt(0)?.toUpperCase()}
      </Avatar>

      <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ maxWidth: '100%', cursor: 'pointer', '&:hover': { color: COLORS.primary } }}
        onClick={() => navigate(`/user-profile/${user._id}`)}>
        {name}
      </Typography>

      {roleLabel && (
        <Chip label={roleLabel} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, borderRadius: 1 }} />
      )}

      {headline && (
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, height: 34, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {headline}
        </Typography>
      )}

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
        {rScore != null && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
            <StarBorderOutlined sx={{ fontSize: 14, color: COLORS.warning }} />
            {rScore}
          </Typography>
        )}
        {followersCount != null && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
            <PeopleAltOutlined sx={{ fontSize: 14 }} />
            {followersCount}
          </Typography>
        )}
      </Stack>

      {skills.length > 0 && (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
          {skills.map((s) => (
            <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.6rem', borderRadius: 1 }} />
          ))}
        </Stack>
      )}

      <Button
        fullWidth
        size="small"
        variant={following ? 'outlined' : 'contained'}
        color={following ? 'error' : 'primary'}
        startIcon={following ? <PersonOffOutlined sx={{ fontSize: 15 }} /> : <PersonAddAlt1Outlined sx={{ fontSize: 15 }} />}
        onClick={() => onToggleFollow(user)}
        disabled={busyId === user._id}
        sx={{ mt: 'auto', pt: 0.75, pb: 0.75, textTransform: 'none', fontSize: '0.75rem', borderRadius: 1.5 }}
      >
        {following ? t('network.unfollow', 'Unfollow') : t('network.follow', 'Follow')}
      </Button>
    </Paper>
  )
}

function EmptyState({ icon, text, action }) {
  return (
    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2.5, borderStyle: 'dashed' }}>
      {icon}
      <Typography color="text.secondary" sx={{ mb: action ? 1.5 : 0 }}>{text}</Typography>
      {action}
    </Paper>
  )
}

export default function NetworkView() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isRTL = i18n.language === 'ar'

  const [tab, setTab] = useState(0)

  const [connections, setConnections] = useState([])
  const [incoming, setIncoming] = useState([])
  const [sent, setSent] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])

  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  const [discover, setDiscover] = useState([])
  const [discoverLoading, setDiscoverLoading] = useState(false)

  const [topUsers, setTopUsers] = useState([])
  const [topLoading, setTopLoading] = useState(false)
  const topScrollerRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const fetchConnections = useCallback(async () => {
    try {
      const res = await getConnections()
      if (res?.success) setConnections(res.data || [])
    } catch { /* ignore */ }
  }, [])

  const fetchRequests = useCallback(async () => {
    try {
      const [inc, sentRes] = await Promise.all([getIncomingRequests(), getSentRequests()])
      if (inc?.success) setIncoming(inc.data || [])
      if (sentRes?.success) setSent(sentRes.data || [])
    } catch { /* ignore */ }
  }, [])

  const fetchFollowers = useCallback(async () => {
    try {
      const [fol, fw] = await Promise.all([getMyFollowers(), getMyFollowing()])
      if (fol?.success) {
        const followingIds = new Set((fw?.success ? (fw.data || []) : []).map((u) => u._id))
        setFollowers((fol.data || []).map((u) => ({ ...u, isFollowing: u.isFollowing ?? followingIds.has(u._id) })))
      }
    } catch { /* ignore */ }
  }, [])

  const fetchFollowing = useCallback(async () => {
    try {
      const res = await getMyFollowing()
      if (res?.success) setFollowing((res.data || []).map((u) => ({ ...u, isFollowing: true })))
    } catch { /* ignore */ }
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([fetchConnections(), fetchRequests(), fetchFollowers(), fetchFollowing()])
    } finally {
      setLoading(false)
    }
  }, [fetchConnections, fetchRequests, fetchFollowers, fetchFollowing])

  useEffect(() => { refreshAll() }, [refreshAll])

  const fetchDiscover = useCallback(async () => {
    setDiscoverLoading(true)
    setError('')
    try {
      const res = await getDiscoverUsers(10)
      if (res?.success) setDiscover(res.data || [])
      else setError(res?.message || t('common.error'))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setDiscoverLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (tab === 2 && discover.length === 0 && !discoverLoading) fetchDiscover()
  }, [tab, discover.length, discoverLoading, fetchDiscover])

  const fetchTopUsers = useCallback(async () => {
    setTopLoading(true)
    try {
      const [res, followingRes] = await Promise.all([
        getTopUsers(10),
        getMyFollowing(),
      ])
      if (res?.success) {
        const followingIds = new Set(
          (followingRes?.success ? (followingRes.data || []) : []).map((u) => u._id)
        )
        setTopUsers((res.data || []).map((u) => ({
          ...u,
          isFollowing: followingIds.has(u._id),
        })))
      }
    } catch { /* ignore */ } finally {
      setTopLoading(false)
    }
  }, [])

  useEffect(() => { fetchTopUsers() }, [fetchTopUsers])

  const scrollTopSlider = useCallback((factor) => {
    const el = topScrollerRef.current
    if (el) el.scrollBy({ left: factor * 260, behavior: 'smooth' })
  }, [])

  const updateStatusFor = (list, setter, id, newStatus) => {
    setter((prev) => prev.map((u) => (u._id === id ? { ...u, connectionStatus: newStatus } : u)))
  }

  const handleConnect = async (user) => {
    setBusyId(user._id)
    setError('')
    try {
      const res = await sendConnectionRequest(user._id)
      if (res?.success) {
        updateStatusFor(searchResults, setSearchResults, user._id, 'pending_sent')
        fetchRequests()
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setBusyId(null)
    }
  }

  const handleAccept = async (req) => {
    setBusyId(req._id)
    setError('')
    try {
      const res = await acceptConnectionRequest(req._id)
      if (res?.success) {
        setIncoming((prev) => prev.filter((r) => r._id !== req._id))
        fetchConnections()
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setBusyId(null)
    }
  }

  const handleReject = async (req) => {
    setBusyId(req._id)
    setError('')
    try {
      const res = await rejectConnectionRequest(req._id)
      if (res?.success) {
        setIncoming((prev) => prev.filter((r) => r._id !== req._id))
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setBusyId(null)
    }
  }

  const handleCancel = async (userId) => {
    setBusyId(userId)
    setError('')
    try {
      const res = await cancelConnectionRequest(userId)
      if (res?.success) {
        setSent((prev) => prev.filter((r) => r.recipient?._id !== userId && r.recipient !== userId))
        updateStatusFor(searchResults, setSearchResults, userId, 'none')
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setBusyId(null)
    }
  }

  const handleRemove = async (userId) => {
    setBusyId(userId)
    setError('')
    try {
      const res = await removeConnection(userId)
      if (res?.success) {
        setConnections((prev) => prev.filter((c) => c._id !== userId))
        updateStatusFor(searchResults, setSearchResults, userId, 'none')
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setBusyId(null)
    }
  }

  const applyFollowing = (id, next) => {
    const patch = (list, setter) => {
      setter((prev) => prev.map((u) => (u._id === id ? { ...u, isFollowing: next } : u)))
    }
    patch(searchResults, setSearchResults)
    patch(followers, setFollowers)
    patch(following, setFollowing)
    patch(discover, setDiscover)
    patch(topUsers, setTopUsers)
  }

  const handleToggleFollow = async (user) => {
    setBusyId(user._id)
    setError('')
    const prev = !!user.isFollowing
    applyFollowing(user._id, !prev)
    try {
      const res = await toggleFollowUser(user._id)
      if (res && 'following' in res) {
        applyFollowing(user._id, !!res.following)
      } else {
        applyFollowing(user._id, prev)
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      applyFollowing(user._id, prev)
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults([])
      setSearchLoading(false)
      return
    }
    setSearchLoading(true)
    setError('')
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(q)
        if (res?.success) setSearchResults(res.data || [])
        else setError(res?.message || t('common.error'))
      } catch (err) {
        setError(err?.response?.data?.message || err.message || t('common.error'))
      } finally {
        setSearchLoading(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchQuery, t])

  const tabs = [
    { label: t('network.myNetwork', 'My Network'), icon: <GroupOutlined /> },
    { label: `${t('network.requests', 'Requests')}${incoming.length ? ` (${incoming.length})` : ''}`, icon: <PersonAddOutlined /> },
    { label: t('network.discover', 'Discover'), icon: <PersonSearchOutlined /> },
    { label: t('network.followersTab', 'Followers'), icon: <PeopleAltOutlined /> },
    { label: t('network.followingTab', 'Following'), icon: <PersonAddAlt1Outlined /> },
  ]

  const renderTabContent = () => {
    if (tab === 0) {
      return (
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={800}>{t('network.connectionsTitle', 'Your connections')}</Typography>
          {connections.length === 0 ? (
            <EmptyState
              icon={<GroupOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
              text={t('network.noConnections', 'No connections yet. Discover people to connect with.')}
              action={<Button variant="contained" onClick={() => setTab(2)}>{t('network.discover', 'Discover')}</Button>}
            />
            ) : (
              <Box sx={listGridSx}>
                {connections.map((u) => (
                  <UserCard key={u._id} user={u} status="connected" busyId={busyId} t={t} navigate={navigate}
                    onRemove={(user) => handleRemove(user._id)} />
                ))}
              </Box>
            )}
          </Stack>
        )
      }

    if (tab === 1) {
      return (
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>{t('network.incomingTitle', 'Pending requests you received')}</Typography>
            {incoming.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2.5, borderStyle: 'dashed' }}>
                <Typography color="text.secondary">{t('network.noIncoming', 'No pending requests')}</Typography>
              </Paper>
            ) : (
              <Stack spacing={1.5}>
                {incoming.map((r) => (
                  <UserCard key={r._id} user={r.requester} busyId={busyId} t={t} navigate={navigate}
                    onAccept={() => handleAccept(r)} onReject={() => handleReject(r)} />
                ))}
              </Stack>
            )}
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>{t('network.sentTitle', 'Requests you sent')}</Typography>
            {sent.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2.5, borderStyle: 'dashed' }}>
                <Typography color="text.secondary">{t('network.noSent', 'No sent requests')}</Typography>
              </Paper>
            ) : (
              <Stack spacing={1.5}>
                {sent.map((r) => {
                  const target = r.recipient?._id ? r.recipient : r.recipient
                  return (
                    <UserCard key={r._id} user={target} busyId={busyId} t={t} navigate={navigate}
                      onCancel={() => handleCancel(target?._id)} />
                  )
                })}
              </Stack>
            )}
          </Box>
        </Stack>
      )
    }

    if (tab === 2) {
      const searching = searchQuery.trim().length > 0
      return (
        <Stack spacing={2.5}>
          {/* Live search */}
          <Paper variant="outlined" sx={{ p: 2 , bgcolor: "transparent", boxShadow: "none", border: "none"}}>
            <MuiTextField
              fullWidth
              size="small"
              placeholder={t('network.searchPlaceholder', 'Search by name, headline or username...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              slotProps={{
                input: {
                  startAdornment: <SearchOutlined sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />,
                  endAdornment: searchQuery ? (
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearOutlined sx={{ fontSize: 18 }} />
                    </IconButton>
                  ) : null,
                },
              }}
            />
          </Paper>

          {searching ? (
            <Stack spacing={1.5}>
              {searchLoading ? (
                <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : searchResults.length === 0 ? (
                <EmptyState
                  icon={<PersonSearchOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
                  text={t('network.noSearchResults', 'No people found for your search.')}
                />
              ) : (
                <>
                  <Typography variant="subtitle1" fontWeight={800}>{t('network.searchResults', 'Search results')}</Typography>
                  <Box sx={listGridSx}>
                    {searchResults.map((u) => (
                      <UserCard key={u._id} user={u} status={u.connectionStatus || 'none'} following={u.isFollowing}
                        busyId={busyId} t={t} navigate={navigate}
                        onConnect={() => handleConnect(u)} onToggleFollow={() => handleToggleFollow(u)} />
                    ))}
                  </Box>
                </>
              )}
            </Stack>
          ) : (
            <>
              {/* Most active users slider */}
              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <EmojiEventsOutlined sx={{ fontSize: 24, color: COLORS.warning, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={800}>{t('network.topUsersTitle', 'Most active on the platform')}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {t('network.topUsersSubtitle', 'Top rated members, ranked by reputation score')}
                      </Typography>
                    </Box>
                  </Stack>
                  {topUsers.length > 0 && (
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => scrollTopSlider(isRTL ? 1 : -1)} disabled={topLoading}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <ChevronRightOutlined sx={{ transform: isRTL ? 'scaleX(-1)' : 'none', fontSize: 18 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => scrollTopSlider(isRTL ? -1 : 1)} disabled={topLoading}
                        sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <ChevronLeftOutlined sx={{ transform: isRTL ? 'scaleX(-1)' : 'none', fontSize: 18 }} />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>

                {topLoading ? (
                  <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={24} />
                  </Stack>
                ) : topUsers.length > 0 ? (
                  <Box ref={topScrollerRef} sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, scrollbarWidth: 'thin' }}>
                    {topUsers.map((u, i) => (
                      <TopUserCard key={u._id} user={u} rank={i + 1} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate} isRTL={isRTL}
                        onToggleFollow={() => handleToggleFollow(u)} />
                    ))}
                  </Box>
                ) : null}
              </Box>

              <Divider />

              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <StarBorderOutlined sx={{ fontSize: 20, color: COLORS.warning }} />
                  <Typography variant="subtitle1" fontWeight={800}>{t('network.suggestedTitle', 'Suggested for you')}</Typography>
                </Stack>
                <Button size="small" variant="outlined" startIcon={<RefreshOutlined sx={{ fontSize: 15 }} />}
                  onClick={fetchDiscover} disabled={discoverLoading} sx={{ fontSize: '0.72rem', textTransform: 'none', borderRadius: 1.5 }}>
                  {t('network.moreSuggestions', 'More suggestions')}
                </Button>
              </Stack>

              {discoverLoading ? (
                <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : discover.length === 0 ? (
                <EmptyState
                  icon={<PersonSearchOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
                  text={t('network.noSuggestions', 'No suggestions right now — try the search above.')}
                />
              ) : (
                <Box sx={listGridSx}>
                  {discover.map((u) => (
                    <UserCard key={u._id} user={u} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
                      onToggleFollow={() => handleToggleFollow(u)} />
                  ))}
                </Box>
              )}
            </>
          )}
        </Stack>
      )
    }

    if (tab === 3) {
      return (
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={800}>{t('network.followersTitle', 'People following you')}</Typography>
          {followers.length === 0 ? (
            <EmptyState
              icon={<PeopleAltOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
              text={t('network.noFollowers', 'No followers yet')}
            />
          ) : (
            <Box sx={listGridSx}>
              {followers.map((u) => (
                <UserCard key={u._id} user={u} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
                  onToggleFollow={() => handleToggleFollow(u)} />
              ))}
            </Box>
          )}
        </Stack>
      )
    }

    return (
      <Stack spacing={1.5}>
        <Typography variant="subtitle1" fontWeight={800}>{t('network.followingTitle', 'People you follow')}</Typography>
        {following.length === 0 ? (
          <EmptyState
            icon={<PersonAddAlt1Outlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
            text={t('network.noFollowing', 'You are not following anyone yet')}
          />
        ) : (
          <Box sx={listGridSx}>
            {following.map((u) => (
              <UserCard key={u._id} user={u} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
                onToggleFollow={() => handleToggleFollow(u)} />
            ))}
          </Box>
        )}
      </Stack>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1500, mx: 'auto' }}>
        {error && (
          <Typography variant="body2" color="error.main" sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(COLORS.error, 0.08), textAlign: 'center', fontWeight: 600, mb: 2 }}>
            {error}
          </Typography>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'flex-start' }}>
          {/* Vertical tabs sidebar */}
          <Paper variant="outlined" sx={{
            width: { xs: '100%', md: 240, lg: 270 }, flexShrink: 0,
            position: { md: 'sticky' }, top: { md: 88 }, alignSelf: 'flex-start', zIndex: 2,
            p: { xs: 1, md: 1.25 },
            borderRadius: 1.5,
          }}>
            <Tabs
              orientation={isMobile ? 'horizontal' : 'vertical'}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, minHeight: 48, justifyContent: { md: 'flex-start' }, alignItems: 'center', gap: 1 },
                '& .MuiTabs-indicator': { backgroundColor: COLORS.primary },
              }}
            >
              {tabs.map((tb, i) => (
                <Tab key={i} label={tb.label} icon={tb.icon} iconPosition="start" />
              ))}
            </Tabs>
          </Paper>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {loading ? (
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={28} />
              </Stack>
            ) : (
              renderTabContent()
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
