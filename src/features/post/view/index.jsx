import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Stack,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined,
  MoreVertOutlined,
  EditOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
  FlagOutlined,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { getPostById, updatePost, deletePost } from '@/services/postService'
import { useTranslation } from 'react-i18next'

export default function PostPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const currentUserId = useSelector((state) => state.user.user?._id)
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ content: '', visibility: 'public' })
  const [editLoading, setEditLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await getPostById(postId)
        if (res?.success && res?.data) {
          setPost(res.data)
        } else {
          setError(t('post.notFound', 'Post not found'))
        }
      } catch (err) {
        setError(err?.response?.data?.message || t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId, t])

  const isOwner = currentUserId && currentUserId === post?.user?._id

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${postId}`)
    alert(t('dashboard.action.linkCopied', 'Link copied to clipboard'))
    setMenuAnchor(null)
  }

  const handleOpenEdit = () => {
    setEditForm({ content: post?.content || '', visibility: post?.visibility || 'public' })
    setEditOpen(true)
    setMenuAnchor(null)
  }

  const handleEditSave = async () => {
    setEditLoading(true)
    try {
      const fd = new FormData()
      fd.append('content', editForm.content)
      fd.append('visibility', editForm.visibility)
      const res = await updatePost(postId, fd)
      if (res?.success && res?.data) setPost(res.data)
      setEditOpen(false)
    } catch (err) {
      console.error('Failed to update post:', err)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await deletePost(postId)
      setDeleteDialogOpen(false)
      navigate('/')
    } catch (err) {
      console.error('Failed to delete post:', err)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Box component="span" onClick={() => navigate('/')} sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', display: 'inline-block' }}>
          {t('post.goHome', 'Go to Home')}
        </Box>
      </Container>
    )
  }

  const profile = post?.user?.profile || {}
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || t('common.unknown')
  const avatarSrc = profile?.avatar

  return (
    <Container maxWidth="sm" sx={{ mt: 2, mb: 4 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackOutlined />
        </IconButton>
        <Typography variant="h6" fontWeight="bold">{t('post.post', 'Post')}</Typography>
      </Stack>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar src={avatarSrc} sx={{ width: 48, height: 48 }}>
            {fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold">{fullName}</Typography>
            {profile?.headline && (
              <Typography variant="caption" color="text.secondary">{profile.headline}</Typography>
            )}
          </Box>
          <IconButton
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={{ bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
          >
            <MoreVertOutlined />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {isOwner && (
              <MenuItem onClick={handleOpenEdit}>
                <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
                {t('dashboard.editPost', 'Edit post')}
              </MenuItem>
            )}
            <MenuItem onClick={handleCopyLink}>
              <ListItemIcon><ContentCopyOutlined fontSize="small" /></ListItemIcon>
              {t('dashboard.action.copyLink', 'Copy link')}
            </MenuItem>
            {isOwner ? (
              <MenuItem onClick={() => { setDeleteDialogOpen(true); setMenuAnchor(null) }} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main' }}><DeleteOutlined fontSize="small" /></ListItemIcon>
                {t('dashboard.deletePost', 'Delete post')}
              </MenuItem>
            ) : (
              <MenuItem onClick={() => { setMenuAnchor(null); alert(t('post.reported', 'Reported')) }}>
                <ListItemIcon><FlagOutlined fontSize="small" /></ListItemIcon>
                {t('post.report', 'Report')}
              </MenuItem>
            )}
          </Menu>
        </Box>

        {post?.content && (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
            {post.content}
          </Typography>
        )}

        {post?.image && (
          <Box component="img" src={post.image} alt="" sx={{ mt: 2, width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 2 }} />
        )}
        {post?.video && (
          <Box component="video" src={post.video} controls sx={{ mt: 2, width: '100%', maxHeight: 500, borderRadius: 2 }} />
        )}
      </Paper>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('dashboard.editPost', 'Edit post')}</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth multiline rows={4} sx={{ mt: 1 }} value={editForm.content} onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))} />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{t('dashboard.visibility', 'Visibility')}</InputLabel>
            <Select value={editForm.visibility} label={t('dashboard.visibility', 'Visibility')} onChange={(e) => setEditForm((prev) => ({ ...prev, visibility: e.target.value }))}>
              <MenuItem value="public">{t('dashboard.public', 'Public')}</MenuItem>
              <MenuItem value="connections">{t('dashboard.connections', 'Connections')}</MenuItem>
              <MenuItem value="private">{t('dashboard.private', 'Private')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setEditOpen(false)}>{t('dashboard.post.cancel', 'Cancel')}</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={editLoading || !editForm.content.trim()}>
            {editLoading ? <CircularProgress size={20} /> : t('common.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('dashboard.deleteConfirmTitle', 'Delete post?')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dashboard.deleteConfirmBody', 'This action cannot be undone.')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDeleteDialogOpen(false)}>{t('dashboard.post.cancel', 'Cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <CircularProgress size={20} /> : t('dashboard.deletePost', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
