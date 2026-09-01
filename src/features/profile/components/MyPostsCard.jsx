import { RADIUS } from '@/theme/tokens'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper, Typography, Stack, Chip, alpha, Divider } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ArticleOutlined, AddOutlined } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { PostCard } from '@/features/MainFeedLayout/components/PostsSection'
import Button from '@/ui/Button'

export default function MyPostsCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useSelector((s) => s.user.user)
  const [posts, setPosts] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setPosts(Array.isArray(user?.posts) ? user.posts : [])
    setReady(true)
  }, [user?.posts])

  const handlePostUpdated = (updatedPost) => setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)))

  const handlePostDeleted = (postId) => setPosts((prev) => prev.filter((p) => p._id !== postId))

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: RADIUS, border: '1px solid', borderColor: 'divider', width: '100%' }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: RADIUS, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: (th) => alpha(th.palette.primary.main, 0.08), color: 'primary.main',
          }}>
            <ArticleOutlined sx={{ fontSize: 17 }} />
          </Box>
          <Typography variant="subtitle2" fontWeight="bold">{t('profile.myPosts', 'My Posts')}</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip size="small" label={posts.length}
            sx={{ height: 20, minWidth: 22, fontSize: '0.66rem', fontWeight: 800, bgcolor: (th) => alpha(th.palette.primary.main, 0.08), color: 'primary.main' }} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddOutlined />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', minWidth: 0 }}
          >
            {t('profile.newPost', 'New Post')}
          </Button>
        </Stack>
      </Stack>

      {!ready ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 2 }}>...</Typography>
      ) : posts.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', py: 2 }}>
          {t('profile.noPosts', 'No posts published yet')}
        </Typography>
      ) : (
        <Stack spacing={2}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', fontSize: '0.6rem' }}>
        {t('profile.myPostsHint', 'Posts you have published on your profile')}
      </Typography>
    </Paper>
  )
}
