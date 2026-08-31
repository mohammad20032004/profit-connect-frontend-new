import { BRAND, RADIUS } from '@/theme/tokens'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Container, Box, Paper, Avatar, Typography, Stack, CircularProgress, Chip, IconButton, Menu, MenuItem, ListItemIcon, Divider, alpha, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip } from '@mui/material'
import Button from '@/ui/Button'
import {
  EditOutlined,
  DeleteOutlined,
  ContentCopyOutlined,
  FavoriteBorderRounded,
  FavoriteRounded,
  VisibilityOutlined,
  LockOutlined,
  StarRounded,
  FolderOpenOutlined,
  CloseRounded,
  ErrorOutlined,
  LanguageOutlined,
  PlayCircleRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  PauseRounded,
  PlayArrowRounded,
  FullscreenRounded,
  CalendarTodayOutlined,
  ScheduleOutlined,
  WorkOutlineOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { getPortfolioItemById, likePortfolioItem, deletePortfolioItem, getMyCollections } from '@/services/portfolioService'
import { resolveMediaPath } from '@/services/profile'
import { getItemMedia, getItemOwnerInfo, getItemUserId } from '../../media'
import HlsVideoPlayer from '@/ui/HlsVideoPlayer'
import ItemFormDialog from '../../components/ItemFormDialog'
import { AddToCollectionDialog } from '../../components/CollectionDialogs'

const AUTO_SLIDE_MS = 4500

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 400 : -400, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: (dir) => ({ x: dir > 0 ? -400 : 400, opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

const kenBurns = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.08, 1.04, 1.08, 1],
    transition: { duration: AUTO_SLIDE_MS / 1000, ease: 'linear', repeat: Infinity },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.08 },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.06 },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
}

