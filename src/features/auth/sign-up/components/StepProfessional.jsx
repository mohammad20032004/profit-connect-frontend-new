import React, { useState } from 'react'
import { Stack, TextField, Chip, Box, Typography } from '@mui/material'
import { SkillsModal } from '@/ui'

const suggestedSkills = [
  'React', 'Node.js', 'Python', 'UI/UX Design', 'Graphic Design',
  'JavaScript', 'TypeScript', 'MongoDB', 'Docker', 'AWS',
  'Flutter', 'React Native', 'Vue.js', 'Angular', 'PHP',
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
        <TextField label="Industry (optional)" value={form.industry} onChange={onChange('industry')} fullWidth placeholder="e.g. Technology, Healthcare, Finance" sx={fieldSx} />
      </Box>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0.08s both' }}>
        <TextField label="Years of Experience (optional)" type="number" value={form.yearsOfExperience} onChange={onChange('yearsOfExperience')} fullWidth sx={fieldSx} />
      </Box>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0.16s both' }}>
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Skills (click to select)</Typography>
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
            <Chip label="More..." size="small" variant="outlined" color="secondary"
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
            +{skills.length - suggestedSkills.length} more skills selected
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
