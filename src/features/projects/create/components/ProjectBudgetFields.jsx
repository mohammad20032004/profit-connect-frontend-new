import React from 'react'
import { TextField, MenuItem, Stack, Grid } from '@mui/material'
import ProjectDatePicker from './ProjectDatePicker'

export default function ProjectBudgetFields({ form, onChange, t }) {
  return (
    <>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label={t('projects.budgetMin', 'Min')} type="number" value={form.budgetMin} onChange={onChange('budgetMin')} fullWidth size="small" />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField label={t('projects.budgetMax', 'Max')} type="number" value={form.budgetMax} onChange={onChange('budgetMax')} fullWidth size="small" />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack direction="row" spacing={1.5}>
          <TextField label={t('projects.currency', 'Currency')} value={form.currency} onChange={onChange('currency')} select size="small" sx={{ minWidth: 110 }}>
            <MenuItem value="SAR">SAR</MenuItem>
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="EUR">EUR</MenuItem>
          </TextField>
          <ProjectDatePicker value={form.deadline} onChange={onChange('deadline')} label={t('projects.deadlineLabel', 'Deadline')} t={t} />
        </Stack>
      </Grid>
    </>
  )
}
