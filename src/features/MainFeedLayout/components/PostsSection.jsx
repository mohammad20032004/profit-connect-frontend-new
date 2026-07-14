import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import Button from '@/ui/Button'
import {
  EditOutlined,
  DeleteOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ChatBubbleOutlineOutlined,
  SendOutlined,
  RepeatOutlined,
  BookmarkBorderOutlined,
  BookmarkOutlined,
  MoreHorizOutlined,
  AccessTimeOutlined,
  ContentCopyOutlined,
  FlagOutlined,
  TranslateOutlined,
} from '@mui/icons-material'
import {
  getPosts,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  savePost,
  unsavePost,
} from '@/services/postService'
import { translateText } from '@/services/translateService'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import CreatePost from './CreatePost'
import AnimatedBox from '@/components/AnimatedBox'
import { refreshReputation } from '@/services/reputation'
import { adjustPostsCount } from '@/redux/slices/userSlice'

const btnAnim = { whileTap: { scale: 0.9 }, whileHover: { scale: 1.03 }, transition: { duration: 0.15 } }

function formatTime(dateStr, t) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return t('time.justNow', { defaultValue: 'Just now' })
  if (diffMins < 60) return t('time.minutesAgo', { defaultValue: '{{count}}m ago', count: diffMins })
  if (diffHours < 24) return t('time.hoursAgo', { defaultValue: '{{count}}h ago', count: diffHours })
  if (diffDays < 7) return t('time.daysAgo', { defaultValue: '{{count}}d ago', count: diffDays })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const currentUserId = useSelector((state) => state.user.user?._id)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [translatedContent, setTranslatedContent] = useState('')
  const [showTranslated, setShowTranslated] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ content: '', visibility: 'public' })
  const [editLoading, setEditLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [saved, setSaved] = useState(post?.saved || false)
  const [saveLoading, setSaveLoading] = useState(false)
  const MAX_CHARS = 300

  useEffect(() => {
    const userIds = post?.likes?.map((l) => (typeof l === 'string' ? l : l._id)) || []
    setLiked(userIds.includes(currentUserId))
    setLikesCount(post?.likes?.length || 0)
    setComments(post?.comments || [])
  }, [post, currentUserId])

  const isOwner = currentUserId && currentUserId === post?.user?._id

  useEffect(() => {
    setExpanded(false)
  }, [showTranslated, translatedContent])

  const handleTranslate = async () => {
    if (showTranslated) { setShowTranslated(false); return }
    if (translatedContent) { setShowTranslated(true); return }
    setTranslating(true)
    const result = await translateText(post.content, i18n.language === 'ar' ? 'ar' : 'en')
    setTranslating(false)
    if (result && result !== post.content) {
      setTranslatedContent(result)
      setShowTranslated(true)
    }
  }

  const handleOpenMenu = (e) => setMenuAnchor(e.currentTarget)
  const handleCloseMenu = () => setMenuAnchor(null)

  const handleLike = async () => {
    const prevLiked = liked
    const prevCount = likesCount
    setLiked(!prevLiked)
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1)
    try {
      const res = await likePost(post._id)
      setLiked(res.isLiked)
      setLikesCount(res.likesCount)
    } catch {
      setLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  const handleSave = async () => {
    const prevSaved = saved
    setSaved(!prevSaved)
    setSaveLoading(true)
    try {
      if (prevSaved) {
        await unsavePost(post._id)
      } else {
        await savePost(post._id)
      }
    } catch {
      setSaved(prevSaved)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleOpenEdit = () => {
    setEditForm({ content: post.content || '', visibility: post.visibility || 'public' })
    setEditOpen(true)
    handleCloseMenu()
  }

  const handleEditSave = async () => {
    setEditLoading(true)
    try {
      const fd = new FormData()
      fd.append('content', editForm.content)
      fd.append('visibility', editForm.visibility)
      const res = await updatePost(post._id, fd)
      if (res?.success && res?.data) onPostUpdated(res.data)
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
      await deletePost(post._id)
      onPostDeleted(post._id)
      setDeleteDialogOpen(false)
    } catch (err) {
      console.error('Failed to delete post:', err)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || commentLoading) return
    const text = commentText.trim()
    setCommentText('')
    setCommentLoading(true)
    try {
      const res = await addComment(post._id, text)
      const tempComment = {
        _id: `temp-${Date.now()}`,
        user: { _id: currentUserId, profile: { firstName: res.fullname, avatar: res.avatar } },
        content: text,
        createdAt: new Date().toISOString(),
      }
      setComments((prev) => [...prev, tempComment])
      refreshReputation(dispatch)
    } catch {
      setCommentText(text)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    const prev = comments
    setComments((prev) => prev.filter((c) => c._id !== commentId))
    try {
      await deleteComment(post._id, commentId)
    } catch {
      setComments(prev)
    }
  }

  const canDeleteComment = (comment) => {
    const commentUserId = typeof comment.user === 'string' ? comment.user : comment.user?._id
    return currentUserId && (currentUserId === commentUserId || isOwner)
  }

  const profile = post?.user?.profile || {}
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || t('common.unknown')
  const avatarSrc = profile?.avatar
  const headline = profile?.headline
  const commentsCount = comments.length

  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Avatar src={avatarSrc} sx={{ width: 48, height: 48 }}>
            {fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {fullName}
                </Typography>
                {headline && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.2 }}>
                    {headline}
                  </Typography>
                )}
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mt: 0.25 }}>
                  <AccessTimeOutlined sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.disabled">
                    {formatTime(post?.createdAt, t)}
                  </Typography>
                </Stack>
              </Box>
              <Stack direction="row" spacing={0.5}>
                {post.content && (
                  <IconButton size="small" onClick={handleTranslate}>
                    {translating ? <CircularProgress size={16} /> : <TranslateOutlined sx={{ fontSize: 20 }} />}
                  </IconButton>
                )}
                <IconButton size="small" onClick={handleOpenMenu}>
                  <MoreHorizOutlined sx={{ fontSize: 20 }} />
                </IconButton>
              </Stack>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {isOwner && (
                  <MenuItem onClick={handleOpenEdit}>
                    <ListItemIcon><EditOutlined fontSize="small" /></ListItemIcon>
                    {t('dashboard.editPost', 'Edit post')}
                  </MenuItem>
                )}
                <MenuItem onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`); alert(t('dashboard.action.linkCopied', 'Link copied to clipboard')); handleCloseMenu() }}>
                  <ListItemIcon><ContentCopyOutlined fontSize="small" /></ListItemIcon>
                  {t('dashboard.action.copyLink', 'Copy link')}
                </MenuItem>
                {isOwner ? (
                  <MenuItem onClick={() => { setDeleteDialogOpen(true); handleCloseMenu() }} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ color: 'error.main' }}><DeleteOutlined fontSize="small" /></ListItemIcon>
                    {t('dashboard.deletePost', 'Delete post')}
                  </MenuItem>
                ) : (
                  <MenuItem onClick={() => { handleCloseMenu(); alert(t('post.reported', 'Reported')) }}>
                    <ListItemIcon><FlagOutlined fontSize="small" /></ListItemIcon>
                    {t('post.report', 'Report')}
                  </MenuItem>
                )}
              </Menu>
            </Stack>
          </Box>
        </Stack>

        {post?.content && (
          <>
            {(() => {
              const text = showTranslated && translatedContent ? translatedContent : post.content
              const isLong = text.length > MAX_CHARS
              const displayText = isLong && !expanded ? text.slice(0, MAX_CHARS) + '...' : text
              return (
                <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-line', lineHeight: 1.7, color: 'text.primary' }}>
                  {displayText}
                </Typography>
              )
            })()}
            <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
              {(() => {
                const currentText = showTranslated && translatedContent ? translatedContent : post.content
                return currentText.length > MAX_CHARS ? (
                  <Box onClick={() => setExpanded(!expanded)} sx={{ cursor: 'pointer', color: 'text.secondary', fontWeight: 600, fontSize: '0.85rem', '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}>
                    {expanded ? t('dashboard.showLess', 'Show less') : t('dashboard.showMore', 'Show more')}
                  </Box>
                ) : null
              })()}
            </Stack>
          </>
        )}

        {post?.image && (
          <Box component="img" src={post.image} alt={t('dashboard.post.image')} sx={{ mt: 2, width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }} />
        )}
        {post?.video && (
          <Box component="video" src={post.video} controls sx={{ mt: 2, width: '100%', maxHeight: 400, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} />
        )}
      </Box>

      {(likesCount > 0 || commentsCount > 0) && (
        <>
          <Divider sx={{ mx: 3 }} />
          <Stack direction="row" spacing={2} sx={{ px: { xs: 2, sm: 3 }, py: 1, alignItems: 'center' }}>
            {likesCount > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <FavoriteOutlined sx={{ fontSize: 16, color: 'error.main' }} />
                <Typography variant="caption" color="text.secondary">{likesCount}</Typography>
              </Stack>
            )}
            {commentsCount > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }} onClick={() => setShowComments(!showComments)}>
                {t('dashboard.comments', { count: commentsCount })}
              </Typography>
            )}
          </Stack>
        </>
      )}

      <Divider />

      <Stack direction="row" sx={{ px: 1, py: 0.5 }}>
        <Box component={motion.div} {...btnAnim} sx={{ flex: 1 }}>
          <Button fullWidth variant="text" startIcon={liked ? <FavoriteOutlined /> : <FavoriteBorderOutlined />} onClick={handleLike} sx={{ color: liked ? 'error.main' : 'text.secondary', fontWeight: liked ? 700 : 500, borderRadius: 1, py: 1, '&:hover': { bgcolor: 'error.light', color: 'error.main' } }}>
            {t('dashboard.action.like')}
          </Button>
        </Box>
        <Box component={motion.div} {...btnAnim} sx={{ flex: 1 }}>
          <Button fullWidth variant="text" startIcon={<ChatBubbleOutlineOutlined />} onClick={() => setShowComments(!showComments)} sx={{ color: 'text.secondary', fontWeight: 500, borderRadius: 1, py: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            {t('dashboard.action.comment')}
          </Button>
        </Box>
        <Box component={motion.div} {...btnAnim} sx={{ flex: 1 }}>
          <Button fullWidth variant="text" startIcon={<RepeatOutlined />} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/posts/${post._id}`); alert(t('dashboard.action.linkCopied', 'Link copied to clipboard')) }} sx={{ color: 'text.secondary', fontWeight: 500, borderRadius: 1, py: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            {t('dashboard.action.share')}
          </Button>
        </Box>
        <Box component={motion.div} {...btnAnim} sx={{ flex: 1 }}>
          <Button fullWidth variant="text" startIcon={saved ? <BookmarkOutlined /> : <BookmarkBorderOutlined />} onClick={handleSave} disabled={saveLoading} sx={{ color: saved ? 'primary.main' : 'text.secondary', fontWeight: saved ? 700 : 500, borderRadius: 1, py: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            {t('dashboard.action.save')}
          </Button>
        </Box>
      </Stack>

      {showComments && comments.length > 0 && (
        <>
          <Divider />
          <AnimatedBox delay={0.05}>
            <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
              <Stack spacing={2}>
                {comments.map((comment, idx) => {
                  const cProfile = comment?.user?.profile || {}
                  const cName = `${cProfile?.firstName || ''} ${cProfile?.lastName || ''}`.trim() || t('common.unknown')
                  const cAvatar = cProfile?.avatar
                  const showDelete = canDeleteComment(comment)
                  return (
                    <Stack key={comment._id} direction="row" spacing={1.5} component={motion.div}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04, ease: 'easeOut' }}
                    >
                      <Avatar src={cAvatar} sx={{ width: 32, height: 32 }}>
                        {cName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ bgcolor: 'action.hover', borderRadius: 2, p: 1.5, flex: 1, position: 'relative' }}>
                        <Typography variant="subtitle2" fontWeight="bold">{cName}</Typography>
                        <Typography variant="body2">{comment.content}</Typography>
                        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                            {formatTime(comment.createdAt, t)}
                          </Typography>
                          {showDelete && (
                            <Box component={motion.div} whileTap={{ scale: 0.85 }} transition={{ duration: 0.12 }}>
                              <IconButton size="small" onClick={() => handleDeleteComment(comment._id)} sx={{ color: 'error.light', '&:hover': { color: 'error.main' } }}>
                                <DeleteOutlined sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  )
                })}
              </Stack>
            </Box>
          </AnimatedBox>
        </>
      )}

      {showComments && (
        <AnimatedBox delay={0.1}>
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField fullWidth size="small" placeholder={t('dashboard.action.writeComment')} value={commentText} onChange={(e) => setCommentText(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: 'action.hover' } }} />
              <Box component={motion.div} whileTap={{ scale: 0.85 }} transition={{ duration: 0.12 }}>
                <IconButton type="submit" disabled={!commentText.trim() || commentLoading} sx={{ color: 'primary.main' }}>
                  <SendOutlined />
                </IconButton>
              </Box>
            </Stack>
          </Box>
        </AnimatedBox>
      )}

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
    </Paper>
  )
}

