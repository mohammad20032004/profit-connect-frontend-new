import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Button,
  TextField,
} from '@mui/material'
import {
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ChatBubbleOutlineOutlined,
  SendOutlined,
  RepeatOutlined,
  MoreHorizOutlined,
  AccessTimeOutlined,
} from '@mui/icons-material'
import { getPosts } from '@/services/postService'

function formatTime(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function PostCard({ post }) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post?.likes?.length || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  const profile = post?.user?.profile || {}
  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown'
  const avatarSrc = profile?.avatar
  const headline = profile?.headline
  const comments = post?.comments || []
  const commentsCount = comments.length

  const handleLike = () => {
    setLiked((prev) => !prev)
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1))
  }

  const handleCommentSubmit = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setCommentText('')
  }

  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Avatar src={avatarSrc} sx={{ width: 48, height: 48 }}>
            {fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {fullName}
                </Typography>
                {headline && (
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.2 }}>
                    {headline}
                  </Typography>
                )}
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
                  <AccessTimeOutlined sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.disabled">
                    {formatTime(post?.createdAt)}
                  </Typography>
                </Stack>
              </Box>
              <IconButton size="small">
                <MoreHorizOutlined sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Box>
        </Stack>

        {post?.content && (
          <Typography
            variant="body1"
            sx={{ mt: 2, whiteSpace: 'pre-line', lineHeight: 1.7, color: 'text.primary' }}
          >
            {post.content}
          </Typography>
        )}

        {post?.image && (
          <Box
            component="img"
            src={post.image}
            alt="Post image"
            sx={{
              mt: 2,
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
        )}
      </Box>

      {(likesCount > 0 || commentsCount > 0) && (
        <>
          <Divider sx={{ mx: 3 }} />
          <Stack
            direction="row"
            spacing={2}
            sx={{ px: { xs: 2, sm: 3 }, py: 1 }}
            alignItems="center"
          >
            {likesCount > 0 && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <FavoriteOutlined sx={{ fontSize: 16, color: 'error.main' }} />
                <Typography variant="caption" color="text.secondary">
                  {likesCount}
                </Typography>
              </Stack>
            )}
            {commentsCount > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                onClick={() => setShowComments(!showComments)}
              >
                {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
              </Typography>
            )}
          </Stack>
        </>
      )}

      <Divider />

      <Stack direction="row" sx={{ px: 1, py: 0.5 }}>
        <Button
          fullWidth
          startIcon={liked ? <FavoriteOutlined /> : <FavoriteBorderOutlined />}
          onClick={handleLike}
          sx={{
            color: liked ? 'error.main' : 'text.secondary',
            fontWeight: liked ? 700 : 500,
            borderRadius: 1,
            py: 1,
            '&:hover': { bgcolor: 'error.light', color: 'error.main' },
          }}
        >
          Like
        </Button>
        <Button
          fullWidth
          startIcon={<ChatBubbleOutlineOutlined />}
          onClick={() => setShowComments(!showComments)}
          sx={{ color: 'text.secondary', fontWeight: 500, borderRadius: 1, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
        >
          Comment
        </Button>
        <Button
          fullWidth
          startIcon={<RepeatOutlined />}
          sx={{ color: 'text.secondary', fontWeight: 500, borderRadius: 1, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
        >
          Share
        </Button>
        <Button
          fullWidth
          startIcon={<SendOutlined />}
          sx={{ color: 'text.secondary', fontWeight: 500, borderRadius: 1, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
        >
          Send
        </Button>
      </Stack>

      {showComments && comments.length > 0 && (
        <>
          <Divider />
          <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <Stack spacing={2}>
              {comments.map((comment) => {
                const cProfile = comment?.user?.profile || {}
                const cName = `${cProfile?.firstName || ''} ${cProfile?.lastName || ''}`.trim() || 'Unknown'
                const cAvatar = cProfile?.avatar
                return (
                  <Stack key={comment._id} direction="row" spacing={1.5}>
                    <Avatar src={cAvatar} sx={{ width: 32, height: 32 }}>
                      {cName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box
                      sx={{
                        bgcolor: 'grey.100',
                        borderRadius: 2,
                        p: 1.5,
                        flex: 1,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold">
                        {cName}
                      </Typography>
                      <Typography variant="body2">{comment.content}</Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        {formatTime(comment.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                )
              })}
            </Stack>
          </Box>
        </>
      )}

      {showComments && (
        <Box
          component="form"
          onSubmit={handleCommentSubmit}
          sx={{ px: { xs: 2, sm: 3 }, pb: 2 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999, bgcolor: 'grey.100' } }}
            />
            <IconButton
              type="submit"
              disabled={!commentText.trim()}
              sx={{ color: 'primary.main' }}
            >
              <SendOutlined />
            </IconButton>
          </Stack>
        </Box>
      )}
    </Paper>
  )
}

function PostSkeleton() {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
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

  useEffect(() => {
    fetchPosts(1)
  }, [fetchPosts])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }

  const hasMore = pagination ? page < pagination.pages : false

  return (
    <Box sx={{height: '80vh', overflow: 'auto'}}>
          <Stack spacing={2}>
      {loading && posts.length === 0 ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </Stack>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No posts yet
          </Typography>
        </Paper>
      ) : (
        <>
          <Stack spacing={2}>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </Stack>
          {hasMore && (
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loading}
                sx={{ borderRadius: 999, px: 4 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Load More'}
              </Button>
            </Box>
          )}
        </>
      )}
    </Stack>

    </Box>
  )
}
