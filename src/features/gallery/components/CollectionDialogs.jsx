import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Stack, Typography, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, IconButton, CircularProgress, Checkbox, Switch, FormControlLabel, alpha } from '@mui/material'
import Button from '@/ui/Button'
import { TextField } from '@/ui'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  CloseRounded,
  FolderOpenOutlined,
  DeleteOutlineRounded,
  PlayCircleOutlineRounded,
} from '@mui/icons-material'
import {
  createCollection,
  updateCollection,
  getCollectionById,
  addItemToCollection,
  removeItemFromCollection,
} from '@/services/portfolioService'
import { resolveMediaPath } from '@/services/profile'
import { getItemCover } from '../media'

export function CollectionFormDialog({ open, onClose, collection, onSaved }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', description: '', isPublic: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      name: collection?.name || '',
      description: collection?.description || '',
      isPublic: collection ? (collection.isPublic ?? true) : true,
    })
    setError('')
  }, [open, collection])

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: field === 'isPublic' ? e.target.checked : e.target.value }))

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError(t('portfolio.collection.nameRequired'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = { name: form.name.trim(), description: form.description.trim(), isPublic: form.isPublic }
      const res = collection ? await updateCollection(collection._id, payload) : await createCollection(payload)
      if (!res?.success) {
        setError(res?.message || t('common.error'))
        return
      }
      onSaved?.(res.data)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{collection ? t('portfolio.collection.editTitle') : t('portfolio.collection.createTitle')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
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

export function CollectionDetailDialog({ open, onClose, collectionId, isOwner, onItemRemoved }) {
  const { t } = useTranslation()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, collectionId])

  const handleRemove = async (itemId) => {
    try {
      await removeItemFromCollection(collectionId, itemId)
      setDetail((prev) => (prev ? { ...prev, items: (prev.items || []).filter((i) => i._id !== itemId) } : prev))
      onItemRemoved?.()
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
        {detail?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{detail.description}</Typography>
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
    </Dialog>
  )
}

export function AddToCollectionDialog({ open, onClose, itemId, collections, onChanged }) {
  const { t } = useTranslation()
  const [list, setList] = useState([])
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
