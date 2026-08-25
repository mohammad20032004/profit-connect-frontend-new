import { useState } from 'react'
import { TextField, Grid, Stack, Chip, Typography, Box, IconButton, Tooltip, CircularProgress, Button } from '@mui/material'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'
import MoreHorizOutlined from '@mui/icons-material/MoreHorizOutlined'
import SkillsModal from './SkillsModal'

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
  if (!skillsStr) return []
  return String(skillsStr).split(',').map((s) => s.trim()).filter(Boolean)
}

export default function ProjectDetailFields({ form, onChange, t, onImprove, improving, rows = 10 }) {
  const [modalOpen, setModalOpen] = useState(false)
  const currentSkills = getSkillsArray(form.skills)

  const toggleSkill = (skill) => {
    const exists = currentSkills.includes(skill)
    const updated = exists
      ? currentSkills.filter((s) => s !== skill)
      : [...currentSkills, skill]
    onChange('skills')({ target: { value: updated.join(', ') } })
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
        <TextField placeholder={t('projects.descriptionPlaceholder', 'Describe the project in detail...')} value={form.description} onChange={onChange('description')} fullWidth size="small" multiline rows={rows} sx={{ '& .MuiOutlinedInput-root': { borderTopLeftRadius: 0 } }} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          label={`${t('projects.skillsLabel', 'Skills')} (${t('projects.optional', 'optional')})`}
          placeholder={t('projects.skillsPlaceholder', 'e.g. React, Node.js, MongoDB')}
          value={currentSkills.join(', ')}
          onClick={() => setModalOpen(true)}
          onFocus={(e) => e.target.blur()}
          slotProps={{ input: { readOnly: true, style: { cursor: 'pointer' } } }}
          fullWidth
          size="small"
          helperText={t('projects.skillsHelper', 'Click to open the skills picker (optional)')}
        />
        {currentSkills.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {currentSkills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                color="primary"
                onDelete={() => toggleSkill(skill)}
              />
            ))}
          </Box>
        )}
        <Box sx={{ mt: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {t('projects.quickSelection', 'Quick selection')}
            </Typography>
            <Button
              size="small"
              endIcon={<MoreHorizOutlined fontSize="small" />}
              onClick={() => setModalOpen(true)}
              sx={{ minWidth: 0, textTransform: 'none', px: 1, py: 0, lineHeight: 1 }}
            >
              {t('projects.more', 'More')}
            </Button>
          </Stack>
          {skillGroups.map((group) => (
            <Box key={group.label} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>{t(`projects.skillGroups.${group.label}`, group.label)}</Typography>
              <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
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

      <SkillsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        value={form.skills}
        onChange={(val) => onChange('skills')({ target: { value: val } })}
        t={t}
      />
    </>
  )
}
