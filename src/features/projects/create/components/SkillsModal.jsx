import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Chip, Stack, IconButton, InputAdornment, Typography,
} from '@mui/material'
import { CloseOutlined, SearchOutlined } from '@mui/icons-material'
import SkillIcon, { skillNames } from '@/ui/SkillIcon'
import { useTranslation } from 'react-i18next'

function parseSkills(str) {
  if (!str) return []
  return String(str)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function SkillsModal({ open, onClose, value, onChange, t: tProp }) {
  const { t: tDefault } = useTranslation()
  const t = tProp || tDefault
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => parseSkills(value))

  useEffect(() => {
    if (open) {
      setSelected(parseSkills(value))
      setQuery('')
    }
  }, [open, value])

  const toggle = (name) => {
    setSelected((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]))
  }

  const apply = () => {
    onChange(selected.join(', '))
    onClose()
  }

  const filtered = skillNames.filter((s) => s.toLowerCase().includes(query.toLowerCase()))

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <span>{t('projects.skillsModalTitle', 'Select Skills')}</span>
          <Chip size="small" color="primary" label={t('projects.skillsSelected', '{{count}} selected', { count: selected.length })} />
        </Stack>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('projects.searchSkills', 'Search skills')}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {t('projects.noSkillsFound', 'No skills found')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filtered.map((name) => {
              const active = selected.includes(name)
              return (
                <Chip
                  key={name}
                  avatar={<SkillIcon name={name} size={14} />}
                  label={name}
                  clickable
                  color={active ? 'primary' : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  onClick={() => toggle(name)}
                />
              )
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box sx={{ flex: 1 }}>
          <Chip
            size="small"
            variant="outlined"
            label={t('projects.clearSkills', 'Clear')}
            onClick={() => setSelected([])}
            disabled={selected.length === 0}
          />
        </Box>
        <Box component="span" onClick={onClose} sx={{ cursor: 'pointer' }}>
          <Typography component="span" variant="button" sx={{ px: 2 }}>
            {t('common.cancel', 'Cancel')}
          </Typography>
        </Box>
        <Box
          component="span"
          onClick={apply}
          sx={{ cursor: 'pointer', color: 'primary.main' }}
        >
          <Typography component="span" variant="button" sx={{ px: 1, fontWeight: 700 }}>
            {t('common.apply', 'Apply')}
          </Typography>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
