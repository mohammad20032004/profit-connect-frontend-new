import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Stack, alpha, CircularProgress, Skeleton,
  Tabs, Tab, TextField as MuiTextField, useMediaQuery, Divider, Chip,
} from '@mui/material'
import {
  GroupOutlined, PersonAddOutlined, PersonAddAlt1Outlined,
  SearchOutlined, PeopleAltOutlined, PersonSearchOutlined, RefreshOutlined,
  EmojiEventsOutlined, ChevronRightOutlined, ChevronLeftOutlined, ClearOutlined,
  StarBorderOutlined, InboxOutlined, SentimentDissatisfiedOutlined,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { IconButton } from '@mui/material'
import Button from '@/ui/Button'
import {
  getConnections, getIncomingRequests, getSentRequests,
  sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest,
  cancelConnectionRequest, removeConnection, searchUsers, getMyFollowers, getMyFollowing,
  toggleFollowUser, getDiscoverUsers, getTopUsers,
} from '@/services/networkService'
import { COLORS } from '../components/shared'
import CardGrid from '../components/CardGrid'
import UserCard from '../components/UserCard'
import TopUserCard from '../components/TopUserCard'
import EmptyState from '../components/EmptyState'

function TabSkeleton({ variant = 'grid' }) {
  if (variant === 'list') {
    return (
      <Stack spacing={1.5}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Skeleton variant="circular" width={44} height={44} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="45%" height={20} />
                <Skeleton variant="text" width="65%" height={14} sx={{ mt: 0.25 }} />
              </Box>
              <Skeleton variant="rounded" width={80} height={30} sx={{ borderRadius: 99 }} />
            </Stack>
          </Paper>
        ))}
      </Stack>
    )
  }
  return (
    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Paper key={i} sx={{ p: 2.5, borderRadius: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="55%" height={20} />
                <Skeleton variant="text" width="70%" height={14} sx={{ mt: 0.25 }} />
              </Box>
            </Stack>
            <Skeleton variant="rounded" width={100} height={28} sx={{ borderRadius: 99 }} />
            <Skeleton variant="rounded" width={120} height={28} sx={{ borderRadius: 99 }} />
          </Stack>
        </Paper>
      ))}
    </Box>
  )
}

