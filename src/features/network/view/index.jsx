import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Paper, Typography, Stack, alpha, Skeleton,
  Divider, Chip, useMediaQuery, Avatar, TextField as MuiTextField,
} from '@mui/material'
import {
  PersonAddOutlined, PersonAddAlt1Outlined, GroupOutlined,
  SearchOutlined, PeopleAltOutlined, PersonSearchOutlined, RefreshOutlined,
  EmojiEventsOutlined, ChevronRightOutlined, ChevronLeftOutlined, ClearOutlined,
  StarBorderOutlined, InboxOutlined, SendOutlined, LocationOnOutlined,
  WorkOutlineOutlined, PersonOffOutlined, CheckOutlined, EmailOutlined,
  LanguageOutlined, BusinessCenterOutlined, BadgeOutlined, LinkedIn, GitHub,
} from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/ui/Button'
import {
  getConnections, getIncomingRequests, getSentRequests,
  sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest,
  cancelConnectionRequest, removeConnection, searchUsers, getMyFollowers, getMyFollowing,
  toggleFollowUser, getDiscoverUsers, getTopUsers,
} from '@/services/networkService'
import { COLORS, fullName } from '../components/shared'
import { resolveMediaPath, getUserById } from '@/services/profile'
import CardGrid from '../components/CardGrid'
import ProfileCard from '../components/ProfileCard'
import UserCard from '../components/UserCard'
import TopUserCard from '../components/TopUserCard'
import EmptyState from '../components/EmptyState'
import NetworkSidebar from '../components/NetworkSidebar'

const TAB_REQUESTS = 0
const TAB_CONNECTIONS = 1
const TAB_FOLLOWERS = 2
const TAB_FOLLOWING = 3
const TAB_SUGGESTIONS = 4
const TAB_SENT = 5

function ProfileCardSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper key={i} sx={{ flex: { xs: '0 0 100%', sm: '0 0 240px' }, maxWidth: { xs: '100%', sm: 250 }, minWidth: { xs: 0, sm: 200 }, borderRadius: 1.5, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" sx={{ width: '100%', paddingTop: '66.7%' }} />
          <Box sx={{ p: 1.25 }}>
            <Skeleton variant="text" width="60%" height={18} />
            <Skeleton variant="text" width="80%" height={12} />
            <Skeleton variant="rounded" width="100%" height={28} sx={{ mt: 1.25, borderRadius: 1 }} />
            <Skeleton variant="rounded" width="100%" height={28} sx={{ mt: 0.6, borderRadius: 1 }} />
          </Box>
        </Paper>
      ))}
    </Box>
  )
}