function PostSkeleton() {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CircularProgress size={48} />
        <Box sx={{ flex: 1 }}>
          <CircularProgress size={16} sx={{ display: 'block', mb: 1 }} />
          <CircularProgress size={12} />
        </Box>
      </Stack>
    </Paper>
  )
}

export default function PostsSection() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const fetchPosts = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await getPosts(p)
      if (res?.success && Array.isArray(res?.data)) {
        setPosts((prev) => (p === 1 ? res.data : [...prev, ...res.data]))
        setPagination(res.pagination)
      }
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts(1) }, [fetchPosts])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }

  const hasMore = pagination ? page < pagination.pages : false

  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.user.user)
  const currentProfile = useSelector((state) => state.user.profile)

  const handlePostCreated = (newPost) => {
    if (newPost && (!newPost.user || !newPost.user.profile)) {
      newPost.user = {
        _id: currentUser?._id,
        profile: {
          firstName: currentProfile?.firstName,
          lastName: currentProfile?.lastName,
          avatar: currentProfile?.avatar,
          headline: currentProfile?.headline,
        },
      }
    }
    setPosts((prev) => [newPost, ...prev])
    dispatch(adjustPostsCount(1))
    refreshReputation(dispatch)
  }

  const handlePostUpdated = (updatedPost) => setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)))

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId))
    dispatch(adjustPostsCount(-1))
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: 'rgba(180, 160, 200, 0.3)', borderRadius: 3 } }}>
      <Stack spacing={2} sx={{ pb: 2 }}>
        <CreatePost onPostCreated={handlePostCreated} />
        {loading && posts.length === 0 ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
          </Stack>
        ) : posts.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">{t('dashboard.noPosts')}</Typography>
          </Paper>
        ) : (
          <>
            <Stack spacing={2}>
              {posts.map((post, idx) => (
                <AnimatedBox key={post._id} delay={Math.min(idx * 0.05, 0.3)}>
                  <PostCard post={post} onPostUpdated={handlePostUpdated} onPostDeleted={handlePostDeleted} />
                </AnimatedBox>
              ))}
            </Stack>
            {hasMore && (
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Button variant="outlined" onClick={handleLoadMore} disabled={loading} sx={{ px: 4 }}>
                  {loading ? <CircularProgress size={20} /> : t('dashboard.loadMore')}
                </Button>
              </Box>
            )}
          </>
        )}
      </Stack>
    </Box>
  )
}
