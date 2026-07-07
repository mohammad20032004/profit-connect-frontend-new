import React from 'react'
import { TextField, MenuItem, Grid } from '@mui/material'

const categories = [
  'Web Development', 'Mobile Development', 'UI/UX Design',
  'Graphic Design', 'Backend Development', 'Frontend Development',
  'Other',
]

export default function ProjectBasicFields({ form, onChange, t }) {
  return (
    <>
      <Grid size={{ xs: 12, md: 8 }}>
        <TextField label={t('projects.titleLabel', 'Project Title')} placeholder={t('projects.titlePlaceholder', 'e.g. Inventory management web app')} value={form.title} onChange={onChange('title')} required fullWidth size="small" />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label={t('projects.categoryLabel', 'Category')} value={form.category} onChange={onChange('category')} select required fullWidth size="small">
          {categories.map((cat) => (<MenuItem key={cat} value={cat}>{t(`projects.categoryOptions.${cat}`, cat)}</MenuItem>))}
        </TextField>
      </Grid>
    </>
  )
}
