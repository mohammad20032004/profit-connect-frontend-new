import { RADIUS } from '@/theme/tokens'
import { useEffect, useState } from 'react'
import { Container, Box, Avatar, Typography, Stack, CircularProgress, Grid, Chip, alpha, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material'
import Button from '@/ui/Button'
import {
  AddPhotoAlternateOutlined,
  CollectionsOutlined,
  ErrorOutlined,
  FolderOpenOutlined,
  LockOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreVertOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  getMyPortfolioItems,
  getUserPortfolioItems,
  getMyCollections,
  getUserCollections,
  deletePortfolioItem,
  deleteCollection,
} from '@/services/portfolioService'
import { getUserById, resolveMediaPath, refreshProfile } from '@/services/profile'
import ItemCard from '../components/ItemCard'
import ItemFormDialog from '../components/ItemFormDialog'
import { CollectionFormDialog, CollectionDetailDialog } from '../components/CollectionDialogs'
import { getItemCover } from '../media'

const PAGE_LIMIT = 12

function CollectionCard({ collection, isOwner, onOpen, onEdit, onDelete }) {
  const { t } = useTranslation()
  const [anchor, setAnchor] = useState(null)
  const items = collection?.items || []
  let cover = collection?.coverImage ? resolveMediaPath(collection.coverImage) : null
  if (!cover) {
    for (const it of items) {
      const c = getItemCover(it)
      if (c) { cover = resolveMediaPath(c); break }
    }
  }
  return (
    <Box
      onClick={onOpen}
      sx={{
        minWidth: 200,
        maxWidth: 240,
        cursor: 'pointer',
        position: 'relative',
        borderRadius: RADIUS,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        transition: 'all 0.2s',
        '&:hover': { borderColor: 'primary.main', boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}` },
      }}
    >
      <Box sx={{ height: 90, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {cover ? (
          <Box component="img" src={resolveMediaPath(cover)} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <FolderOpenOutlined sx={{ fontSize: 36, color: 'text.disabled', opacity: 0.7 }} />
        )}
      </Box>
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography variant="body2" fontWeight={700} noWrap>{collection.name}</Typography>
        <Typography variant="caption" color="text.secondary">{t('portfolio.itemsCount', { count: items.length })}</Typography>
      </Box>
      {!collection.isPublic && (
        <LockOutlined sx={{ position: 'absolute', top: 8, insetInlineEnd: 8, color: '#fff', fontSize: 16, bgcolor: 'rgba(0,0,0,0.45)', borderRadius: '50%', p: 0.5, boxSizing: 'content-box' }} />
      )}
      {isOwner && (
        <>
          <IconButton
            size="small"
            sx={{ position: 'absolute', top: 6, insetInlineStart: 6, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' }, zIndex: 2 }}
            onClick={(e) => {
              e.stopPropagation()
              setAnchor(e.currentTarget)
            }}
          >
            <MoreVertOutlined sx={{ fontSize: 18 }} />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => { setAnchor(null); onEdit() }}>
              <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
              {t('portfolio.collection.edit')}
            </MenuItem>
            <MenuItem onClick={() => { setAnchor(null); onDelete() }} sx={{ color: 'error.main' }}>
              <ListItemIcon sx={{ color: 'error.main' }}><DeleteOutlined fontSize="small" /></ListItemIcon>
              {t('portfolio.collection.delete')}
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  )
}

export default function GalleryView() {
  const { userId: routeUserId } = useParams()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.user.user)
  const currentProfile = useSelector((state) => state.user.profile)

  const isOwnGallery = !routeUserId
  const targetUserId = routeUserId || currentUser?._id || currentUser?.id

  const [owner, setOwner] = useState(null)
  const [items, setItems] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [page, setPage] = useState(2)
  const [hasMore, setHasMore] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteItemTarget, setDeleteItemTarget] = useState(null)
  const [collectionFormOpen, setCollectionFormOpen] = useState(false)
  const [collectionFormData, setCollectionFormData] = useState(null)
  const [viewCollectionId, setViewCollectionId] = useState(null)
  const [deleteCollectionTarget, setDeleteCollectionTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchItems = async (pg, reset, cat = category) => {
    if (reset) setLoading(true)
    else setLoadingMore(true)
    setError('')
    try {
      const params = { page: pg, limit: PAGE_LIMIT, ...(cat ? { category: cat } : {}) }
      const res = isOwnGallery ? await getMyPortfolioItems(params) : await getUserPortfolioItems(targetUserId, params)
      const list = res?.data || []
      if (reset) setItems(list)
      else setItems((prev) => [...prev, ...list])
      const pag = res?.pagination
      setHasMore(pag ? pg < pag.pages : list.length >= PAGE_LIMIT)
      if (reset) {
        setCategories(Array.from(new Set(list.map((i) => i.category).filter(Boolean))))
        setPage(2)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const reloadCollections = async () => {
    try {
      const res = isOwnGallery ? await getMyCollections() : await getUserCollections(targetUserId)
      setCollections(res?.data || (Array.isArray(res) ? res : []))
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      setItems([])
      setCollections([])
      setCategories([])
      setHasMore(false)
      setCategory('')
      if (isOwnGallery) {
        const name = currentProfile?.fullname || `${currentProfile?.firstName || ''} ${currentProfile?.lastName || ''}`.trim() || currentUser?.username || ''
        if (active) setOwner({ name, avatar: currentProfile?.avatar })
      } else if (targetUserId) {
        try {
          const res = await getUserById(targetUserId)
          if (active && res?.success) {
            const prof = res.data?.profile || {}
            const name = prof.fullname || `${prof.firstName || ''} ${prof.lastName || ''}`.trim() || res.data?.username || ''
            if (active) setOwner({ name, avatar: prof.avatar })
          }
        } catch {
          /* ignore */
        }
      }
      try {
        const [itemsRes, collRes] = isOwnGallery
          ? await Promise.all([getMyPortfolioItems({ page: 1, limit: PAGE_LIMIT }), getMyCollections()])
          : await Promise.all([getUserPortfolioItems(targetUserId, { page: 1, limit: PAGE_LIMIT }), getUserCollections(targetUserId)])
        if (!active) return
        const list = itemsRes?.data || []
        setItems(list)
        const pag = itemsRes?.pagination
        setHasMore(pag ? 1 < pag.pages : list.length >= PAGE_LIMIT)
        setCategories(Array.from(new Set(list.map((i) => i.category).filter(Boolean))))
        setPage(2)
        setCollections(collRes?.data || (Array.isArray(collRes) ? collRes : []))
      } catch (err) {
        if (active) setError(err?.response?.data?.message || err?.message || t('common.error'))
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [targetUserId, isOwnGallery]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategoryFilter = (cat) => {
    setCategory(cat)
    fetchItems(1, true, cat || '')
  }

  const handleLoadMore = () => fetchItems(page, false)

  const handleEditItem = (item) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const handleItemSaved = async () => {
    refreshProfile(dispatch)
    await fetchItems(1, true)
    await reloadCollections()
  }

  const handleDeleteItem = async () => {
    if (!deleteItemTarget) return
    setDeleteLoading(true)
    try {
      await deletePortfolioItem(deleteItemTarget._id)
      setDeleteItemTarget(null)
      refreshProfile(dispatch)
      await fetchItems(1, true)
      await reloadCollections()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCollection = async () => {
    if (!deleteCollectionTarget) return
    setDeleteLoading(true)
    try {
      await deleteCollection(deleteCollectionTarget._id)
      setDeleteCollectionTarget(null)
      await reloadCollections()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setDeleteLoading(false)
    }
  }

  const title = isOwnGallery ? t('portfolio.ownTitle') : t('portfolio.title')

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3 }}>
        <Avatar src={owner?.avatar ? resolveMediaPath(owner.avatar) : undefined} sx={{ width: 56, height: 56, bgcolor: 'primary.light', fontSize: '1.4rem', fontWeight: 700 }}>
          {owner?.name?.charAt(0)?.toUpperCase() || <CollectionsOutlined />}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" fontWeight="bold" noWrap>{title}</Typography>
          {owner?.name && (
            <Typography variant="body2" color="text.secondary" noWrap>{owner.name}</Typography>
          )}
          {!loading && items.length > 0 && (
            <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
              <Chip size="small" label={t('portfolio.itemsCount', { count: items.length })} sx={{ height: 24, fontSize: '0.72rem' }} />
              {collections.length > 0 && (
                <Chip size="small" icon={<CollectionsOutlined sx={{ fontSize: 13 }} />} label={t('portfolio.collectionsCount', { count: collections.length })} sx={{ height: 24, fontSize: '0.72rem' }} />
              )}
            </Stack>
          )}
        </Box>
        {isOwnGallery && (
          <Stack direction="row" spacing={1}>
            <Button variant="primary" startIcon={<AddPhotoAlternateOutlined />} onClick={handleAddItem}>
              {t('portfolio.addItem')}
            </Button>
            <Button variant="secondary" startIcon={<CollectionsOutlined />} onClick={() => { setCollectionFormData(null); setCollectionFormOpen(true) }}>
              {t('portfolio.newCollection')}
            </Button>
          </Stack>
        )}
      </Stack>

      {!loading && collections.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{t('portfolio.collectionsTitle')}</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, scrollbarWidth: 'thin' }}>
            {collections.map((c) => (
              <CollectionCard
                key={c._id}
                collection={c}
                isOwner={isOwnGallery}
                onOpen={() => setViewCollectionId(c._id)}
                onEdit={() => { setCollectionFormData(c); setCollectionFormOpen(true) }}
                onDelete={() => setDeleteCollectionTarget(c)}
              />
            ))}
          </Box>
        </Box>
      )}

      {categories.length > 0 && (
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', mb: 2 }}>
          <Chip label={t('common.all', 'All')} color={category === '' ? 'primary' : 'default'} onClick={() => handleCategoryFilter('')} sx={{ fontSize: '0.75rem' }} />
          {categories.map((c) => (
            <Chip key={c} label={c} color={category === c ? 'primary' : 'default'} onClick={() => handleCategoryFilter(c)} sx={{ fontSize: '0.75rem' }} />
          ))}
        </Stack>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ErrorOutlined sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Button variant="outlined" onClick={() => window.location.reload()}>{t('companies.retry', 'Retry')}</Button>
        </Box>
      ) : items.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CollectionsOutlined sx={{ fontSize: 44, color: 'text.disabled', opacity: 0.6, mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            {isOwnGallery ? t('portfolio.noItems') : t('portfolio.noItemsOther')}
          </Typography>
          {isOwnGallery && (
            <Button variant="primary" startIcon={<AddPhotoAlternateOutlined />} onClick={handleAddItem} sx={{ mt: 2 }}>
              {t('portfolio.addItem')}
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Grid container spacing={1.5}>
            {items.map((item) => (
              <Grid key={item._id} size={{ xs: 6, sm: 4, md: 3 }}>
                <ItemCard item={item} isOwner={isOwnGallery} onEdit={handleEditItem} onDelete={setDeleteItemTarget} />
              </Grid>
            ))}
          </Grid>
          {hasMore && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="secondary" loading={loadingMore} onClick={handleLoadMore}>
                {t('common.loadMore', 'Load more')}
              </Button>
            </Box>
          )}
        </>
      )}

      <ItemFormDialog open={formOpen} onClose={() => setFormOpen(false)} item={editingItem} onSaved={handleItemSaved} />

      <CollectionFormDialog
        open={collectionFormOpen}
        onClose={() => setCollectionFormOpen(false)}
        collection={collectionFormData}
        onSaved={reloadCollections}
        onItemsChanged={handleItemSaved}
      />

      <CollectionDetailDialog
        open={Boolean(viewCollectionId)}
        onClose={() => setViewCollectionId(null)}
        collectionId={viewCollectionId}
        isOwner={isOwnGallery}
        onItemRemoved={reloadCollections}
        onItemsChanged={handleItemSaved}
      />

      <Dialog open={Boolean(deleteItemTarget)} onClose={() => setDeleteItemTarget(null)}>
        <DialogTitle>{t('portfolio.item.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('portfolio.item.deleteConfirmBody')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDeleteItemTarget(null)}>{t('portfolio.form.cancel')}</Button>
          <Button variant="danger" loading={deleteLoading} onClick={handleDeleteItem}>{t('portfolio.item.delete')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteCollectionTarget)} onClose={() => setDeleteCollectionTarget(null)}>
        <DialogTitle>{t('portfolio.collection.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('portfolio.collection.deleteConfirmBody')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDeleteCollectionTarget(null)}>{t('portfolio.form.cancel')}</Button>
          <Button variant="danger" loading={deleteLoading} onClick={handleDeleteCollection}>{t('portfolio.collection.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
