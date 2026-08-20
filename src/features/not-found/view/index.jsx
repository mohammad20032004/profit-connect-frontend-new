import { Box, Container, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SearchOffOutlined, HomeOutlined } from '@mui/icons-material'
import { motion } from 'framer-motion'
import Button from '@/ui/Button'

function NotFoundView() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: 'calc(100vh - 88px)', bgcolor: 'background.default', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={(theme) => ({
              width: 120, height: 120, borderRadius: '50%', mx: 'auto', mb: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(61,28,110,0.15)' : 'rgba(61,28,110,0.06)',
            })}>
              <SearchOffOutlined sx={{ fontSize: 64, color: 'primary.main', opacity: 0.7 }} />
            </Box>

            <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '3rem', md: '5rem' }, color: 'text.primary', mb: 1 }}>
              404
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
              {t('notFound.title', 'Page Not Found')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400, mx: 'auto' }}>
              {t('notFound.description', 'The page you\'re looking for doesn\'t exist or has been moved.')}
            </Typography>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button variant="primary" size="large" startIcon={<HomeOutlined />} onClick={() => navigate('/')}>
                {t('notFound.backHome', 'Back to Home')}
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

export default NotFoundView
