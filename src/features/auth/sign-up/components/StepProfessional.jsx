import { useState } from 'react'
import { Stack, TextField, MenuItem, Chip, Box, Typography } from '@mui/material'
import { SkillsModal } from '@/ui'
import { useTranslation } from 'react-i18next'

const suggestedSkills = [
  'React', 'Node.js', 'Python', 'UI/UX Design', 'Graphic Design',
  'JavaScript', 'TypeScript', 'MongoDB', 'Docker', 'AWS',
  'Flutter', 'React Native', 'Vue.js', 'Angular', 'PHP',
]

const industryDomains = [
  { key: 'web', value: 'Web Development' },
  { key: 'mobile', value: 'Mobile Development' },
  { key: 'frontend', value: 'Frontend Development' },
  { key: 'backend', value: 'Backend Development' },
  { key: 'fullstack', value: 'Full Stack Development' },
  { key: 'uiux', value: 'UI/UX Design' },
  { key: 'graphic', value: 'Graphic Design' },
  { key: 'game', value: 'Game Development' },
  { key: 'devops', value: 'DevOps & Cloud' },
  { key: 'data', value: 'Data Science' },
  { key: 'ai', value: 'Machine Learning & AI' },
  { key: 'desktop', value: 'Desktop Development' },
  { key: 'qa', value: 'QA & Testing' },
  { key: 'security', value: 'Cybersecurity' },
]

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.25s ease',
    '&:hover': { boxShadow: '0 2px 8px rgba(61,28,110,0.08)' },
    '&.Mui-focused': { boxShadow: '0 2px 12px rgba(61,28,110,0.12)' },
  },
}

export default function StepProfessional({ form, onChange }) {
  const [modalOpen, setModalOpen] = useState(false)
  const { t } = useTranslation()
  const skills = form.skills || []

  const toggleSkill = (skill) => {
    const updated = skills.includes(skill)
      ? skills.filter((s) => s !== skill)
      : [...skills, skill]
    onChange('skills')({ target: { value: updated } })
  }

  return (
    <Stack spacing={2.5}>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0s both' }}>
        <TextField
          select
          label={t('auth.industryOptional')}
          value={form.industry}
          onChange={onChange('industry')}
          fullWidth
          size="small"
          sx={fieldSx}
        >
          <MenuItem value="">
            <em>{t('auth.selectIndustry', 'Select industry')}</em>
          </MenuItem>
          {industryDomains.map((opt) => (
            <MenuItem key={opt.key} value={opt.value}>
              {t(`auth.industryDomains.${opt.key}`, opt.value)}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0.08s both' }}>
        <TextField label={t('auth.yearsExpOptional')} type="number" value={form.yearsOfExperience} onChange={onChange('yearsOfExperience')} fullWidth sx={fieldSx} />
      </Box>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0.16s both' }}>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>{t('auth.skillsLabel')}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {suggestedSkills.map((skill, i) => (
            <Box key={skill} sx={{ animation: 'fadeUp 0.3s ease', animationDelay: `${0.2 + i * 0.03}s`, animationFillMode: 'both' }}>
              <Chip label={skill} size="small"
                variant={skills.includes(skill) ? 'filled' : 'outlined'}
                color={skills.includes(skill) ? 'primary' : 'default'}
                onClick={() => toggleSkill(skill)}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px) scale(1.04)', boxShadow: '0 2px 8px rgba(61,28,110,0.15)' },
                }}
              />
            </Box>
          ))}
          <Box sx={{ animation: 'fadeUp 0.3s ease', animationDelay: '0.55s', animationFillMode: 'both' }}>
            <Chip label={t('auth.moreSkills')} size="small" variant="outlined" color="secondary"
              onClick={() => setModalOpen(true)}
              sx={{
                fontWeight: 700, transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-1px) scale(1.04)', boxShadow: '0 2px 8px rgba(61,28,110,0.15)' },
              }}
            />
          </Box>
        </Box>
        {skills.length > suggestedSkills.length && (
          <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}>
            +{skills.length - suggestedSkills.length} {t('auth.moreSkills')}
          </Typography>
        )}
      </Box>

      <SkillsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selected={skills}
        onToggle={toggleSkill}
      />
    </Stack>
  )
}
