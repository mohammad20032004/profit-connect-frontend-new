import { Grid } from '@mui/material'
import ProjectDatePicker from './ProjectDatePicker'
import { RangeSlider } from '@/ui'

export default function ProjectBudgetFields({ form, onChange, t }) {
  const handleRange = (min, max) => {
    onChange('budgetMin')({ target: { value: min } })
    onChange('budgetMax')({ target: { value: max } })
  }

  return (
    <>
      <Grid size={{ xs: 12, md: 9 }}>
        <RangeSlider
          label={t('projects.budgetLabel', 'Budget')}
          valueMin={form.budgetMin}
          valueMax={form.budgetMax}
          onChange={handleRange}
          currency="USD"
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <ProjectDatePicker value={form.deadline} onChange={onChange('deadline')} label={t('projects.deadlineLabel', 'Deadline')} t={t} />
      </Grid>
    </>
  )
}
