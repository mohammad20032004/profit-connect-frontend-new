import React, { useState, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  Button,
  TextField,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createPost } from '@/services/postService'
import { ImageOutlined, VideocamOutlined, CloseOutlined, PublicOutlined, PeopleOutlined, LockOutlined } from '@mui/icons-material'

export default function CreatePost({ onPostCreated }) {
  const { t } = useTranslation()
  const profile = useSelector((state) => state.user.profile)
  const user = useSelector((state) => state.user.user)
  const imageInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [video, setVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [loading, setLoading] = useState(false)

  const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username
  const avatarSrc = profile?.avatar
  const initials = fullName?.charAt(0)?.toUpperCase()

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      alert(t('dashboard.post.invalidImage', 'Invalid image type. Use JPG, PNG, WebP or GIF.'))
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      alert(t('dashboard.post.imageTooLarge', 'Image too large. Maximum 20MB.'))
      return
    }
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
    setVideo(null)
    setVideoPreview('')
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'].includes(file.type)) {
      alert(t('dashboard.post.invalidVideo', 'Invalid video type. Use MP4, WebM, MOV or AVI.'))
      return
    }
    if (file.size > 200 * 1024 * 1024) {
      alert(t('dashboard.post.videoTooLarge', 'Video too large. Maximum 200MB.'))
      return
    }
    setVideo(file)
    setVideoPreview(URL.createObjectURL(file))
    setImage(null)
    setImagePreview('')
  }

  const handleRemoveMedia = () => {
    setImage(null)
    setImagePreview('')
    setVideo(null)
    setVideoPreview('')
    if (imageInputRef.current) imageInputRef.current.value = ''
    if (videoInputRef.current) videoInputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      formData.append('visibility', visibility)
      if (image) formData.append('image', image)
      if (video) formData.append('video', video)
      const res = await createPost(formData)
      if (res?.success) {
        setContent('')
        setVisibility('public')
        handleRemoveMedia()
        setOpen(false)
        onPostCreated?.(res.data)
      }
    } catch (err) {
      console.error('Failed to create post:', err)
      alert(err?.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setContent('')
    handleRemoveMedia()
  }

  return (
    <>
      <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar src={avatarSrc} sx={{ width: 40, height: 40 }}>
            {initials}
          </Avatar>
          <Box
            onClick={() => setOpen(true)}
            sx={{
              flex: 1,
              py: 1.25,
              px: 2,
              borderRadius: 999,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover',
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.selected',
                borderColor: 'primary.light',
              },
            }}
          >
            <Typography variant="body2">
              {t('dashboard.post.startAPost')}
            </Typography>
          </Box>
          <IconButton
            onClick={() => imageInputRef.current?.click()}
            sx={{ color: '#45bd62', '&:hover': { bgcolor: 'rgba(69,189,98,0.08)' } }}
          >
            <ImageOutlined />
          </IconButton>
          <IconButton
            onClick={() => videoInputRef.current?.click()}
            sx={{ color: '#f3425f', '&:hover': { bgcolor: 'rgba(243,66,95,0.08)' } }}
          >
            <VideocamOutlined />
          </IconButton>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={handleImageSelect}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            hidden
            onChange={handleVideoSelect}
          />
        </Stack>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider', pb: 1.5 }}>
          {t('dashboard.post.createPost', 'Create Post')}
          <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}>
            <CloseOutlined />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <Avatar src={avatarSrc} sx={{ width: 40, height: 40 }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {fullName}
              </Typography>
              <FormControl size="small" sx={{ mt: 0.25 }}>
                <Select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  sx={{
                    fontSize: '0.75rem',
                    height: 24,
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    bgcolor: 'rgba(0,0,0,0.05)',
                    borderRadius: 1,
                    '& .MuiSelect-select': { py: 0, pr: 2.5 },
                  }}
                >
                  <MenuItem value="public" dense>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><PublicOutlined sx={{ fontSize: 16 }} /><span>{t('dashboard.public', 'Public')}</span></Stack>
                  </MenuItem>
                  <MenuItem value="connections" dense>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><PeopleOutlined sx={{ fontSize: 16 }} /><span>{t('dashboard.connections', 'Connections')}</span></Stack>
                  </MenuItem>
                  <MenuItem value="private" dense>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}><LockOutlined sx={{ fontSize: 16 }} /><span>{t('dashboard.private', 'Private')}</span></Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>

          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={12}
            placeholder={t('dashboard.post.whatToTalk')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="standard"
            slotProps={{ input: { disableUnderline: true } }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '1.15rem',
                lineHeight: 1.5,
              },
            }}
          />

          {imagePreview && (
            <Box sx={{ mt: 2, position: 'relative' }}>
              <Box
                component="img"
                src={imagePreview}
                alt="preview"
                sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveMedia}
                sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
              >
                <CloseOutlined sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          )}

          {videoPreview && (
            <Box sx={{ mt: 2, position: 'relative' }}>
              <Box
                component="video"
                src={videoPreview}
                controls
                sx={{ width: '100%', maxHeight: 300, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveMedia}
                sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
              >
                <CloseOutlined sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
          )}
        </DialogContent>

        <Divider />

        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {t('dashboard.post.addToPost', 'Add to your post')}
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton onClick={() => imageInputRef.current?.click()} sx={{ color: '#45bd62' }}>
              <ImageOutlined />
            </IconButton>
            <IconButton onClick={() => videoInputRef.current?.click()} sx={{ color: '#f3425f' }}>
              <VideocamOutlined />
            </IconButton>
          </Stack>
        </Box>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={!content.trim() || loading}
            sx={{ borderRadius: 1, py: 1, fontWeight: 600, textTransform: 'none', fontSize: '0.95rem', '&.Mui-disabled': { background: '#e4e6eb !important', color: '#000 !important' } }}
          >
            {loading ? t('dashboard.post.posting') : t('dashboard.post.post')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
