import { Grid, TextField, MenuItem, Stack, Chip, Typography, Box } from '@mui/material'
import { RangeSlider } from '@/ui'
import { formatMoney } from '@/utils/money'

const PRESETS = [
  { min: '', max: '500' },
  { min: '500', max: '2000' },
  { min: '2000', max: '5000' },
  { min: '5000', max: '10000' },
  { min: '10000', max: '50000' },
  { min: '50000', max: '' },
]

export default function ProjectBudgetFields({ form, onChange, t }) {
  const currency = form.currency || 'USD'

  const handleRange = (min, max) => {
    onChange('budgetMin')({ target: { value: min } })
    onChange('budgetMax')({ target: { value: max } })
  }

  const applyPreset = (preset) => {
    onChange('budgetMin')({ target: { value: preset.min } })
    onChange('budgetMax')({ target: { value: preset.max } })
  }

  const months = Array.from({ length: 24 }, (_, i) => i + 1)

  const presetLabel = (preset) => {
    if (!preset.min) return `< ${formatMoney(preset.max, currency)}`
    if (!preset.max) return `${formatMoney(preset.min, currency)}+`
    return `${formatMoney(preset.min, currency)} – ${formatMoney(preset.max, currency)}`
  }

  const activePreset = (preset) =>
    String(form.budgetMin || '') === String(preset.min || '') &&
    String(form.budgetMax || '') === String(preset.max || '')

  return (
    <>
      <Grid size={{ xs: 12, md: 9 }}>
        <RangeSlider
          label={t('projects.budgetLabel', 'Budget')}
          valueMin={form.budgetMin}
          valueMax={form.budgetMax}
          onChange={handleRange}
          currency={currency}
          min={0}
          max={50000}
          step={250}
        />
        <Grid container spacing={1} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label={t('projects.budgetMin', 'Min')}
              type="number"
              value={form.budgetMin}
              onChange={onChange('budgetMin')}
              fullWidth
              size="small"
              slotProps={{ input: { startAdornment: <Box component="span" sx={{ mr: 0.5, color: 'text.secondary', fontSize: 13 }}>{currency}</Box> } }}
              inputProps={{ min: 0, step: 250 }}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label={t('projects.budgetMax', 'Max')}
              type="number"
              value={form.budgetMax}
              onChange={onChange('budgetMax')}
              fullWidth
              size="small"
              slotProps={{ input: { startAdornment: <Box component="span" sx={{ mr: 0.5, color: 'text.secondary', fontSize: 13 }}>{currency}</Box> } }}
              inputProps={{ min: 0, step: 250 }}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, alignSelf: 'center', mr: 0.5 }}>
            {t('projects.budgetPresets', 'Quick ranges')}:
          </Typography>
          {PRESETS.map((preset) => (
            <Chip
              key={presetLabel(preset)}
              label={presetLabel(preset)}
              size="small"
              variant={activePreset(preset) ? 'filled' : 'outlined'}
              color={activePreset(preset) ? 'primary' : 'default'}
              clickable
              onClick={() => applyPreset(preset)}
            />
          ))}
        </Stack>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <TextField
          label={t('projects.deadlineLabel', 'Duration (months)')}
          value={form.deadline}
          onChange={onChange('deadline')}
          select
          fullWidth
          size="small"
        >
          <MenuItem value="">{t('projects.deadlineUnspecified', 'Not specified')}</MenuItem>
          {months.map((m) => (
            <MenuItem key={m} value={m}>
              {m === 1 ? t('projects.month', 'month') : `${m} ${t('projects.months', 'months')}`}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </>
  )
}
