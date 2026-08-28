import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Stack, Typography, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, IconButton, CircularProgress, Checkbox, Switch, FormControlLabel, alpha, Alert } from '@mui/material'
import Button from '@/ui/Button'
import { TextField } from '@/ui'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  CloseRounded,
  FolderOpenOutlined,
  DeleteOutlineRounded,
  PlayCircleOutlineRounded,
  ImageOutlined,
  AddPhotoAlternateOutlined,
} from '@mui/icons-material'
import {
  createCollection,
  updateCollection,
  getCollectionById,
  getMyPortfolioItems,
  addItemToCollection,
  removeItemFromCollection,
} from '@/services/portfolioService'
import { resolveMediaPath } from '@/services/profile'
import { getItemCover } from '../media'
import ItemFormDialog from './ItemFormDialog'

export function CollectionFormDialog({ open, onClose, collection, onSaved, onItemsChanged }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', description: '', isPublic: true })
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [existingCover, setExistingCover] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const [created, setCreated] = useState(null)
  const [manageItems, setManageItems] = useState([])
  const [linkOpen, setLinkOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    setForm({
      name: collection?.name || '',
      description: collection?.description || '',
      isPublic: collection ? (collection.isPublic ?? true) : true,
    })
    setCoverFile(null)
    setCoverPreview(null)
    setExistingCover(collection?.coverImage || null)
    setCreated(null)
    setManageItems([])
    setError('')
  }, [open, collection])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: field === 'isPublic' ? e.target.checked : e.target.value }))

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  const handleRemoveCover = () => {
    setCoverFile(null)
    setCoverPreview(null)
  }

  const coverSrc = coverPreview || (existingCover ? resolveMediaPath(existingCover) : null)

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError(t('portfolio.collection.nameRequired'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = new FormData()
      payload.append('name', form.name.trim())
      payload.append('description', form.description.trim())
      payload.append('isPublic', form.isPublic)
      if (coverFile) payload.append('cover', coverFile)
      const res = collection ? await updateCollection(collection._id, payload) : await createCollection(payload)
      if (!res?.success) {
        setError(res?.message || t('common.error'))
        return
      }
      onSaved?.(res.data)
      if (!collection) {
        setCreated(res.data)
        setManageItems(res.data.items || [])
        return
      }
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const refreshItems = async () => {
    try {
      const res = await getCollectionById(created._id)
      if (res?.success) setManageItems(res.data.items || [])
    } catch {
      /* ignore */
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItemFromCollection(created._id, itemId)
      setManageItems((prev) => prev.filter((i) => i._id !== itemId))
    } catch {
      /* ignore */
    }
  }

  if (created) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle>{t('portfolio.collection.manageTitle')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {manageItems.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                {t('portfolio.collection.empty')}
              </Typography>
            ) : (
              <Stack spacing={1}>
                {manageItems.map((it) => {
                  const cover = getItemCover(it)
                  return (
                    <Box key={it._id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <Box
                        component="img"
                        src={cover ? resolveMediaPath(cover) : undefined}
                        alt=""
                        sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', bgcolor: alpha('#3D1C6E', 0.08), flexShrink: 0 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>{it.title}</Typography>
                        {it.category && <Typography variant="caption" color="text.secondary" noWrap>{it.category}</Typography>}
                      </Box>
                      <IconButton size="small" color="error" onClick={() => handleRemoveItem(it._id)}>
                        <DeleteOutlineRounded sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  )
                })}
              </Stack>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button variant="secondary" startIcon={<ImageOutlined />} onClick={() => setLinkOpen(true)}>
                {t('portfolio.collection.linkWork')}
              </Button>
              <Button variant="secondary" startIcon={<AddPhotoAlternateOutlined />} onClick={() => setCreateOpen(true)}>
                {t('portfolio.collection.createInside')}
              </Button>
            </Stack>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="primary" onClick={onClose}>{t('portfolio.collection.finish')}</Button>
        </DialogActions>

        <LinkWorkDialog
          open={linkOpen}
          onClose={() => setLinkOpen(false)}
          collectionId={created._id}
          existingItemIds={manageItems.map((i) => i._id)}
          onChanged={() => { refreshItems(); onItemsChanged?.() }}
        />
        <ItemFormDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          collectionId={created._id}
          onSaved={() => { refreshItems(); onItemsChanged?.() }}
        />
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{collection ? t('portfolio.collection.editTitle') : t('portfolio.collection.createTitle')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              height: 120,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: alpha('#3D1C6E', 0.05),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              '&:hover': { borderColor: 'primary.main' },
            }}
          >
            {coverSrc ? (
              <Box
                component="img"
                src={coverSrc}
                alt=""
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Stack spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                <ImageOutlined sx={{ fontSize: 28 }} />
                <Typography variant="caption">{t('portfolio.collection.cover')}</Typography>
              </Stack>
            )}
            {coverSrc && (
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 6, insetInlineEnd: 6, bgcolor: 'rgba(0,0,0,0.45)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' } }}
                onClick={(e) => { e.stopPropagation(); handleRemoveCover() }}
              >
                <CloseRounded sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            <input ref={fileInputRef} type="file" accept="image/*,video/*" hidden onChange={handleCoverChange} />
          </Box>
          <Typography variant="caption" color="text.secondary">{t('portfolio.collection.coverHint')}</Typography>
          <TextField label={t('portfolio.collection.name')} value={form.name} onChange={handleChange('name')} fullWidth />
          <TextField label={t('portfolio.collection.description')} value={form.description} onChange={handleChange('description')} fullWidth multiline rows={2} />
          <FormControlLabel
            control={<Switch checked={form.isPublic} onChange={handleChange('isPublic')} />}
            label={t('portfolio.collection.isPublic')}
          />
          {error && <Typography color="error" variant="body2">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" onClick={onClose}>{t('portfolio.form.cancel')}</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {collection ? t('portfolio.collection.save') : t('portfolio.collection.create')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export function LinkWorkDialog({ open, onClose, collectionId, existingItemIds = [], onChanged }) {
  const { t } = useTranslation()
  const [list, setList] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelected([])
    setError('')
    setLoading(true)
    getMyPortfolioItems({ page: 1, limit: 60 })
      .then((res) => setList(res?.data || []))
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isExisting = (id) => existingItemIds.includes(id)

  const toggle = (id) => {
    if (isExisting(id)) return
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleConfirm = async () => {
    if (selected.length === 0) return
    setBusy(true)
    setError('')
    try {
      for (const id of selected) {
        await addItemToCollection(collectionId, id)
      }
      onChanged?.()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle>{t('portfolio.collection.linkWorkTitle')}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', py: 3 }}>{error}</Typography>
        ) : list.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {t('portfolio.collection.linkWorkEmpty')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {list.map((it) => {
              const cover = getItemCover(it)
              const existing = isExisting(it._id)
              const checked = selected.includes(it._id)
              return (
                <ListItem key={it._id} disablePadding secondaryAction={existing ? null : (busy ? <CircularProgress size={18} /> : null)}>
                  <ListItemButton onClick={() => toggle(it._id)} disabled={existing || busy} sx={{ borderRadius: 2 }}>
                    <ListItemAvatar>
                      <Avatar variant="rounded" src={cover ? resolveMediaPath(cover) : undefined} sx={{ bgcolor: alpha('#3D1C6E', 0.1), color: 'primary.main' }}>
                        {it.category ? <FolderOpenOutlined /> : <ImageOutlined />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={it.title}
                      secondary={it.category || undefined}
                      primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                    {existing ? (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{t('portfolio.collection.inCollection')}</Typography>
                    ) : (
                      <Checkbox edge="end" checked={checked} tabIndex={-1} disableRipple />
                    )}
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" onClick={onClose}>{t('portfolio.form.cancel')}</Button>
        <Button variant="primary" onClick={handleConfirm} loading={busy} disabled={selected.length === 0}>
          {t('portfolio.collection.linkWorkConfirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function CollectionItemRow({ item, isOwner, onRemove }) {
  const cover = getItemCover(item)
  const media = item?.media || []
  const isVideo = media.some((m) => m.type === 'video')
  return (
    <ListItem disablePadding secondaryAction={
      isOwner ? (
        <IconButton edge="end" size="small" color="error" onClick={() => onRemove(item._id)}>
          <DeleteOutlineRounded sx={{ fontSize: 20 }} />
        </IconButton>
      ) : null
    }>
      <ListItemButton component={Link} to={`/portfolio/item/${item._id}`} sx={{ borderRadius: 2 }}>
        <ListItemAvatar>
          <Avatar variant="rounded" src={cover ? resolveMediaPath(cover) : undefined} sx={{ bgcolor: alpha('#3D1C6E', 0.1), color: 'primary.main' }}>
            {isVideo ? <PlayCircleOutlineRounded /> : <FolderOpenOutlined />}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={item.title}
          secondary={item.category || undefined}
          primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
          secondaryTypographyProps={{ noWrap: true }}
        />
      </ListItemButton>
    </ListItem>
  )
}

export function CollectionDetailDialog({ open, onClose, collectionId, isOwner, onItemRemoved, onItemsChanged }) {
  const { t } = useTranslation()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [linkOpen, setLinkOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getCollectionById(collectionId)
      if (res?.success) setDetail(res.data)
      else setError(res?.message || t('common.error'))
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && collectionId) {
       
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, collectionId])

  const handleRemove = async (itemId) => {
    try {
      await removeItemFromCollection(collectionId, itemId)
      setDetail((prev) => (prev ? { ...prev, items: (prev.items || []).filter((i) => i._id !== itemId) } : prev))
      onItemRemoved?.()
      onItemsChanged?.()
    } catch {
      /* ignore */
    }
  }

  const items = detail?.items || []

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FolderOpenOutlined sx={{ color: 'primary.main' }} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>{detail?.name || t('portfolio.collection.title')}</Typography>
            {detail && !detail.isPublic && (
              <Typography variant="caption" color="text.secondary">{t('portfolio.collection.private')}</Typography>
            )}
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {detail?.coverImage && (
          <Box
            component="img"
            src={resolveMediaPath(detail.coverImage)}
            alt=""
            sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, mb: 2, display: 'block', bgcolor: alpha('#3D1C6E', 0.06) }}
          />
        )}
        {detail?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{detail.description}</Typography>
        )}
        {isOwner && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Button variant="secondary" startIcon={<ImageOutlined />} onClick={() => setLinkOpen(true)}>
              {t('portfolio.collection.linkWork')}
            </Button>
            <Button variant="secondary" startIcon={<AddPhotoAlternateOutlined />} onClick={() => setCreateOpen(true)}>
              {t('portfolio.collection.createInside')}
            </Button>
          </Stack>
        )}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 5 }}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error" sx={{ textAlign: 'center', py: 3 }}>{error}</Typography>
        ) : items.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            {t('portfolio.collection.empty')}
          </Typography>
        ) : (
          <List dense>
            {items.map((item) => (
              <CollectionItemRow key={item._id} item={item} isOwner={isOwner} onRemove={handleRemove} />
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" onClick={onClose}>{t('portfolio.collection.close')}</Button>
      </DialogActions>

      <LinkWorkDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        collectionId={collectionId}
        existingItemIds={(detail?.items || []).map((i) => (typeof i === 'string' ? i : i?._id))}
        onChanged={() => { load(); onItemsChanged?.() }}
      />
      <ItemFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        collectionId={collectionId}
        onSaved={() => { load(); onItemsChanged?.() }}
      />
    </Dialog>
  )
}

export function AddToCollectionDialog({ open, onClose, itemId, collections, onChanged }) {
  const { t } = useTranslation()
  const [list, setList] = useState([])
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    if (open) {
       
      setList(collections || [])
    }
  }, [open, collections])

  const isInCollection = (col) => (col.items || []).some((i) => (typeof i === 'string' ? i : i?._id) === itemId)

  const handleToggle = async (col) => {
    setBusyId(col._id)
    try {
      const inCollection = isInCollection(col)
      if (inCollection) await removeItemFromCollection(col._id, itemId)
      else await addItemToCollection(col._id, itemId)
      setList((prev) => prev.map((c) => {
        if (c._id !== col._id) return c
        const items = c.items || []
        const exists = items.some((i) => (typeof i === 'string' ? i : i?._id) === itemId)
        return { ...c, items: exists ? items.filter((i) => (typeof i === 'string' ? i : i?._id) !== itemId) : [...items, { _id: itemId }] }
      }))
      onChanged?.()
    } catch {
      /* ignore */
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('portfolio.item.addToCollection')}</DialogTitle>
      <DialogContent dividers>
        {list.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            {t('portfolio.noCollections')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {list.map((col) => (
              <ListItem key={col._id} disablePadding secondaryAction={
                busyId === col._id ? <CircularProgress size={18} /> : null
              }>
                <ListItemButton onClick={() => handleToggle(col)} disabled={Boolean(busyId)} sx={{ borderRadius: 2 }}>
                  <ListItemAvatar>
                    <Avatar variant="rounded" sx={{ bgcolor: alpha('#3D1C6E', 0.1), color: 'primary.main' }}>
                      <FolderOpenOutlined />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={col.name}
                    secondary={`${(col.items || []).length} ${t('portfolio.itemsCount', { count: (col.items || []).length })}`}
                    primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                  <Checkbox edge="end" checked={isInCollection(col)} tabIndex={-1} disableRipple />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" onClick={onClose}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <CloseRounded sx={{ fontSize: 16 }} />
            <span>{t('portfolio.collection.close')}</span>
          </Stack>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
