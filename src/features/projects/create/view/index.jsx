import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography, Stack, Paper, Grid } from '@mui/material'
import Button from '@/ui/Button'
import { ArrowBackOutlined, WorkOutlineOutlined } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { createProject, improveText } from '@/services/projectService'
import ProjectBasicFields from '../components/ProjectBasicFields'
import ProjectDetailFields from '../components/ProjectDetailFields'
import ProjectBudgetFields from '../components/ProjectBudgetFields'
import ProjectFormActions from '../components/ProjectFormActions'

export default function CreateProject() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [improving, setImproving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    skills: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'SAR',
    deadline: '',
  })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleImprove = async (text) => {
    if (!text.trim()) return
    setImproving(true)
    try {
      const res = await improveText(text)
      if (res?.success) setForm((prev) => ({ ...prev, description: res.data.improved }))
    } catch {
      // silently fail
    } finally {
      setImproving(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category) {
      setError(t('projects.fillRequired', 'Please fill in all required fields'))
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        deadline: form.deadline || undefined,
      }
      if (form.budgetMin) {
        payload.budget = { min: Number(form.budgetMin), currency: form.currency }
        if (form.budgetMax) payload.budget.max = Number(form.budgetMax)
      }
      const res = await createProject(payload)
      if (res?.success) navigate(`/projects/${res.data._id}`)
      else setError(res?.message || t('common.error'))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      

      <Paper sx={{ p: 3.5, borderRadius: 3 }}>
        <Grid container spacing={2.5}>
          <ProjectBasicFields form={form} onChange={handleChange} t={t} />
          <ProjectDetailFields form={form} onChange={handleChange} t={t} onImprove={handleImprove} improving={improving} />
          <ProjectBudgetFields form={form} onChange={handleChange} t={t} />
        </Grid>

        {error && <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 2 }}>{error}</Typography>}

        <ProjectFormActions
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/projects')}
          t={t}
        />
      </Paper>
    </Container>
  )
}