export default function NetworkView() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const navigate = useNavigate()
  const animationsEnabled = useSelector((s) => s.user.user?.settings?.animationEnabled !== false)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isRTL = i18n.language === 'ar'

  const [tab, setTab] = useState(0)

  // --- Per-tab data & loading states ---
  const [connections, setConnections] = useState([])
  const [connectionsLoading, setConnectionsLoading] = useState(true)

  const [incoming, setIncoming] = useState([])
  const [sent, setSent] = useState([])
  const [requestsLoading, setRequestsLoading] = useState(false)

  const [followers, setFollowers] = useState([])
  const [followersLoading, setFollowersLoading] = useState(false)

  const [following, setFollowing] = useState([])
  const [followingLoading, setFollowingLoading] = useState(false)

  const [discover, setDiscover] = useState([])
  const [discoverLoading, setDiscoverLoading] = useState(false)

  const [topUsers, setTopUsers] = useState([])
  const [topLoading, setTopLoading] = useState(false)
  const topScrollerRef = useRef(null)

  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  // --- Fetch functions per tab ---
  const fetchConnections = useCallback(async () => {
    setConnectionsLoading(true)
    setError('')
    try {
      const res = await getConnections()
      if (res?.success) setConnections(res.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setConnectionsLoading(false)
    }
  }, [t])

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true)
    setError('')
    try {
      const [inc, sentRes] = await Promise.all([getIncomingRequests(), getSentRequests()])
      if (inc?.success) setIncoming(inc.data || [])
      if (sentRes?.success) setSent(sentRes.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setRequestsLoading(false)
    }
  }, [t])

  const fetchFollowers = useCallback(async () => {
    setFollowersLoading(true)
    setError('')
    try {
      const [fol, fw] = await Promise.all([getMyFollowers(), getMyFollowing()])
      if (fol?.success) {
        const followingIds = new Set((fw?.success ? (fw.data || []) : []).map((u) => u._id))
        setFollowers((fol.data || []).map((u) => ({ ...u, isFollowing: u.isFollowing ?? followingIds.has(u._id) })))
      }
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setFollowersLoading(false)
    }
  }, [t])

  const fetchFollowing = useCallback(async () => {
    setFollowingLoading(true)
    setError('')
    try {
      const res = await getMyFollowing()
      if (res?.success) setFollowing((res.data || []).map((u) => ({ ...u, isFollowing: true })))
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setFollowingLoading(false)
    }
  }, [t])

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

  const fetchTopUsers = useCallback(async () => {
    setTopLoading(true)
    try {
      const [res, followingRes] = await Promise.all([getTopUsers(10), getMyFollowing()])
      if (res?.success) {
        const followingIds = new Set((followingRes?.success ? (followingRes.data || []) : []).map((u) => u._id))
        setTopUsers((res.data || []).map((u) => ({ ...u, isFollowing: followingIds.has(u._id) })))
      }
    } catch { /* ignore */ } finally {
      setTopLoading(false)
    }
  }, [])

  // --- Lazy fetch: only fetch when tab is activated ---
  useEffect(() => {
    switch (tab) {
      case 0: fetchConnections(); break
      case 1: fetchRequests(); break
      case 2: fetchDiscover(); fetchTopUsers(); break
      case 3: fetchFollowers(); break
      case 4: fetchFollowing(); break
      default: break
    }
  }, [tab, fetchConnections, fetchRequests, fetchFollowers, fetchFollowing, fetchDiscover, fetchTopUsers])

  // --- Handlers ---
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

  // --- Search ---
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

  // --- Tab config ---
  const tabs = [
    {
      key: 'network',
      label: t('network.myNetwork', 'My Network'),
      shortLabel: t('network.myNetworkShort', 'Network'),
      icon: GroupOutlined,
      loading: connectionsLoading,
      count: connections.length,
    },
    {
      key: 'requests',
      label: t('network.requests', 'Requests'),
      shortLabel: t('network.requestsShort', 'Requests'),
      icon: PersonAddOutlined,
      loading: requestsLoading,
      count: incoming.length,
    },
    {
      key: 'discover',
      label: t('network.discover', 'Discover'),
      shortLabel: t('network.discoverShort', 'Discover'),
      icon: PersonSearchOutlined,
      loading: discoverLoading || topLoading,
    },
    {
      key: 'followers',
      label: t('network.followersTab', 'Followers'),
      shortLabel: t('network.followersShort', 'Followers'),
      icon: PeopleAltOutlined,
      loading: followersLoading,
      count: followers.length,
    },
    {
      key: 'following',
      label: t('network.followingTab', 'Following'),
      shortLabel: t('network.followingShort', 'Following'),
      icon: PersonAddAlt1Outlined,
      loading: followingLoading,
      count: following.length,
    },
  ]

  // --- Scroll helpers ---
  const scrollTopSlider = useCallback((factor) => {
    const el = topScrollerRef.current
    if (el) el.scrollBy({ left: factor * 260, behavior: 'smooth' })
  }, [])

  // --- Tab content renderers ---
  const renderConnections = () => {
    if (connectionsLoading) return <TabSkeleton variant="grid" />
    if (connections.length === 0) {
      return (
        <EmptyState
          icon={<GroupOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
          text={t('network.noConnections', 'No connections yet. Discover people to connect with.')}
          action={<Button variant="contained" onClick={() => setTab(2)}>{t('network.discover', 'Discover')}</Button>}
        />
      )
    }
    return (
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={800}>{t('network.connectionsTitle', 'Your connections')}</Typography>
          <Chip label={connections.length} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(COLORS.primary, 0.08), color: COLORS.primary }} />
        </Stack>
        <CardGrid>
          {connections.map((u) => (
            <UserCard key={u._id} user={u} status="connected" busyId={busyId} t={t} navigate={navigate}
              onRemove={(user) => handleRemove(user._id)} />
          ))}
        </CardGrid>
      </Stack>
    )
  }

  const renderRequests = () => {
    if (requestsLoading) return <TabSkeleton variant="list" />
    return (
      <Stack spacing={2.5}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={800}>{t('network.incomingTitle', 'Pending requests you received')}</Typography>
            {incoming.length > 0 && (
              <Chip label={incoming.length} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(COLORS.success, 0.08), color: COLORS.success }} />
            )}
          </Stack>
          {incoming.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}>
              <InboxOutlined sx={{ fontSize: 36, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
              <Typography variant="body2" color="text.secondary">{t('network.noIncoming', 'No pending requests')}</Typography>
            </Paper>
          ) : (
            <CardGrid grid={false}>
              {incoming.map((r) => (
                <UserCard key={r._id} user={r.requester} busyId={busyId} t={t} navigate={navigate}
                  onAccept={() => handleAccept(r)} onReject={() => handleReject(r)} />
              ))}
            </CardGrid>
          )}
        </Box>
        <Divider />
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={800}>{t('network.sentTitle', 'Requests you sent')}</Typography>
            {sent.length > 0 && (
              <Chip label={sent.length} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(COLORS.warning, 0.08), color: COLORS.warning }} />
            )}
          </Stack>
          {sent.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}>
              <SentimentDissatisfiedOutlined sx={{ fontSize: 36, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />
              <Typography variant="body2" color="text.secondary">{t('network.noSent', 'No sent requests')}</Typography>
            </Paper>
          ) : (
            <CardGrid grid={false}>
              {sent.map((r) => {
                const target = r.recipient?._id ? r.recipient : r.recipient
                return (
                  <UserCard key={r._id} user={target} busyId={busyId} t={t} navigate={navigate}
                    onCancel={() => handleCancel(target?._id)} />
                )
              })}
            </CardGrid>
          )}
        </Box>
      </Stack>
    )
  }

  const renderDiscover = () => {
    const searching = searchQuery.trim().length > 0
    return (
      <Stack spacing={2.5}>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'transparent', boxShadow: 'none', border: 'none' }}>
          <MuiTextField
            fullWidth
            size="small"
            placeholder={t('network.searchPlaceholder', 'Search by name, headline or username...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
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
              <TabSkeleton variant="grid" />
            ) : searchResults.length === 0 ? (
              <EmptyState
                icon={<PersonSearchOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
                text={t('network.noSearchResults', 'No people found for your search.')}
              />
            ) : (
              <>
                <Typography variant="subtitle1" fontWeight={800}>{t('network.searchResults', 'Search results')}</Typography>
                <CardGrid>
                  {searchResults.map((u) => (
                    <UserCard key={u._id} user={u} status={u.connectionStatus || 'none'} following={u.isFollowing}
                      busyId={busyId} t={t} navigate={navigate}
                      onConnect={() => handleConnect(u)} onToggleFollow={() => handleToggleFollow(u)} />
                  ))}
                </CardGrid>
              </>
            )}
          </Stack>
        ) : (
          <>
            {/* Top Users Slider */}
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
              </Stack>

              {topLoading ? (
                <Stack sx={{ alignItems: 'center', justifyContent: 'center', py: 5 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : topUsers.length > 0 ? (
                <Box sx={{ position: 'relative', mx: { xs: 0, md: 3 } }}>
                  <Box
                    ref={topScrollerRef}
                    sx={{
                      display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, pt: 0.5,
                      scrollbarWidth: 'none', scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch',
                      '&::-webkit-scrollbar': { display: 'none', width: 0, height: 0 },
                      '@keyframes cardFadeUp': {
                        from: { opacity: 0, transform: 'translateY(16px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    {topUsers.map((u, i) => (
                      <TopUserCard key={u._id} user={u} rank={i + 1} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate} isRTL={isRTL}
                        sx={animationsEnabled ? { animation: 'cardFadeUp 0.4s ease backwards', animationDelay: `${0.05 + i * 0.08}s` } : undefined}
                        onToggleFollow={() => handleToggleFollow(u)} />
                    ))}
                  </Box>
                  <IconButton size="small" onClick={() => scrollTopSlider(isRTL ? 1 : -1)}
                    sx={{
                      position: 'absolute', top: '50%', insetInlineStart: { xs: -12, md: -20 },
                      transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'background.paper',
                      border: '1px solid', borderColor: 'divider', borderRadius: 1,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)', color: 'text.secondary',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: alpha(COLORS.primary, 0.08), borderColor: alpha(COLORS.primary, 0.35), color: COLORS.primary },
                    }}>
                    <ChevronLeftOutlined sx={{ transform: isRTL ? 'scaleX(-1)' : 'none', fontSize: 20 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => scrollTopSlider(isRTL ? -1 : 1)}
                    sx={{
                      position: 'absolute', top: '50%', insetInlineEnd: { xs: -12, md: -20 },
                      transform: 'translateY(-50%)', zIndex: 2, bgcolor: 'background.paper',
                      border: '1px solid', borderColor: 'divider', borderRadius: 1,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)', color: 'text.secondary',
                      transition: 'all 0.2s ease',
                      '&:hover': { bgcolor: alpha(COLORS.primary, 0.08), borderColor: alpha(COLORS.primary, 0.35), color: COLORS.primary },
                    }}>
                    <ChevronRightOutlined sx={{ transform: isRTL ? 'scaleX(-1)' : 'none', fontSize: 20 }} />
                  </IconButton>
                </Box>
              ) : null}
            </Box>

            <Divider />

            {/* Suggested Users */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <StarBorderOutlined sx={{ fontSize: 20, color: COLORS.warning }} />
                <Typography variant="subtitle1" fontWeight={800}>{t('network.suggestedTitle', 'Suggested for you')}</Typography>
              </Stack>
              <Button size="small" variant="outlined" startIcon={<RefreshOutlined sx={{ fontSize: 15 }} />}
                onClick={fetchDiscover} disabled={discoverLoading} sx={{ fontSize: '0.72rem', textTransform: 'none', borderRadius: 1 }}>
                {t('network.moreSuggestions', 'More suggestions')}
              </Button>
            </Stack>

            {discoverLoading ? (
              <TabSkeleton variant="grid" />
            ) : discover.length === 0 ? (
              <EmptyState
                icon={<PersonSearchOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
                text={t('network.noSuggestions', 'No suggestions right now — try the search above.')}
              />
            ) : (
              <CardGrid>
                {discover.map((u) => (
                  <UserCard key={u._id} user={u} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
                    onToggleFollow={() => handleToggleFollow(u)} />
                ))}
              </CardGrid>
            )}
          </>
        )}
      </Stack>
    )
  }

  const renderFollowers = () => {
    if (followersLoading) return <TabSkeleton variant="grid" />
    if (followers.length === 0) {
      return (
        <EmptyState
          icon={<PeopleAltOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
          text={t('network.noFollowers', 'No followers yet')}
        />
      )
    }
    return (
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={800}>{t('network.followersTitle', 'People following you')}</Typography>
          <Chip label={followers.length} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(COLORS.primary, 0.08), color: COLORS.primary }} />
        </Stack>
        <CardGrid>
          {followers.map((u) => (
            <UserCard key={u._id} user={u} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
              onToggleFollow={() => handleToggleFollow(u)} />
          ))}
        </CardGrid>
      </Stack>
    )
  }

  const renderFollowing = () => {
    if (followingLoading) return <TabSkeleton variant="grid" />
    if (following.length === 0) {
      return (
        <EmptyState
          icon={<PersonAddAlt1Outlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
          text={t('network.noFollowing', 'You are not following anyone yet')}
        />
      )
    }
    return (
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={800}>{t('network.followingTitle', 'People you follow')}</Typography>
          <Chip label={following.length} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(COLORS.success, 0.08), color: COLORS.success }} />
        </Stack>
        <CardGrid>
          {following.map((u) => (
            <UserCard key={u._id} user={u} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
              onToggleFollow={() => handleToggleFollow(u)} />
          ))}
        </CardGrid>
      </Stack>
    )
  }

  const renderTabContent = () => {
    switch (tab) {
      case 0: return renderConnections()
      case 1: return renderRequests()
      case 2: return renderDiscover()
      case 3: return renderFollowers()
      case 4: return renderFollowing()
      default: return null
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1500, mx: 'auto' }}>
        {error && (
          <Typography variant="body2" color="error.main" sx={{ p: 1.5, borderRadius: 0.5, bgcolor: alpha(COLORS.error, 0.08), textAlign: 'center', fontWeight: 600, mb: 2 }}>
            {error}
          </Typography>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'flex-start' }}>
          {/* Vertical Tabs Sidebar */}
          <Paper variant="outlined" sx={{
            width: { xs: '100%', md: 240, lg: 270 }, flexShrink: 0,
            position: { md: 'sticky' }, top: { md: 88 }, alignSelf: 'flex-start', zIndex: 2,
            p: { xs: 1, md: 1.25 }, borderRadius: 1,
          }}>
            <Tabs
              orientation={isMobile ? 'horizontal' : 'vertical'}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
              value={tab}
              onChange={(_, v) => setTab(v)}
              TabIndicatorProps={!isMobile ? {
                sx: { left: 0, width: 3, borderRadius: '0 3px 3px 0', bgcolor: COLORS.primary },
              } : undefined}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none', fontWeight: 700, minHeight: 48,
                  justifyContent: { md: 'flex-start' }, alignItems: 'center', gap: 1,
                  borderRadius: 1, mx: { md: 0.5 }, px: { md: 1.5 },
                  transition: 'all 0.2s ease',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: alpha(COLORS.primary, 0.04), color: COLORS.primary },
                  '&.Mui-selected': {
                    color: COLORS.primary,
                    bgcolor: alpha(COLORS.primary, 0.06),
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: COLORS.primary,
                  borderRadius: '0 3px 3px 0',
                  width: 3,
                },
              }}
            >
              {tabs.map((tb, i) => {
                const Icon = tb.icon
                const isActive = tab === i
                return (
                  <Tab
                    key={tb.key}
                    label={
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                        <Icon sx={{ fontSize: 20 }} />
                        <Box sx={{ flex: 1, textAlign: 'start' }}>
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem', display: { xs: 'none', sm: 'block' } }}>
                            {tb.label}
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.85rem', display: { sm: 'none' } }}>
                            {tb.shortLabel}
                          </Typography>
                        </Box>
                        {tb.count > 0 && (
                          <Chip
                            label={tb.count}
                            size="small"
                            sx={{
                              height: 20, minWidth: 20, fontSize: '0.65rem', fontWeight: 700,
                              bgcolor: isActive ? alpha(COLORS.primary, 0.15) : alpha(COLORS.primary, 0.06),
                              color: isActive ? COLORS.primary : 'text.secondary',
                              '& .MuiChip-label': { px: 0.75 },
                            }}
                          />
                        )}
                        {tb.loading && (
                          <CircularProgress size={14} sx={{ color: COLORS.primary }} />
                        )}
                      </Stack>
                    }
                  />
                )
              })}
            </Tabs>
          </Paper>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {animationsEnabled ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            ) : (
              renderTabContent()
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
