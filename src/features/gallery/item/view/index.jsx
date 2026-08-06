import { useEffect, useState } from 'react'
import { Container, Box, Paper, Avatar, Typography, Stack, CircularProgress, Chip, IconButton, Menu, MenuItem, ListItemIcon, Divider, alpha, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined,
  MoreVertOutlined,
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
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getPortfolioItemById, likePortfolioItem, deletePortfolioItem, getMyCollections } from '@/services/portfolioService'
import { resolveMediaPath } from '@/services/profile'
import { getItemMedia, getItemOwnerInfo, getItemUserId } from '../../media'
import ItemFormDialog from '../../components/ItemFormDialog'
import { AddToCollectionDialog } from '../../components/CollectionDialogs'

export default function PortfolioItemView() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const currentUserId = useSelector((state) => state.user.user?._id)

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

  const owner = getItemOwnerInfo(item)
  const itemUserId = getItemUserId(item)
  const isOwner = currentUserId && currentUserId === itemUserId
  const media = getItemMedia(item)
  const active = media[activeIdx]

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
            } catch {
              /* ignore */
            }
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
    } catch (err) {
      setLiked(prevLiked)
      setLikesCount(prevCount)
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/portfolio/item/${itemId}`)
    alert(t('portfolio.item.linkCopied'))
    setMenuAnchor(null)
  }

  const handleEditSave = async () => {
    try {
      const res = await getPortfolioItemById(itemId)
      if (res?.success && res?.data) setItem(res.data)
    } catch {
      /* ignore */
    }
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error && !item) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <ErrorOutlined sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" onClick={() => navigate('/gallery')}>{t('portfolio.title')}</Button>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackOutlined />
        </IconButton>
        <Typography variant="h6" fontWeight="bold" noWrap sx={{ flex: 1 }}>{item.title}</Typography>
        {isOwner && (
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}>
            <MoreVertOutlined />
          </IconButton>
        )}
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
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
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Paper sx={{ borderRadius: 2.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
            {active ? (
              active.type === 'video' ? (
                <Box component="video" src={resolveMediaPath(active.url)} controls sx={{ width: '100%', maxHeight: 520, display: 'block', bgcolor: '#000' }} />
              ) : (
                <Box component="img" src={resolveMediaPath(active.url)} alt={item.title} sx={{ width: '100%', maxHeight: 520, objectFit: 'cover', display: 'block' }} />
              )
            ) : (
              <Box sx={{ py: 8, textAlign: 'center', color: 'text.disabled' }}>
                <ErrorOutlined sx={{ fontSize: 44 }} />
              </Box>
            )}
          </Paper>
          {media.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
              {media.map((m, idx) => (
                <Box
                  key={m.url + idx}
                  onClick={() => setActiveIdx(idx)}
                  sx={{
                    position: 'relative',
                    width: 72,
                    height: 72,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '2px solid',
                    borderColor: activeIdx === idx ? 'primary.main' : 'transparent',
                    opacity: activeIdx === idx ? 1 : 0.7,
                    '&:hover': { opacity: 1 },
                  }}
                >
                  {m.type === 'video' ? (
                    <video src={resolveMediaPath(m.url)} preload="metadata" muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <Box component="img" src={resolveMediaPath(m.url)} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                  {m.type === 'video' && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.25)', color: '#fff' }}>
                      <PlayCircleRounded sx={{ fontSize: 26 }} />
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}

          {(item.description || (item.tags?.length) || (item.skills?.length) || item.client || item.duration || item.role) && (
            <Paper sx={{ mt: 2, p: 3, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
              {item.description && (
                <>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{t('portfolio.item.description')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mb: 2 }}>{item.description}</Typography>
                </>
              )}

              {(item.tags?.length > 0 || item.skills?.length > 0) && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {item.tags?.map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ fontSize: '0.72rem', bgcolor: 'action.hover' }} />
                  ))}
                  {item.skills?.map((skill) => (
                    <Chip key={skill} label={skill} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.72rem' }} />
                  ))}
                </Stack>
              )}

              {(item.client || item.duration || item.role) && (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {item.client && (
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 700 }}>{t('portfolio.item.client')}: </Box>
                      <Box component="span" color="text.secondary">{item.client}</Box>
                    </Typography>
                  )}
                  {item.duration && (
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 700 }}>{t('portfolio.item.duration')}: </Box>
                      <Box component="span" color="text.secondary">{item.duration}</Box>
                    </Typography>
                  )}
                  {item.role && (
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 700 }}>{t('portfolio.item.role')}: </Box>
                      <Box component="span" color="text.secondary">{item.role}</Box>
                    </Typography>
                  )}
                </Stack>
              )}
            </Paper>
          )}
        </Box>

        <Box sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0 }}>
          <Paper sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
            {item.category && (
              <Chip label={item.category} size="small" sx={{ mb: 1.5, fontSize: '0.75rem', fontWeight: 700, bgcolor: alpha('#3D1C6E', 0.1), color: 'primary.main' }} />
            )}
            {item.isFeatured && (
              <Chip icon={<StarRounded sx={{ fontSize: 14 }} />} label={t('portfolio.item.featured')} size="small" sx={{ mb: 1.5, ml: 0.75, fontSize: '0.75rem', fontWeight: 700, bgcolor: alpha('#FBBF24', 0.18), color: '#B45309' }} />
            )}
            {item.visibility === 'private' && (
              <Chip icon={<LockOutlined sx={{ fontSize: 14 }} />} label={t('portfolio.item.visibilityPrivate')} size="small" sx={{ mb: 1.5, ml: 0.75, fontSize: '0.75rem', fontWeight: 700, bgcolor: alpha('#D97706', 0.15), color: '#B45309' }} />
            )}

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button
                variant={liked ? 'secondary' : 'primary'}
                startIcon={liked ? <FavoriteRounded /> : <FavoriteBorderRounded />}
                onClick={handleLike}
                fullWidth
              >
                {likesCount} {t('portfolio.item.like')}
              </Button>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', color: 'text.secondary', mb: 2 }}>
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
              <Button
                variant="secondary"
                fullWidth
                startIcon={<LanguageOutlined />}
                component="a"
                href={item.projectUrl.startsWith('http') ? item.projectUrl : `https://${item.projectUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mb: 2 }}
              >
                {t('portfolio.item.openProject')}
              </Button>
            )}

            <Divider sx={{ my: 2 }} />

            {owner ? (
              <Box component={Link} to={owner.id ? `/gallery/${owner.id}` : '/gallery'} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit', '&:hover': { '& .ownerName': { color: 'primary.main' } } }}>
                <Avatar src={owner.avatar ? resolveMediaPath(owner.avatar) : undefined} sx={{ width: 44, height: 44 }}>
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
          </Paper>
        </Box>
      </Stack>

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
  )
}
