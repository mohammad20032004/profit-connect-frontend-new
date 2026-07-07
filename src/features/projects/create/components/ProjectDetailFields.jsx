import React from 'react'
import { TextField, Grid, Stack, Chip, Typography, Box, IconButton, Tooltip, CircularProgress } from '@mui/material'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'

const skillGroups = [
  {
    label: 'Frontend',
    skills: ['React', 'Vue.js', 'Angular', 'Next.js', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Tailwind CSS'],
  },
  {
    label: 'Backend',
    skills: ['Node.js', 'Python', 'Django', 'Flask', 'Express.js', 'PHP', 'Laravel', 'Java', 'C#', 'Go'],
  },
  {
    label: 'Database & DevOps',
    skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Docker', 'AWS', 'GraphQL', 'REST API', 'Redis'],
  },
  {
    label: 'Design',
    skills: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI Design', 'UX Design', 'Wireframing', 'Prototyping'],
  },
]

function getSkillsArray(skillsStr) {
  return skillsStr.split(',').map((s) => s.trim()).filter(Boolean)
}

export default function ProjectDetailFields({ form, onChange, t, onImprove, improving }) {
  const currentSkills = getSkillsArray(form.skills)

  const toggleSkill = (skill) => {
    const exists = currentSkills.includes(skill)
    const updated = exists
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill]
    const fakeEvent = { target: { value: updated.join(', ') } }
    onChange('skills')(fakeEvent)
  }

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" fontWeight={500}>{t('projects.descriptionLabel', 'Description')}</Typography>
          <Tooltip title={t('projects.improveTooltip', 'Corrects spelling & grammar, enhances academic wording, improves clarity & logic, preserves technical terms')} arrow>
            <IconButton size="small" color="primary" onClick={() => onImprove(form.description)} disabled={improving || !form.description.trim()}>
              {improving ? <CircularProgress size={18} /> : <AutoAwesomeOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>
        <TextField placeholder={t('projects.descriptionPlaceholder', 'Describe the project in detail...')} value={form.description} onChange={onChange('description')} fullWidth size="small" multiline rows={10} sx={{ '& .MuiOutlinedInput-root': { borderTopLeftRadius: 0 } }} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField label={t('projects.skillsLabel', 'Required Skills')} placeholder={t('projects.skillsPlaceholder', 'e.g. React, Node.js, MongoDB')} value={form.skills} onChange={onChange('skills')} fullWidth size="small" helperText="Separate skills with commas" />
        <Box sx={{ mt: 1.5 }}>
          {skillGroups.map((group) => (
            <Box key={group.label} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>{group.label}</Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {group.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    variant={currentSkills.includes(skill) ? 'filled' : 'outlined'}
                    color={currentSkills.includes(skill) ? 'primary' : 'default'}
                    onClick={() => toggleSkill(skill)}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      </Grid>
    </>
  )
}
