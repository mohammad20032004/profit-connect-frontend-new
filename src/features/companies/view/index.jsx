import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, CircularProgress, Card, CardContent, Avatar, Chip,
} from '@mui/material'
import Button from '@/ui/Button'
import { BusinessOutlined, LocationOnOutlined, PeopleOutlined } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { getCompanies } from '@/services/companyService'

export default function CompaniesList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const formatLocation = (loc) => {
    if (!loc) return ''
    if (typeof loc === 'string') return loc
    const parts = [loc.city, loc.country].filter(Boolean)
    return parts.join(', ') || ''
  }

  const fetch = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getCompanies()
      if (res?.success) setCompanies(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">{t('companies.title', 'Companies')}</Typography>
      </Stack>

      {error ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Button variant="outlined" onClick={fetch}>{t('companies.retry', 'Retry')}</Button>
        </Paper>
      ) : loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : companies.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BusinessOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">{t('companies.noCompanies', 'No companies yet')}</Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {companies.map((c) => (
            <Card key={c._id} sx={{ cursor: 'pointer' }} onClick={() => navigate(`/companies/${c._id}`)}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={c.logo} sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                  {c.name?.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" fontWeight="bold">{c.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }} noWrap>
                    {c.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                    {c.industry && <Chip icon={<BusinessOutlined />} label={c.industry} size="small" />}
                    {c.location && <Chip icon={<LocationOnOutlined />} label={formatLocation(c.location)} size="small" />}
                    <Chip icon={<PeopleOutlined />} label={`${c.followersCount ?? 0}`} size="small" />
                    {c.averageRating > 0 && (
                      <Chip label={`${t('companies.rating', 'Rating')}: ${c.averageRating.toFixed(1)}`} size="small" color="primary" />
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  )
}
