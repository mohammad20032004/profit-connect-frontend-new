import React, { useState } from 'react'
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
} from '@mui/material'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createPost } from '@/services/postService'

export default function CreatePost({ onPostCreated }) {
  const { t } = useTranslation()
  const profile = useSelector((state) => state.user.profile)
  const user = useSelector((state) => state.user.user)
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username
  const avatarSrc = profile?.avatar
  const initials = fullName?.charAt(0)?.toUpperCase()

  const handleSubmit = async () => {
    if (!content.trim()) return
    setLoading(true)
    try {
      const res = await createPost({ content: content.trim() })
      if (res?.success) {
        setContent('')
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

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      {!open ? (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar src={avatarSrc} sx={{ width: 44, height: 44 }}>
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
              bgcolor: 'grey.50',
              cursor: 'pointer',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'grey.100',
                borderColor: 'primary.light',
              },
            }}
          >
            <Typography variant="body2">
              {t('dashboard.post.startAPost')}
            </Typography>
          </Box>
        </Stack>
      ) : (
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar src={avatarSrc} sx={{ width: 44, height: 44 }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {fullName}
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={10}
                placeholder={t('dashboard.post.whatToTalk')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                sx={{
                  mt: 1,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    '& fieldset': { border: 'none' },
                  },
                }}
              />
            </Box>
          </Stack>

          <Divider sx={{ my: 1.5 }} />

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="text"
              onClick={() => {
                setOpen(false)
                setContent('')
              }}
              sx={{ color: 'text.secondary' }}
            >
              {t('dashboard.post.cancel')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              sx={{ borderRadius: 999, px: 3 }}
            >
              {loading ? t('dashboard.post.posting') : t('dashboard.post.post')}
            </Button>
          </Stack>
        </Box>
      )}
    </Paper>
  )
}