function FacebookGrid({ media, activeIdx, onSelect }) {
  const count = media.length
  if (count === 0) return null

  const gridStyles = {
    1: { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' },
    2: { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' },
    3: { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '260px 260px' },
    4: { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '240px 240px' },
  }

  const getSpan = (idx, total) => {
    if (total === 3 && idx === 0) return { gridColumn: '1 / 2', gridRow: '1 / 3' }
    if (total >= 5 && idx === 0) return { gridColumn: '1 / 2', gridRow: '1 / 3' }
    return {}
  }

  return (
    <Box sx={{
      display: 'grid',
      gap: '3px',
      borderRadius: RADIUS,
      overflow: 'hidden',
      ...gridStyles[Math.min(count, 4)],
      maxHeight: 540,
    }}>
      {media.slice(0, count > 5 ? 5 : count).map((m, idx) => {
        const span = getSpan(idx, count)
        const isActive = idx === activeIdx
        const isVideo = m.type === 'video'
        return (
          <Box
            key={m.url + idx}
            onClick={() => onSelect(idx)}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              ...span,
              bgcolor: '#0a0a0a',
              '&:hover .gridOverlay': { opacity: 1 },
              '&:hover img, &:hover video': { transform: 'scale(1.05)' },
            }}
          >
            <Box sx={{
              position: 'absolute', inset: 0, zIndex: 2,
              bgcolor: isActive ? alpha(BRAND, 0.15) : 'transparent',
              border: isActive ? '3px solid' : '3px solid transparent',
              borderColor: isActive ? 'primary.main' : 'transparent',
              transition: 'all 0.3s ease',
              pointerEvents: 'none',
            }} />
            {isVideo ? (
              <Box component="video" src={resolveMediaPath(m.url)} muted playsInline preload="metadata"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }} />
            ) : (
              <Box component="img" src={resolveMediaPath(m.url)} alt="" loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }} />
            )}
            {isVideo && (
              <Box className="gridOverlay" sx={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.3)', opacity: 0.7, transition: 'opacity 0.3s',
              }}>
                <PlayCircleRounded sx={{ fontSize: 44, color: '#fff' }} />
              </Box>
            )}
            {count > 5 && idx === 4 && (
              <Box sx={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.6)', zIndex: 3,
              }}>
                <Typography variant="h4" fontWeight="bold" color="#fff">+{count - 5}</Typography>
              </Box>
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export default function PortfolioItemView() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const currentUserId = useSelector((state) => state.user.user?._id)
  const [slideDir, setSlideDir] = useState(1)

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [addToCollOpen, setAddToCollOpen] = useState(false)
  const [collections, setCollections] = useState([])
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const autoPlayRef = useRef(null)
  const heroRef = useRef(null)

  const owner = getItemOwnerInfo(item)
  const media = getItemMedia(item)
  const active = media[activeIdx]
  const hasMultiple = media.length > 1

  const goTo = (idx) => {
    if (idx === activeIdx) return
    setSlideDir(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
  }

  const goNext = useCallback(() => {
    setActiveIdx((p) => {
      const len = getItemMedia(item).length
      if (len <= 1) return p
      setSlideDir(1)
      return (p + 1) % len
    })
  }, [item])

  const goPrev = useCallback(() => {
    setActiveIdx((p) => {
      const len = getItemMedia(item).length
      if (len <= 1) return p
      setSlideDir(-1)
      return (p - 1 + len) % len
    })
  }, [item])

  useEffect(() => {
    if (!isAutoPlay || !hasMultiple || active?.type === 'video') return
    autoPlayRef.current = setInterval(goNext, AUTO_SLIDE_MS)
    return () => clearInterval(autoPlayRef.current)
  }, [isAutoPlay, hasMultiple, goNext, active, activeIdx])

  const isVideoActive = active?.type === 'video'

  useEffect(() => {
    const handleKey = (e) => {
      if (editOpen || deleteOpen || addToCollOpen || Boolean(menuAnchor)) return
      if (e.key === 'ArrowRight') isRtl ? goPrev() : goNext()
      if (e.key === 'ArrowLeft') isRtl ? goNext() : goPrev()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, isRtl, editOpen, deleteOpen, addToCollOpen, menuAnchor])

  useEffect(() => {
    let activeFlag = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await getPortfolioItemById(itemId)
        if (!activeFlag) return
        if (res?.success && res?.data) {
          const it = res.data
          setItem(it)
          const uid = getItemUserId(it)
          const own = currentUserId && currentUserId === uid
          setLiked(Array.isArray(it.likes) ? it.likes.some((l) => (typeof l === 'string' ? l : l?._id) === currentUserId) : false)
          setLikesCount(Array.isArray(it.likes) ? it.likes.length : 0)
          if (own) {
            try {
              const c = await getMyCollections()
              if (activeFlag) setCollections(c?.data || [])
            } catch { /* ignore */ }
          }
        } else {
          setError(t('portfolio.item.notFound'))
        }
      } catch (err) {
        if (activeFlag) setError(err?.response?.data?.message || err?.message || t('common.error'))
      } finally {
        if (activeFlag) setLoading(false)
      }
    }
    load()
    return () => { activeFlag = false }
  }, [itemId, t, currentUserId])

  const handleLike = async () => {
    const prevLiked = liked
    const prevCount = likesCount
    setLiked(!prevLiked)
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)
    try {
      const res = await likePortfolioItem(itemId)
      if (res?.success) {
        setLiked(res.isLiked)
        setLikesCount(res.likesCount)
      }
    } catch {
      setLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/portfolio/item/${itemId}`)
    setMenuAnchor(null)
  }

  const handleEditSave = async () => {
    try {
      const res = await getPortfolioItemById(itemId)
      if (res?.success && res?.data) setItem(res.data)
    } catch { /* ignore */ }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deletePortfolioItem(itemId)
      navigate(-1)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleFullscreen = () => {
    if (!heroRef.current) return
    if (!document.fullscreenElement) {
      heroRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !item) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <ErrorOutlined sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Button variant="outlined" onClick={() => navigate('/gallery')}>{t('portfolio.title')}</Button>
        </motion.div>
      </Container>
    )
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">


          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>

            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              <motion.div variants={fadeUp} custom={1}>
                <Paper
                  ref={heroRef}
                  elevation={0}
                  sx={{
                    position: 'relative',
                    borderRadius: RADIUS,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#0a0a0a',
                  }}
                >
                  <Box sx={{ position: 'relative', minHeight: hasMultiple ? 420 : 320 }}>
                    <AnimatePresence custom={slideDir} mode="wait">
                      <motion.div
                        key={activeIdx}
                        custom={slideDir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        style={{ position: 'absolute', inset: 0 }}
                      >
                        {active ? (
                          active.type === 'video' ? (
                            <HlsVideoPlayer
                              src={resolveMediaPath(active.url)}
                              poster={active.poster}
                              autoPlay
                              sx={{ width: '100%', height: '100%', minHeight: 420, objectFit: 'cover', borderRadius: 0 }}
                            />
                          ) : (
                            <motion.div {...kenBurns} style={{ width: '100%', height: '100%' }}>
                              <Box component="img" src={resolveMediaPath(active.url)} alt={item.title}
                                sx={{ width: '100%', height: '100%', minHeight: 420, objectFit: 'cover', display: 'block' }} />
                            </motion.div>
                          )
                        ) : (
                          <Box sx={{ py: 10, textAlign: 'center', color: 'text.disabled' }}>
                            <ErrorOutlined sx={{ fontSize: 48 }} />
                          </Box>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {hasMultiple && (
                      <>
                        <IconButton onClick={goPrev} size="small" sx={{
                          position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', zIndex: 5,
                          bgcolor: alpha('#000', 0.5), color: '#fff', backdropFilter: 'blur(4px)',
                          '&:hover': { bgcolor: alpha('#000', 0.75) },
                        }}>
                          <ChevronLeftRounded sx={{ fontSize: 28 }} />
                        </IconButton>
                        <IconButton onClick={goNext} size="small" sx={{
                          position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', zIndex: 5,
                          bgcolor: alpha('#000', 0.5), color: '#fff', backdropFilter: 'blur(4px)',
                          '&:hover': { bgcolor: alpha('#000', 0.75) },
                        }}>
                          <ChevronRightRounded sx={{ fontSize: 28 }} />
                        </IconButton>
                      </>
                    )}

                    <Box sx={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      p: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                    }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        {hasMultiple && (
                          <Tooltip title={isAutoPlay ? 'Pause' : 'Play'}>
                            <IconButton size="small" onClick={() => setIsAutoPlay((p) => !p)} disabled={isVideoActive}
                              sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25) } }}>
                              {isAutoPlay ? <PauseRounded sx={{ fontSize: 18 }} /> : <PlayArrowRounded sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </Tooltip>
                        )}
                        {hasMultiple && (
                          <Typography variant="caption" color="rgba(255,255,255,0.85)" fontWeight={600}>
                            {activeIdx + 1} / {media.length}
                          </Typography>
                        )}
                      </Stack>
                      <Tooltip title="Fullscreen">
                        <IconButton size="small" onClick={toggleFullscreen}
                          sx={{ bgcolor: alpha('#fff', 0.15), color: '#fff', '&:hover': { bgcolor: alpha('#fff', 0.25) } }}>
                          <FullscreenRounded sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {hasMultiple && (
                      <Box sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 5, display: 'flex', gap: '3px' }}>
                        {media.slice(0, 8).map((_, idx) => (
                          <Box key={idx} onClick={() => goTo(idx)} sx={{
                            flex: 1, height: 4, borderRadius: RADIUS, cursor: 'pointer',
                            bgcolor: idx === activeIdx ? '#fff' : alpha('#fff', 0.35),
                            transition: 'all 0.3s ease',
                            '&:hover': { bgcolor: alpha('#fff', 0.7) },
                          }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Paper>
              </motion.div>

              {hasMultiple && (
                <motion.div variants={fadeUp} custom={2}>
                  <Box sx={{ mt: 2 }}>
                    <FacebookGrid media={media} activeIdx={activeIdx} onSelect={goTo} />
                  </Box>
                </motion.div>
              )}
            </Box>

            <Box sx={{ width: { xs: '100%', lg: 360 }, flexShrink: 0 }}>
              <motion.div variants={scaleIn} custom={2}>
                <Paper sx={{ p: 3, borderRadius: RADIUS, border: '1px solid', borderColor: 'divider', position: 'sticky', top: 88 }}>
                  <Stack spacing={2.5}>

                    {(item.tags?.length > 0 || item.skills?.length > 0 || item.category) && (
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        {item.category && (
                          <Chip label={item.category} size="small" sx={{ fontSize: '0.72rem', fontWeight: 700, bgcolor: alpha(BRAND, 0.1), color: 'primary.main' }} />
                        )}
                        {item.tags?.map((tag) => (
                          <Chip key={tag} label={tag} size="small" sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: 'action.hover' }} />
                        ))}
                        {item.skills?.map((skill) => (
                          <Chip key={skill} label={skill} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.72rem' }} />
                        ))}
                      </Stack>
                    )}

                    {item.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                        {item.description}
                      </Typography>
                    )}

                    {(item.client || item.duration || item.role) && (
                      <Stack spacing={1.5} sx={{ py: 1.5, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
                        {item.client && (
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <WorkOutlineOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>{t('portfolio.item.client')}</Typography>
                              <Typography variant="body2" fontWeight={600}>{item.client}</Typography>
                            </Box>
                          </Stack>
                        )}
                        {item.duration && (
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <ScheduleOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>{t('portfolio.item.duration')}</Typography>
                              <Typography variant="body2" fontWeight={600}>{item.duration}</Typography>
                            </Box>
                          </Stack>
                        )}
                        {item.role && (
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                            <CalendarTodayOutlined sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>{t('portfolio.item.role')}</Typography>
                              <Typography variant="body2" fontWeight={600}>{item.role}</Typography>
                            </Box>
                          </Stack>
                        )}
                      </Stack>
                    )}

                    {item.isFeatured && (
                      <Chip icon={<StarRounded sx={{ fontSize: 14 }} />} label={t('portfolio.item.featured')} size="small"
                        sx={{ fontSize: '0.75rem', fontWeight: 700, bgcolor: alpha('#FBBF24', 0.18), color: '#B45309', alignSelf: 'flex-start' }} />
                    )}
                    {item.visibility === 'private' && (
                      <Chip icon={<LockOutlined sx={{ fontSize: 14 }} />} label={t('portfolio.item.visibilityPrivate')} size="small"
                        sx={{ fontSize: '0.75rem', fontWeight: 700, bgcolor: alpha('#D97706', 0.15), color: '#B45309', alignSelf: 'flex-start' }} />
                    )}

                    <Stack direction="row" spacing={1.5}>
                      <Button
                        variant={liked ? 'secondary' : 'primary'}
                        startIcon={<motion.div animate={liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
                          {liked ? <FavoriteRounded /> : <FavoriteBorderRounded />}
                        </motion.div>}
                        onClick={handleLike}
                        sx={{ flex: 1, py: 1.2 }}
                      >
                        {likesCount} {t('portfolio.item.like')}
                      </Button>
                    </Stack>

                    <Stack direction="row" spacing={3} sx={{ justifyContent: 'center', color: 'text.secondary' }}>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <VisibilityOutlined sx={{ fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={600}>{item.views ?? 0}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <FavoriteRounded sx={{ fontSize: 18 }} />
                        <Typography variant="body2" fontWeight={600}>{likesCount}</Typography>
                      </Stack>
                    </Stack>

                    {item.projectUrl && (
                      <Button variant="secondary" fullWidth startIcon={<LanguageOutlined />}
                        component="a"
                        href={item.projectUrl.startsWith('http') ? item.projectUrl : `https://${item.projectUrl}`}
                        target="_blank" rel="noopener noreferrer"
                        sx={{ py: 1.1 }}>
                        {t('portfolio.item.openProject')}
                      </Button>
                    )}

                    <Divider />

                    {owner ? (
                      <Box component={Link} to={owner.id ? `/user-profile/${owner.id}` : '/gallery'} sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit',
                        p: 1.5, borderRadius: RADIUS, transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover', '& .ownerName': { color: 'primary.main' } },
                      }}>
                        <Avatar src={owner.avatar ? resolveMediaPath(owner.avatar) : undefined} sx={{ width: 48, height: 48 }}>
                          {owner.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} className="ownerName" noWrap sx={{ transition: 'color 0.2s' }}>{owner.name}</Typography>
                          {owner.headline && <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{owner.headline}</Typography>}
                        </Box>
                      </Box>
                    ) : (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                        <FolderOpenOutlined sx={{ fontSize: 18 }} />
                        <Typography variant="body2">{t('portfolio.item.title')}</Typography>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </motion.div>
            </Box>
          </Stack>
        </motion.div>

        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
          <MenuItem onClick={() => { setMenuAnchor(null); setEditOpen(true) }}>
            <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
            {t('portfolio.item.edit')}
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); setAddToCollOpen(true) }}>
            <ListItemIcon><FolderOpenOutlined fontSize="small" /></ListItemIcon>
            {t('portfolio.item.addToCollection')}
          </MenuItem>
          <MenuItem onClick={handleCopyLink}>
            <ListItemIcon><ContentCopyOutlined fontSize="small" /></ListItemIcon>
            {t('portfolio.item.copyLink')}
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); setDeleteOpen(true) }} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}><DeleteOutlined fontSize="small" /></ListItemIcon>
            {t('portfolio.item.delete')}
          </MenuItem>
        </Menu>

        <ItemFormDialog open={editOpen} onClose={() => setEditOpen(false)} item={item} onSaved={handleEditSave} />

        <AddToCollectionDialog open={addToCollOpen} onClose={() => setAddToCollOpen(false)} itemId={itemId} collections={collections} onChanged={() => {
          getMyCollections().then((c) => setCollections(c?.data || [])).catch(() => {})
        }} />

        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle>{t('portfolio.item.deleteConfirmTitle')}</DialogTitle>
          <DialogContent>
            <Typography>{t('portfolio.item.deleteConfirmBody')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={() => setDeleteOpen(false)}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <CloseRounded sx={{ fontSize: 16 }} />
                <span>{t('portfolio.form.cancel')}</span>
              </Stack>
            </Button>
            <Button variant="danger" loading={deleteLoading} onClick={handleDelete}>{t('portfolio.item.delete')}</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
