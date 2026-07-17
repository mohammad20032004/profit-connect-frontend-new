import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  alpha,
  Tooltip,
  LinearProgress,
  Collapse,
  Chip,
} from '@mui/material'
import Button from '@/ui/Button'
import RichTextEditor from '@/ui/RichTextEditor'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { createPost } from '@/services/postService'
import {
  ImageOutlined,
  VideocamOutlined,
  CloseOutlined,
  PublicOutlined,
  PeopleOutlined,
  LockOutlined,
  EmojiEmotionsOutlined,
  DeleteOutlineOutlined,
} from '@mui/icons-material'

const MAX_CHARS = 5000
const DRAFT_KEY = 'profit_connect_post_draft'

const EMOJI_LIST = ['😀', '😂', '😍', '🥳', '🤔', '👍', '❤️', '🔥', '✨', '💡', '🚀', '💻', '📱', '🎯', '⭐', '💪']

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
  const [showEmoji, setShowEmoji] = useState(false)
  const [hashtags, setHashtags] = useState([])
  const [hashtagInput, setHashtagInput] = useState('')

  const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username
  const avatarSrc = profile?.avatar
  const initials = fullName?.charAt(0)?.toUpperCase()

  // Strip HTML tags to count plain text characters
  const getPlainText = (html) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const plainText = getPlainText(content)
  const charsRemaining = MAX_CHARS - plainText.length
  const charsPercentage = (plainText.length / MAX_CHARS) * 100
  const isOverLimit = charsRemaining < 0
  const isNearLimit = charsRemaining < 200 && charsRemaining >= 0
  const canPost = plainText.trim().length > 0 && !isOverLimit && !loading

  // Auto-save draft
  useEffect(() => {
    if (open && content) {
      const draft = { content, visibility, hashtags }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }
  }, [content, visibility, hashtags, open])

  // Load draft on open
  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const draft = JSON.parse(saved)
          if (draft.content) setContent(draft.content)
          if (draft.visibility) setVisibility(draft.visibility)
          if (draft.hashtags) setHashtags(draft.hashtags)
        }
      } catch {}
    }
  }, [open])

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
  }

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

  const handleAddEmoji = (emoji) => {
    setContent(prev => prev + emoji)
    setShowEmoji(false)
  }

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, '')
    if (tag && !hashtags.includes(tag) && hashtags.length < 5) {
      setHashtags(prev => [...prev, tag])
      setHashtagInput('')
    }
  }

  const handleRemoveHashtag = (tagToRemove) => {
    setHashtags(prev => prev.filter(t => t !== tagToRemove))
  }

  const handleSubmit = async () => {
    if (!canPost) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('visibility', visibility)
      if (hashtags.length > 0) formData.append('hashtags', hashtags.join(','))
      if (image) formData.append('image', image)
      if (video) formData.append('video', video)
      const res = await createPost(formData)
      if (res?.success) {
        clearDraft()
        setContent('')
        setVisibility('public')
        setHashtags([])
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
    setVisibility('public')
    setHashtags([])
    handleRemoveMedia()
    clearDraft()
  }

  const handleDraftDelete = () => {
    clearDraft()
    setContent('')
    setHashtags([])
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
            role="button"
            tabIndex={0}
            aria-label={t('dashboard.post.startAPost', 'Start a post')}
            onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
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
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'action.selected',
                borderColor: 'primary.light',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: '2px',
              },
            }}
          >
            <Typography variant="body2">
              {t('dashboard.post.startAPost')}
            </Typography>
          </Box>
          <Tooltip title={t('dashboard.post.addImage', 'Add image')}>
            <IconButton
              onClick={() => imageInputRef.current?.click()}
              aria-label={t('dashboard.post.addImage', 'Add image')}
              sx={{ color: 'success.main', '&:hover': { bgcolor: alpha('#16A34A', 0.08) } }}
            >
              <ImageOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('dashboard.post.addVideo', 'Add video')}>
            <IconButton
              onClick={() => videoInputRef.current?.click()}
              aria-label={t('dashboard.post.addVideo', 'Add video')}
              sx={{ color: 'success.main', '&:hover': { bgcolor: alpha('#16A34A', 0.08) } }}
            >
              <VideocamOutlined />
            </IconButton>
          </Tooltip>
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

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 1,
              overflow: 'hidden',
            }
          }
        }}
      >
        {/* Header */}
        <DialogTitle component="div" sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('dashboard.post.createPost', 'Create Post')}
          </Typography>
          <IconButton
            onClick={handleClose}
            aria-label={t('common.close', 'Close')}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseOutlined fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Progress bar when near limit */}
        {plainText.length > 0 && (
          <LinearProgress
            variant="determinate"
            value={Math.min(charsPercentage, 100)}
            sx={{
              height: 3,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                bgcolor: isOverLimit ? 'error.main' : isNearLimit ? 'warning.main' : 'primary.main',
              },
            }}
          />
        )}

        <DialogContent sx={{ pt: 2, pb: 1, px: 2 }}>
          {/* User Info + Visibility */}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <Avatar src={avatarSrc} sx={{ width: 44, height: 44, border: '2px solid', borderColor: 'divider' }}>
              {initials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2, fontSize: '0.9rem' }}>
                {fullName}
              </Typography>
              <FormControl size="small" sx={{ mt: 0.5 }}>
                <Select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  aria-label={t('dashboard.visibility', 'Visibility')}
                  sx={{
                    fontSize: '0.75rem',
                    height: 28,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <MenuItem value="public">
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <PublicOutlined sx={{ fontSize: 16, color: 'success.main' }} />
                      <span>{t('dashboard.public', 'Public')}</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="connections">
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <PeopleOutlined sx={{ fontSize: 16, color: 'info.main' }} />
                      <span>{t('dashboard.connections', 'Connections')}</span>
                    </Stack>
                  </MenuItem>
                  <MenuItem value="private">
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <LockOutlined sx={{ fontSize: 16, color: 'warning.main' }} />
                      <span>{t('dashboard.private', 'Private')}</span>
                    </Stack>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>

          {/* Rich Text Editor */}
          <Box sx={{
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder={t('dashboard.post.whatToTalk', 'What do you want to talk about?')}
            />
          </Box>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
              {hashtags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  onDelete={() => handleRemoveHashtag(tag)}
                  sx={{
                    height: 24,
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    bgcolor: alpha('#3D1C6E', 0.08),
                    color: 'primary.main',
                    '& .MuiChip-deleteIcon': {
                      fontSize: 14,
                      color: 'primary.main',
                      '&:hover': { color: 'primary.dark' },
                    },
                  }}
                />
              ))}
            </Stack>
          )}

          {/* Hashtag Input */}
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1.5 }}>
            <Typography sx={{ fontSize: '1.1rem', color: 'text.secondary', fontWeight: 700 }}>#</Typography>
            <input
              type="text"
              placeholder={t('dashboard.post.addHashtag', 'Add hashtag...')}
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.85rem',
                color: 'inherit',
              }}
            />
            <Button
              size="small"
              variant="text"
              onClick={handleAddHashtag}
              disabled={!hashtagInput.trim() || hashtags.length >= 5}
              sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
            >
              {t('common.add', 'Add')}
            </Button>
          </Stack>

          {/* Media Previews */}
          {imagePreview && (
            <Box sx={{ mt: 2, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              <Box
                component="img"
                src={imagePreview}
                alt={t('dashboard.post.imagePreview', 'Image preview')}
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'contain',
                  bgcolor: 'action.hover',
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveMedia}
                aria-label={t('dashboard.post.removeImage', 'Remove image')}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <CloseOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          )}

          {videoPreview && (
            <Box sx={{ mt: 2, position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
              <Box
                component="video"
                src={videoPreview}
                controls
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  bgcolor: 'action.hover',
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveMedia}
                aria-label={t('dashboard.post.removeVideo', 'Remove video')}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                }}
              >
                <CloseOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          )}

          {/* Emoji Picker */}
          <Collapse in={showEmoji}>
            <Box sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                {t('dashboard.post.emojis', 'Emojis')}
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {EMOJI_LIST.map((emoji) => (
                  <IconButton
                    key={emoji}
                    onClick={() => handleAddEmoji(emoji)}
                    size="small"
                    sx={{
                      fontSize: '1.25rem',
                      width: 36,
                      height: 36,
                      '&:hover': { bgcolor: 'action.selected', transform: 'scale(1.15)' },
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    {emoji}
                  </IconButton>
                ))}
              </Stack>
            </Box>
          </Collapse>

        </DialogContent>

        <Divider sx={{ mx: 2 }} />

        {/* Bottom Toolbar */}
        <Box sx={{
          px: 1.5,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Stack direction="row" spacing={0}>
            <Tooltip title={t('dashboard.post.addEmoji', 'Add emoji')}>
              <IconButton
                onClick={() => { setShowEmoji(!showEmoji); setShowMoreOptions(false) }}
                aria-label={t('dashboard.post.addEmoji', 'Add emoji')}
                sx={{
                  color: showEmoji ? 'primary.main' : 'text.secondary',
                  bgcolor: showEmoji ? alpha('#3D1C6E', 0.08) : 'transparent',
                  '&:hover': { bgcolor: alpha('#3D1C6E', 0.08) },
                }}
              >
                <EmojiEmotionsOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('dashboard.post.addImage', 'Add image')}>
              <IconButton
                onClick={() => imageInputRef.current?.click()}
                aria-label={t('dashboard.post.addImage', 'Add image')}
                sx={{ color: 'text.secondary', '&:hover': { color: 'success.main', bgcolor: alpha('#16A34A', 0.08) } }}
              >
                <ImageOutlined />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('dashboard.post.addVideo', 'Add video')}>
              <IconButton
                onClick={() => videoInputRef.current?.click()}
                aria-label={t('dashboard.post.addVideo', 'Add video')}
                sx={{ color: 'text.secondary', '&:hover': { color: 'success.main', bgcolor: alpha('#16A34A', 0.08) } }}
              >
                <VideocamOutlined />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {content.length > 0 && (
              <Tooltip title={t('dashboard.post.discardDraft', 'Discard draft')}>
                <IconButton
                  onClick={handleDraftDelete}
                  size="small"
                  aria-label={t('dashboard.post.discardDraft', 'Discard draft')}
                  sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteOutlineOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Post Button */}
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={!canPost}
            aria-label={loading ? t('dashboard.post.posting', 'Posting...') : t('dashboard.post.post', 'Post')}
            sx={{
              borderRadius: 2,
              py: 1.25,
              fontSize: '0.95rem',
              fontWeight: 700,
              textTransform: 'none',
              transition: 'all 0.25s ease',
              '&.Mui-disabled': {
                bgcolor: (theme) => alpha(theme.palette.text.disabled, 0.12),
                color: 'text.disabled',
              },
              '&:not(.Mui-disabled)': {
                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  transform: 'translateY(-1px)',
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              },
            }}
          >
            {loading ? (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box sx={{ width: 16, height: 16, border: '2px solid', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>{t('dashboard.post.posting', 'Posting...')}</span>
              </Stack>
            ) : (
              t('dashboard.post.post', 'Post')
            )}
          </Button>
        </DialogActions>

        {/* Helper text when disabled */}
        {!canPost && plainText.length === 0 && (
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              pb: 1.5,
              px: 2,
              display: 'block',
              color: 'text.disabled',
            }}
          >
            {t('dashboard.post.writeSomething', 'Write something to share with your network')}
          </Typography>
        )}

        {isOverLimit && (
          <Typography
            variant="caption"
            sx={{
              textAlign: 'center',
              pb: 1.5,
              px: 2,
              display: 'block',
              color: 'error.main',
              fontWeight: 600,
            }}
          >
            {t('dashboard.post.overLimit', 'You have exceeded the character limit')}
          </Typography>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Dialog>
    </>
  )
}