function ListSkeleton() {
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

function StatBox({ value, label }) {
  return (
    <Box sx={{ textAlign: 'center', px: 2.5, py: 1.25, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderRadius: 1.5, minWidth: 92 }} aria-label={`${value} ${label}`}>
      <Typography variant="h6" fontWeight={800}>{value ?? 0}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
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

  const [tab, setTab] = useState(TAB_REQUESTS)
  const [followingExpanded, setFollowingExpanded] = useState(false)

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

  const [selectedFollowing, setSelectedFollowing] = useState(null)
  const [previewUser, setPreviewUser] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

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
    const timer = setTimeout(() => {
      switch (tab) {
        case TAB_REQUESTS: fetchRequests(); fetchDiscover(); break
        case TAB_CONNECTIONS: fetchConnections(); break
        case TAB_FOLLOWERS: fetchFollowers(); break
        case TAB_FOLLOWING: fetchFollowing(); break
        case TAB_SUGGESTIONS: fetchDiscover(); fetchTopUsers(); break
        case TAB_SENT: fetchRequests(); break
        default: break
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [tab, fetchConnections, fetchRequests, fetchFollowers, fetchFollowing, fetchDiscover, fetchTopUsers])

  // --- Tab change: expand sidebar when entering "following", collapse otherwise ---
  const handleTabChange = useCallback((next) => {
    setTab(next)
    setFollowingExpanded(next === TAB_FOLLOWING && !isMobile)
  }, [isMobile])

  // --- Following preview (Facebook-style) ---
  const loadFollowingPreview = useCallback(async (userId) => {
    setSelectedFollowing(userId)
    setPreviewLoading(true)
    try {
      const res = await getUserById(userId)
      if (res?.success) {
        const known = following.find((u) => (u._id || u.id) === userId)
        const data = res.data || null
        const normalized = data ? { ...data, id: data.id || data._id, _id: data.id || data._id } : null
        setPreviewUser(normalized ? { ...normalized, isFollowing: known ? true : !!(normalized?.isFollowing || normalized?.profile?.isFollowing) } : null)
      } else {
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setPreviewLoading(false)
    }
  }, [t, following])

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
    setPreviewUser((prev) => (prev?._id === id ? { ...prev, isFollowing: next } : prev))
  }

  const handleToggleFollow = async (user) => {
    const uid = user?._id || user?.id
    setBusyId(uid)
    setError('')
    const prev = !!user.isFollowing
    setFollowing((fl) => (prev ? fl.filter((u) => (u._id || u.id) !== uid) : fl))
    applyFollowing(uid, !prev)
    try {
      const res = await toggleFollowUser(uid)
      if (res && 'following' in res) {
        applyFollowing(uid, !!res.following)
        if (res.following) fetchFollowing()
      } else {
        applyFollowing(uid, prev)
        setError(res?.message || t('common.error'))
      }
    } catch (err) {
      if (prev) setFollowing((fl) => [...fl, user])
      applyFollowing(uid, prev)
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setBusyId(null)
    }
  }

  // --- Search ---
  useEffect(() => {
    const q = searchQuery.trim()
    const timer = setTimeout(() => {
      if (!q) {
        setSearchResults([])
        setSearchLoading(false)
        return
      }
      setSearchLoading(true)
      setError('')
      searchUsers(q)
        .then((res) => {
          if (res?.success) setSearchResults(res.data || [])
          else setError(res?.message || t('common.error'))
        })
        .catch((err) => {
          setError(err?.response?.data?.message || err.message || t('common.error'))
        })
        .finally(() => setSearchLoading(false))
    }, q ? 350 : 0)
    return () => clearTimeout(timer)
  }, [searchQuery, t])

  // --- Tab config ---
  const tabs = [
    {
      key: 'requests',
      label: t('network.requestsLabel', 'طلبات الاتصال'),
      icon: PersonAddOutlined,
      loading: requestsLoading,
      count: incoming.length,
    },
    {
      key: 'connections',
      label: t('network.connectionsLabel', 'جهات الاتصال'),
      icon: GroupOutlined,
      loading: connectionsLoading,
      count: connections.length,
    },
    {
      key: 'followers',
      label: t('network.followersTab', 'المتابعون'),
      icon: PeopleAltOutlined,
      loading: followersLoading,
      count: followers.length,
    },
    {
      key: 'following',
      label: t('network.followingTab', 'المتابَعون'),
      icon: PersonAddAlt1Outlined,
      loading: followingLoading,
      count: following.length,
    },
    {
      key: 'suggestions',
      label: t('network.suggestionsLabel', 'الاقتراحات'),
      icon: PersonSearchOutlined,
      loading: discoverLoading || topLoading,
    },
    {
      key: 'sent',
      label: t('network.sentLabel', 'الطلبات المرسلة'),
      icon: SendOutlined,
      loading: requestsLoading,
      count: sent.length,
    },
  ]

  // --- Scroll helpers ---
  const scrollTopSlider = useCallback((factor) => {
    const el = topScrollerRef.current
    if (el) el.scrollBy({ left: factor * 260, behavior: 'smooth' })
  }, [])

  // --- Section header ---
  const SectionHeader = ({ icon, title, subtitle, extra }) => (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
        {icon}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {extra}
    </Stack>
  )

  // --- Tab content renderers ---
  const renderRequests = () => (
    <Stack spacing={2.5}>
      <Box sx={{ px: 0.5, pt: 0.5 }}>
        <Typography variant="h5" fontWeight={800}>
          {t('network.requestsLabel', 'طلبات الاتصال')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {t('network.incomingTitle', 'طلبات اتصال واردة بانتظار ردّك')}
        </Typography>
      </Box>

      {requestsLoading ? (
        <ProfileCardSkeleton />
      ) : incoming.length === 0 ? (
        <EmptyState
          icon={<InboxOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
          text={t('network.noIncoming', 'لا توجد طلبات واردة')}
        />
      ) : (
        <CardGrid wrap>
          {incoming.map((r) => (
            <ProfileCard key={r._id} user={r.requester} variant="request" busyId={busyId} t={t} navigate={navigate}
              onAccept={() => handleAccept(r)} onReject={() => handleReject(r)} />
          ))}
        </CardGrid>
      )}

      <Divider />

      {/* Suggestions */}
      <SectionHeader
        icon={<StarBorderOutlined sx={{ fontSize: 22, color: COLORS.warning, flexShrink: 0 }} />}
        title={t('network.suggestedTitle', 'مقترح لك')}
        subtitle={t('network.noSuggestions', 'اقتراحات مخصصة لتوسيع شبكتك')}
        extra={
          <Button size="small" variant="outlined" startIcon={<RefreshOutlined sx={{ fontSize: 15 }} />}
            onClick={fetchDiscover} disabled={discoverLoading} sx={{ fontSize: '0.72rem', textTransform: 'none', borderRadius: 1, flexShrink: 0 }}>
            {t('network.moreSuggestions', 'اقتراحات أكثر')}
          </Button>
        }
      />

      {discoverLoading ? (
        <ProfileCardSkeleton />
      ) : discover.length === 0 ? (
        <EmptyState
          icon={<PersonSearchOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
          text={t('network.noSuggestions', 'لا توجد اقتراحات حالياً — جرّب البحث بالأعلى.')}
        />
      ) : (
<CardGrid wrap>
          {discover.map((u) => (
            <ProfileCard key={u._id} user={u} variant="default" status={u.connectionStatus || 'none'} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
              onConnect={() => handleConnect(u)} onToggleFollow={() => handleToggleFollow(u)} />
          ))}
        </CardGrid>
      )}
      </Stack>
  )

  const renderConnections = () => {
    if (connectionsLoading) return <ProfileCardSkeleton />
    if (connections.length === 0) {
      return (
        <EmptyState
          icon={<GroupOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
          text={t('network.noConnections', 'لا توجد جهات اتصال بعد. اكتشف أشخاصاً للتواصل معهم.')}
          action={<Button variant="contained" onClick={() => handleTabChange(TAB_SUGGESTIONS)}>{t('network.suggestionsLabel', 'الاقتراحات')}</Button>}
        />
      )
    }
    return (
      <Stack spacing={1.5}>
        <SectionHeader
          icon={<GroupOutlined sx={{ fontSize: 22, color: COLORS.primary, flexShrink: 0 }} />}
          title={t('network.connectionsTitle', 'جهات الاتصال الخاصة بك')}
          subtitle={t('network.connectionsSubtitle', 'الأشخاص المتصلون بك')}
          extra={<Chip label={connections.length} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(COLORS.primary, 0.08), color: COLORS.primary, flexShrink: 0 }} />}
        />
        <CardGrid wrap>
          {connections.map((u) => (
            <ProfileCard key={u._id} user={u} variant="default" busyId={busyId} t={t} navigate={navigate}
              onRemove={(user) => handleRemove(user._id)} />
          ))}
        </CardGrid>
      </Stack>
    )
  }

  const renderFollowers = () => {
    if (followersLoading) return <ProfileCardSkeleton />
    if (followers.length === 0) {
      return (
        <EmptyState
          icon={<PeopleAltOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
          text={t('network.noFollowers', 'لا يوجد متابعون بعد')}
        />
      )
    }
    return (
      <Stack spacing={1.5}>
        <SectionHeader
          icon={<PeopleAltOutlined sx={{ fontSize: 22, color: COLORS.primary, flexShrink: 0 }} />}
          title={t('network.followersTitle', 'الأشخاص الذين يتابعونك')}
          subtitle={t('network.followersSubtitle', 'تابعهم لأبقي شبكتك قريبة')}
          extra={<Chip label={followers.length} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha(COLORS.primary, 0.08), color: COLORS.primary, flexShrink: 0 }} />}
        />
        <CardGrid wrap>
          {followers.map((u) => (
            <ProfileCard key={u._id} user={u} variant="default" following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
              onToggleFollow={() => handleToggleFollow(u)} />
          ))}
        </CardGrid>
      </Stack>
    )
  }

  const renderFollowing = () => {
    const profile = previewUser?.profile || {}
    const professional = previewUser?.professional || {}
    const employer = previewUser?.employerProfile || {}
    const companyEmployee = previewUser?.companyEmployeeProfile || {}
    const socialLinks = profile.socialLinks || {}
    const avatarSrc = resolveMediaPath(profile.avatar)
    const name = fullName(previewUser) || profile.fullname || ''
    const username = previewUser?.username
    const email = previewUser?.email
    const rawLocation = employer.companyLocation || profile.location || ''
    const location = typeof rawLocation === 'string'
      ? rawLocation
      : [rawLocation?.city, rawLocation?.name, rawLocation?.address, rawLocation?.formattedAddress]
          .filter(Boolean)
          .join(', ')
          || ''
    const roleLabel = previewUser?.role ? t(`network.roles.${previewUser.role}`, previewUser.role) : ''
    const years = professional.yearsOfExperience
    const skills = professional.skills || []
    const rScore = profile.rScore
    const isPreviewFollowing = !!previewUser?.isFollowing
    const uid = previewUser?.id || previewUser?._id
    const toUrl = (v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v)
    const openSelectedProfile = () => {
      if (uid) navigate(`/user-profile/${uid}`)
    }

    let body
    if (previewLoading) {
      body = (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" sx={{ height: 170, width: '100%' }} />
          <Box sx={{ px: 3, pb: 3 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
              <Skeleton variant="circular" width={110} height={110} sx={{ mt: -6 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="text" width="55%" height={16} />
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
              <Skeleton variant="rounded" width={90} height={48} sx={{ borderRadius: 1.5 }} />
              <Skeleton variant="rounded" width={90} height={48} sx={{ borderRadius: 1.5 }} />
              <Skeleton variant="rounded" width={90} height={48} sx={{ borderRadius: 1.5 }} />
            </Stack>
          </Box>
        </Paper>
      )
    } else if (previewUser) {
      const social = [
        socialLinks.linkedin && { key: 'linkedin', icon: <LinkedIn sx={{ fontSize: 18 }} />, href: toUrl(socialLinks.linkedin), label: 'LinkedIn' },
        socialLinks.github && { key: 'github', icon: <GitHub sx={{ fontSize: 18 }} />, href: toUrl(socialLinks.github), label: 'GitHub' },
        socialLinks.website && { key: 'website', icon: <LanguageOutlined sx={{ fontSize: 18 }} />, href: toUrl(socialLinks.website), label: t('network.previewWebsite', 'الموقع الإلكتروني') },
      ].filter(Boolean)
      const perms = companyEmployee.permissions || {}

      body = (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {/* Banner */}
          <Box sx={{ position: 'relative', height: 170, bgcolor: alpha(COLORS.primary, 0.08) }}>
            {avatarSrc && (
              <Box
                component="img"
                src={avatarSrc}
                alt={name}
                sx={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', filter: 'blur(14px)', transform: 'scale(1.15)', opacity: 0.55,
                }}
              />
            )}
            <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${alpha(COLORS.primary, 0.04)}, ${alpha(COLORS.primary, 0.14)})` }} />
          </Box>

          <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
            {/* Identity row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'center', sm: 'flex-end' } }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 110, height: 110, mt: -6, flexShrink: 0,
                  border: '4px solid', borderColor: 'background.paper',
                  bgcolor: alpha(COLORS.primary, 0.12), color: COLORS.primary,
                  fontSize: '2.4rem', fontWeight: 800, boxShadow: 4,
                }}
              >
                {name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', sm: 'start' } }}>
                <Typography variant="h5" fontWeight={800}>{name}</Typography>
                {username && (
                  <Typography variant="body2" color="text.secondary">
                    {t('network.previewUsername', '@{{username}}', { username })}
                  </Typography>
                )}
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75, mt: 0.75, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  {roleLabel && (
                    <Chip label={roleLabel} size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }} />
                  )}
                  {email && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                      <EmailOutlined sx={{ fontSize: 14, color: COLORS.primary }} />
                      {email}
                    </Typography>
                  )}
                  {location && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                      <LocationOnOutlined sx={{ fontSize: 14 }} />
                      {location}
                    </Typography>
                  )}
                  {years != null && years > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
                      <WorkOutlineOutlined sx={{ fontSize: 14 }} />
                      {t('network.previewYears', '{{count}} سنة خبرة', { count: years })}
                    </Typography>
                  )}
                </Stack>
              </Box>
              <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1} sx={{ flexShrink: 0 }}>
                <Button variant="contained" size="small" onClick={openSelectedProfile} sx={{ borderRadius: 1, px: 2, py: 0.75, fontSize: '0.78rem' }}>
                  {t('network.viewProfile', 'عرض الملف الشخصي')}
                </Button>
                <Button
                  variant={isPreviewFollowing ? 'outlined' : 'contained'}
                  color={isPreviewFollowing ? 'error' : 'primary'}
                  size="small"
                  startIcon={isPreviewFollowing ? <PersonOffOutlined sx={{ fontSize: 15 }} /> : <CheckOutlined sx={{ fontSize: 15 }} />}
                  onClick={() => handleToggleFollow(previewUser)}
                  disabled={busyId === uid}
                  sx={{ borderRadius: 1, px: 1.5, py: 0.75, fontSize: '0.78rem' }}
                >
                  {isPreviewFollowing ? t('network.unfollow', 'إلغاء المتابعة') : t('network.follow', 'متابعة')}
                </Button>
              </Stack>
            </Stack>

            {/* Stats */}
            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, flexWrap: 'wrap', gap: 1.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <StatBox value={profile.postsCount} label={t('profile.posts', 'منشورات')} />
              <StatBox value={profile.followersCount} label={t('profile.followers', 'المتابعون')} />
              <StatBox value={profile.followingCount} label={t('profile.following', 'يتابع')} />
              <StatBox value={rScore} label={t('network.previewRScore', 'السمعة')} />
              <StatBox value={profile.portfolioCount} label={t('network.previewPortfolioCount', 'الأعمال')} />
            </Stack>

            {/* Employer info */}
            {employer.companyName && (
              <Paper variant="outlined" sx={{ mt: 2.5, p: 2, borderRadius: 1.5, bgcolor: alpha(COLORS.primary, 0.02) }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <BusinessCenterOutlined sx={{ fontSize: 20, color: COLORS.primary }} />
                  <Typography variant="subtitle1" fontWeight={800}>
                    {t('network.previewCompany', 'الشركة')}: {employer.companyName}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {employer.industry && (
                    <Chip label={`${t('network.previewIndustry', 'القطاع')}: ${employer.industry}`} size="small" sx={{ height: 24, fontSize: '0.7rem', borderRadius: 0.75 }} />
                  )}
                  {employer.companySize && (
                    <Chip label={`${t('network.previewCompanySize', 'حجم الشركة')}: ${employer.companySize}`} size="small" sx={{ height: 24, fontSize: '0.7rem', borderRadius: 0.75 }} />
                  )}
                  {employer.foundedYear && (
                    <Chip label={t('network.previewFoundedYear', 'تأسست سنة {{year}}', { year: employer.foundedYear })} size="small" sx={{ height: 24, fontSize: '0.7rem', borderRadius: 0.75 }} />
                  )}
                  {employer.website && (
                    <Chip
                      label={<Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.4 }}><LanguageOutlined sx={{ fontSize: 13 }} />{t('network.previewWebsite', 'الموقع الإلكتروني')}</Box>}
                      size="small"
                      component="a"
                      href={toUrl(employer.website)}
                      target="_blank"
                      rel="noreferrer"
                      clickable
                      sx={{ height: 24, fontSize: '0.7rem', borderRadius: 0.75, textDecoration: 'none' }}
                    />
                  )}
                </Stack>
                {employer.companyDescription && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {t('network.previewCompanyDescription', 'عن الشركة')}: {employer.companyDescription}
                  </Typography>
                )}
              </Paper>
            )}

            {/* Company employee info */}
            {previewUser.role === 'CompanyEmployee' && (
              <Paper variant="outlined" sx={{ mt: 2.5, p: 2, borderRadius: 1.5, bgcolor: alpha(COLORS.primary, 0.02) }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <BadgeOutlined sx={{ fontSize: 20, color: COLORS.primary }} />
                  <Typography variant="subtitle1" fontWeight={800}>
                    {t('network.previewPosition', 'المنصب')}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {companyEmployee.position ? (
                    <Chip label={companyEmployee.position} size="small" color="primary" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">{t('network.previewPosition', 'المنصب')}: —</Typography>
                  )}
                  {perms.canPostJobs && <Chip icon={<CheckOutlined sx={{ fontSize: 13 }} />} label={t('network.previewCanPostJobs', 'نشر الوظائف')} size="small" color="success" variant="outlined" sx={{ height: 24, fontSize: '0.68rem' }} />}
                  {perms.canManageApplicants && <Chip icon={<CheckOutlined sx={{ fontSize: 13 }} />} label={t('network.previewCanManageApplicants', 'إدارة المتقدمين')} size="small" color="success" variant="outlined" sx={{ height: 24, fontSize: '0.68rem' }} />}
                  {perms.canViewAnalytics && <Chip icon={<CheckOutlined sx={{ fontSize: 13 }} />} label={t('network.previewCanViewAnalytics', 'عرض التحليلات')} size="small" color="success" variant="outlined" sx={{ height: 24, fontSize: '0.68rem' }} />}
                </Stack>
              </Paper>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>{t('network.previewSkills', 'المهارات')}</Typography>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                  {skills.slice(0, 10).map((s) => (
                    <Chip key={s} label={s} size="small" sx={{ height: 24, fontSize: '0.7rem', borderRadius: 0.75, bgcolor: alpha(COLORS.primary, 0.05) }} />
                  ))}
                </Stack>
              </>
            )}

            {/* Social links */}
            {social.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 2, mb: 1 }}>{t('network.previewSocialLinks', 'روابط التواصل')}</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {social.map((s) => (
                    <Button key={s.key} size="small" variant="outlined" component="a" href={s.href} target="_blank" rel="noreferrer"
                      startIcon={s.icon} sx={{ borderRadius: 1, px: 1.5, py: 0.6, fontSize: '0.72rem', textTransform: 'none' }}>
                      {s.label}
                    </Button>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </Paper>
      )
    } else {
      body = (
        <Paper sx={{
          py: 8, px: 3, textAlign: 'center', borderRadius: 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 420, borderStyle: 'dashed', bgcolor: 'transparent',
        }}>
          <PeopleAltOutlined sx={{ fontSize: 56, color: alpha(theme.palette.text.disabled, 0.3), mb: 1.5 }} />
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {t('network.selectPersonHint', 'حدد أسماء الأشخاص لمعاينة ملفهم الشخصي')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('network.selectPersonHintSub', 'اختر اسماً من القائمة الجانبية لعرض ملفه الشخصي')}
          </Typography>
        </Paper>
      )
    }

    if (isMobile) {
      return (
        <Stack spacing={2.5}>
          <Box sx={{ px: 0.5, pt: 0.5 }}>
            <Typography variant="h5" fontWeight={800}>
              {t('network.followingTitle', 'الأشخاص الذين تتابعهم')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {t('network.followingListHint', 'اختر اسماً لعرض ملفه الشخصي')}
            </Typography>
          </Box>
          {followingLoading ? (
            <ListSkeleton />
          ) : (
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {following.map((u) => {
                const uname = fullName(u)
                const active = selectedFollowing === u._id
                return (
                  <Box key={u._id} onClick={() => loadFollowingPreview(u._id)}
                    sx={{
                      flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                      p: 1.25, bgcolor: active ? alpha(COLORS.primary, 0.08) : 'background.paper',
                      border: '1px solid', borderColor: active ? alpha(COLORS.primary, 0.4) : 'divider',
                      borderRadius: 1.5, cursor: 'pointer', transition: 'all 0.2s ease',
                      '&:hover': { borderColor: alpha(COLORS.primary, 0.3), boxShadow: '0 4px 14px rgba(31,10,59,0.08)' },
                    }}>
                    <Avatar
                      src={resolveMediaPath(u?.profile?.avatar)}
                      sx={{ width: 56, height: 56, bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: 700 }}
                    >
                      {uname?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 90 }}>{uname}</Typography>
                  </Box>
                )
              })}
            </Box>
          )}
          {body}
        </Stack>
      )
    }
    return body
  }

  const renderSuggestions = () => {
    const searching = searchQuery.trim().length > 0
    return (
      <Stack spacing={2.5}>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1.5 }}>
          <MuiTextField
            fullWidth
            size="small"
            placeholder={t('network.searchPlaceholder', 'ابحث بالاسم أو المسمى أو اسم المستخدم...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            inputProps={{ role: 'searchbox', 'aria-label': t('network.searchPlaceholder', 'ابحث بالاسم أو المسمى أو اسم المستخدم...') }}
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
              <ProfileCardSkeleton />
            ) : searchResults.length === 0 ? (
              <EmptyState
                icon={<PersonSearchOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
                text={t('network.noSearchResults', 'لا يوجد أشخاص مطابقون لبحثك.')}
              />
            ) : (
              <>
                <Typography variant="subtitle1" fontWeight={800}>{t('network.searchResults', 'نتائج البحث')}</Typography>
                <CardGrid wrap>
                  {searchResults.map((u) => (
                    <ProfileCard key={u._id} user={u} variant="default" status={u.connectionStatus || 'none'} following={u.isFollowing}
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
              <SectionHeader
                icon={<EmojiEventsOutlined sx={{ fontSize: 24, color: COLORS.warning, flexShrink: 0 }} />}
                title={t('network.topUsersTitle', 'الأكثر نشاطاً على المنصة')}
                subtitle={t('network.topUsersSubtitle', 'الأعضاء الأعلى تقييماً، مرتبين حسب درجة السمعة')}
              />

              {topLoading ? (
                <Box sx={{ display: 'flex', gap: 1.5, overflow: 'hidden', py: 0.5 }}>
                  {[1, 2, 3].map(i => (
                    <Paper key={i} sx={{ flex: '0 0 240px', borderRadius: 2, overflow: 'hidden' }}>
                      <Skeleton variant="rectangular" height={140} />
                      <Box sx={{ p: 1.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={16} />
                            <Skeleton variant="text" width="40%" height={12} />
                          </Box>
                        </Stack>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : topUsers.length > 0 ? (
                <Box sx={{ position: 'relative', mx: { xs: 0, md: 3 } }}>
                  <Box
                    ref={topScrollerRef}
                    sx={{
                      display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, pt: 0.5,
                      scrollbarWidth: 'thin', scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch',
                      '&::-webkit-scrollbar': { height: 4 },
                      '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: 2 },
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
                  <IconButton size="small" aria-label="Scroll left" onClick={() => scrollTopSlider(isRTL ? 1 : -1)}
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
                  <IconButton size="small" aria-label="Scroll right" onClick={() => scrollTopSlider(isRTL ? -1 : 1)}
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

            <SectionHeader
              icon={<StarBorderOutlined sx={{ fontSize: 22, color: COLORS.warning, flexShrink: 0 }} />}
              title={t('network.suggestedTitle', 'مقترح لك')}
              extra={
                <Button size="small" variant="outlined" startIcon={<RefreshOutlined sx={{ fontSize: 15 }} />}
                  onClick={fetchDiscover} disabled={discoverLoading} sx={{ fontSize: '0.72rem', textTransform: 'none', borderRadius: 1, flexShrink: 0 }}>
                  {t('network.moreSuggestions', 'اقتراحات أكثر')}
                </Button>
              }
            />

            {discoverLoading ? (
              <ProfileCardSkeleton />
            ) : discover.length === 0 ? (
              <EmptyState
                icon={<PersonSearchOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
                text={t('network.noSuggestions', 'لا توجد اقتراحات حالياً — جرّب البحث بالأعلى.')}
              />
            ) : (
              <CardGrid wrap>
                {discover.map((u) => (
                  <ProfileCard key={u._id} user={u} variant="default" status={u.connectionStatus || 'none'} following={u.isFollowing} busyId={busyId} t={t} navigate={navigate}
                    onConnect={() => handleConnect(u)} onToggleFollow={() => handleToggleFollow(u)} />
                ))}
              </CardGrid>
            )}
          </>
        )}
      </Stack>
    )
  }

  const renderSent = () => {
    if (requestsLoading) return <ListSkeleton />
    return (
      <Stack spacing={1.5}>
        <Box sx={{ px: 0.5, pt: 0.5 }}>
          <Typography variant="h5" fontWeight={800}>
            {t('network.sentTitle', 'الطلبات التي أرسلتها')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {t('network.sentSubtitle', 'بانتظار قبول أو رفض الطرف الآخر')}
          </Typography>
        </Box>
        {sent.length === 0 ? (
          <EmptyState
            icon={<SendOutlined sx={{ fontSize: 48, color: alpha(theme.palette.text.disabled, 0.3), mb: 1 }} />}
            text={t('network.noSent', 'لا توجد طلبات مرسلة')}
          />
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
      </Stack>
    )
  }

  const renderTabContent = () => {
    switch (tab) {
      case TAB_REQUESTS: return renderRequests()
      case TAB_CONNECTIONS: return renderConnections()
      case TAB_FOLLOWERS: return renderFollowers()
      case TAB_FOLLOWING: return renderFollowing()
      case TAB_SUGGESTIONS: return renderSuggestions()
      case TAB_SENT: return renderSent()
      default: return null
    }
  }

  const renderMobileTabs = () => (
    <Box
      role="tablist"
      sx={{
        display: 'flex', gap: 0.75, overflowX: 'auto', pb: 1, mb: 2,
        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {tabs.map((tb, i) => {
        const Icon = tb.icon
        const active = tab === i
        return (
          <Box key={tb.key} onClick={() => handleTabChange(i)}
            role="tab"
            aria-selected={active}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTabChange(i); } }}
            sx={{
              flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 0.75,
              px: 1.25, py: 0.75, borderRadius: 99, cursor: 'pointer', userSelect: 'none',
              transition: 'all 0.15s ease', border: '1px solid',
              borderColor: active ? alpha(COLORS.primary, 0.4) : 'divider',
              bgcolor: active ? alpha(COLORS.primary, 0.08) : 'background.paper',
            }}>
            <Icon sx={{ fontSize: 17, color: active ? COLORS.primary : 'text.secondary' }} />
            <Typography variant="body2" fontWeight={active ? 700 : 600} sx={{ whiteSpace: 'nowrap' }}>
              {tb.label}
            </Typography>
            {tb.count > 0 && (
              <Chip label={tb.count} size="small" sx={{ height: 18, minWidth: 18, fontSize: '0.6rem', fontWeight: 700, '& .MuiChip-label': { px: 0.6 } }} />
            )}
          </Box>
        )
      })}
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{  maxWidth: 1500, mx: 'auto' }}>
        {error && (
          <Typography variant="body2" color="error.main" role="alert" sx={{ p: 1.5, borderRadius: 0.5, bgcolor: alpha(COLORS.error, 0.08), textAlign: 'center', fontWeight: 600, mb: 2 }}>
            {error}
          </Typography>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ alignItems: 'flex-start' }}>
          {isMobile ? (
            <Box sx={{ width: '100%' }}>
              {renderMobileTabs()}
            </Box>
          ) : (
            <Box
              sx={{
                width: followingExpanded ? 300 : 260,
                flexShrink: 0,
                position: 'sticky',
                top: 40,
                height: 'calc(100vh - 88px)',
                alignSelf: 'flex-start',
                zIndex: 2,
                transition: 'width 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <NetworkSidebar
                tabs={tabs}
                tab={tab}
                onTabChange={handleTabChange}
                expanded={followingExpanded}
                onToggleExpanded={() => setFollowingExpanded(false)}
                following={following}
                followingLoading={followingLoading}
                onSelectUser={loadFollowingPreview}
                selectedId={selectedFollowing}
                t={t}
              />
            </Box>
          )}

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {animationsEnabled ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${tab}-${followingExpanded}`}
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