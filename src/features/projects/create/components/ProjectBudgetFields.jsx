import React from 'react'
import { TextField, MenuItem, Grid } from '@mui/material'
import ProjectDatePicker from './ProjectDatePicker'
import { RangeSlider } from '@/ui'

export default function ProjectBudgetFields({ form, onChange, t }) {
  const handleRange = (min, max) => {
    onChange('budgetMin')({ target: { value: min } })
    onChange('budgetMax')({ target: { value: max } })
  }

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <RangeSlider
          label={t('projects.budgetLabel', 'Budget')}
          valueMin={form.budgetMin}
          valueMax={form.budgetMax}
          onChange={handleRange}
          currency={form.currency}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <TextField label={t('projects.currency', 'Currency')} value={form.currency} onChange={onChange('currency')} select size="small" sx={{ minWidth: 110 }}>
          <MenuItem value="SAR">SAR</MenuItem>
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="EUR">EUR</MenuItem>
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <ProjectDatePicker value={form.deadline} onChange={onChange('deadline')} label={t('projects.deadlineLabel', 'Deadline')} t={t} />
      </Grid>
    </>
  )
}
