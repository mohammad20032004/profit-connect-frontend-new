import { useState, useEffect } from 'react'
import { Container, Paper, Typography, Stack, CircularProgress } from '@mui/material'
import Button from '@/ui/Button'
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { getSavedPosts } from '@/services/postService'
import { PostCard } from '@/features/MainFeedLayout/components/PostsSection'

export default function SavedPostsView() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getSavedPosts()
      .then((res) => {
        if (!active) return
        if (res?.success && Array.isArray(res?.data)) setPosts(res.data)
        else if (Array.isArray(res?.data)) setPosts(res.data)
      })
      .catch((err) => console.error('Failed to load saved posts:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handlePostDeleted = (postId) => setPosts((prev) => prev.filter((p) => p._id !== postId))

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <Button component={Link} to="/profile" variant="text" startIcon={<ArrowBackOutlined />}>
          {t('profile.title', 'My Profile')}
        </Button>
      </Stack>

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        {t('profile.savedPosts', 'Saved Posts')}
      </Typography>

      {loading ? (
        <Stack spacing={2} sx={{ alignItems: 'center', py: 6 }}>
          <CircularProgress />
        </Stack>
      ) : posts.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">{t('dashboard.noPosts', 'No posts yet')}</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} />
          ))}
        </Stack>
      )}
    </Container>
  )
}
