import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Paper, Typography, Stack, TextField, Grid, IconButton, Alert, CircularProgress,
} from '@mui/material'
import Button from '@/ui/Button'
import { ArrowBackOutlined } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createCompany } from '@/services/companyService'

export default function CreateCompany() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', description: '', industry: '', location: '', companySize: '', foundedYear: '',
    website: '', contactEmail: '', linkedin: '', twitter: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        industry: form.industry.trim(),
        location: form.location.trim(),
        companySize: form.companySize.trim() || undefined,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        website: form.website.trim() || undefined,
        contactEmail: form.contactEmail.trim() || undefined,
        socialLinks: {},
      }
      if (form.linkedin.trim()) payload.socialLinks.linkedin = form.linkedin.trim()
      if (form.twitter.trim()) payload.socialLinks.twitter = form.twitter.trim()
      if (!Object.keys(payload.socialLinks).length) delete payload.socialLinks

      const res = await createCompany(payload)
      if (res?.success) navigate(`/companies/${res.data._id}`)
    } catch (err) {
      setError(err?.response?.data?.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <IconButton onClick={() => navigate('/companies')} sx={{ mb: 1 }}>
        <ArrowBackOutlined />
      </IconButton>

      <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
          {t('companies.create', 'Create Company')}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField fullWidth required label={t('companies.name', 'Company Name')} value={form.name} onChange={set('name')} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label={t('companies.description', 'Description')} value={form.description} onChange={set('description')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label={t('companies.industry', 'Industry')} value={form.industry} onChange={set('industry')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label={t('companies.location', 'Location')} value={form.location} onChange={set('location')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('companies.companySize', 'Company Size')} value={form.companySize} onChange={set('companySize')} placeholder="e.g. 51-200" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('companies.foundedYear', 'Founded Year')} value={form.foundedYear} onChange={set('foundedYear')} type="number" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label={t('companies.website', 'Website')} value={form.website} onChange={set('website')} placeholder="https://..." />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label={t('companies.contactEmail', 'Contact Email')} value={form.contactEmail} onChange={set('contactEmail')} type="email" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="LinkedIn" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/company/..." />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Twitter" value={form.twitter} onChange={set('twitter')} placeholder="https://twitter.com/..." />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={() => navigate('/companies')}>
            {t('companies.cancel', 'Cancel')}
          </Button>
          <Button variant="contained" type="submit" disabled={loading || !form.name.trim()}>
            {loading ? <CircularProgress size={20} /> : t('companies.create', 'Create Company')}
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
