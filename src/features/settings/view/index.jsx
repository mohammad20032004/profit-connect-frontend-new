import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Alert,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Fab,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import Button from '@/ui/Button'
import { SkillsModal } from '@/ui'
import { SaveOutlined, LanguageOutlined, PaletteOutlined, NotificationsOutlined, LockOutlined, PersonOutlined, AddOutlined, HomeOutlined, PhotoCameraOutlined } from '@mui/icons-material'
import { updateSettings } from '@/redux/slices/userSlice'
import { updateSettings as updateSettingsApi, updateProfile as updateProfileApi, updateAvatar as updateAvatarApi } from '@/services/settingsService'
import { refreshReputation } from '@/services/reputation'
import { refreshProfile } from '@/services/profile'

function TabPanel({ children, value, index }) {
  return value === index ? <Box>{children}</Box> : null
}

export default function SettingsView() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.user.user)
  const profile = useSelector((state) => state.user.profile)
  const userSettings = user?.settings || {}

  const [form, setForm] = useState(() => ({ ...userSettings }))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)

  const professional = user?.professional || {}
  const [profileForm, setProfileForm] = useState(() => ({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    phoneNumber: profile?.phoneNumber || '',
    linkedin: profile?.socialLinks?.linkedin || '',
    github: profile?.socialLinks?.github || '',
    website: profile?.socialLinks?.website || '',
    skills: (professional?.skills || []).join(', '),
    industry: professional?.industry || '',
    yearsOfExperience: professional?.yearsOfExperience ?? 0,
  }))
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)
  const [stepDir, setStepDir] = useState(1)
  const animEnabled = useSelector((s) => s.user.user?.settings?.animationEnabled !== false)
  const isRtl = i18n.dir() === 'rtl'
  const goStep = (i) => { setStepDir(i >= activeStep ? 1 : -1); setActiveStep(i) }
  const [skillsModalOpen, setSkillsModalOpen] = useState(false)
  const selectedSkills = profileForm.skills
    ? profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  const toggleSkill = (skill) => {
    const updated = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill]
    setProfileForm((prev) => ({ ...prev, skills: updated.join(', ') }))
  }
  const profileSteps = [
    t('settings.stepBasic', 'Basic Info'),
    t('settings.stepContact', 'Contact & Links'),
    t('settings.stepPro', 'Professional'),
  ]

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    try {
      await updateAvatarApi(file)
      await refreshProfile(dispatch)
    } catch (err) {
      setProfileError(err?.response?.data?.message || err.message || t('settings.avatarError', 'Failed to upload photo'))
    } finally {
      setAvatarLoading(false)
      e.target.value = ''
    }
  }

  const setProfileField = (key) => (e) => setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))

  const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username
  const avatarSrc = profile?.avatar

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))
  const toggle = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.checked }))

  const handleSave = async () => {
    setLoading(true)
    setSuccess(false)
    setError('')
    try {
      const payload = { ...form }
      await updateSettingsApi(payload)
      dispatch(updateSettings(payload))
      if (payload.language && ['en', 'ar'].includes(payload.language)) {
        i18n.changeLanguage(payload.language)
      }
      setSuccess(true)
      refreshReputation(dispatch)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('settings.saveError', 'Failed to save settings'))
    } finally {
      setLoading(false)
    }
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(userSettings)

  const handleSaveProfile = async () => {
    setProfileLoading(true)
    setProfileSuccess(false)
    setProfileError('')
    try {
      const payload = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        headline: profileForm.headline,
        bio: profileForm.bio,
        location: profileForm.location,
        phoneNumber: profileForm.phoneNumber,
        socialLinks: {
          linkedin: profileForm.linkedin,
          github: profileForm.github,
          website: profileForm.website,
        },
        skills: profileForm.skills
          ? profileForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        industry: profileForm.industry,
        yearsOfExperience: Number(profileForm.yearsOfExperience) || 0,
      }
      await updateProfileApi(payload)
      await refreshProfile(dispatch)
      setProfileSuccess(true)
      refreshReputation(dispatch)
    } catch (err) {
      setProfileError(err?.response?.data?.message || err.message || t('settings.saveError', 'Failed to save settings'))
    } finally {
      setProfileLoading(false)
    }
  }

  const SelectField = ({ label, value, onChange, options }) => (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={onChange}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )

  const tabs = [
    { label: t('settings.language', 'Language'), icon: <LanguageOutlined /> },
    { label: t('settings.appearance', 'Appearance'), icon: <PaletteOutlined /> },
    { label: t('settings.notifications', 'Notifications'), icon: <NotificationsOutlined /> },
    { label: t('settings.privacy', 'Privacy'), icon: <LockOutlined /> },
    { label: t('settings.personalInfo', 'Personal Data'), icon: <PersonOutlined /> },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', mb: 3 }}>
          <Avatar src={avatarSrc} sx={{ width: 56, height: 56 }}>
            {fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">{fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{t('menu.accountSettings')}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>{t('settings.saved', 'Settings saved successfully')}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Tabs
            orientation="vertical"
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderRight: '1px solid', borderColor: 'divider', minWidth: 180, '& .MuiTab-root': { alignItems: 'flex-start', textTransform: 'none', fontSize: '0.9rem', py: 1.5 } }}
          >
            {tabs.map((t) => (
              <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} />
            ))}
          </Tabs>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TabPanel value={tab} index={0}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('settings.language', 'Language')}
              </Typography>
              <SelectField
                label={t('settings.displayLang', 'Display Language')}
                value={form.language || 'en'}
                onChange={set('language')}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'ar', label: 'العربية' },
                ]}
              />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('settings.appearance', 'Appearance')}
              </Typography>
              <Stack spacing={2}>
                <SelectField
                  label={t('settings.theme', 'Theme')}
                  value={form.theme || 'system'}
                  onChange={set('theme')}
                  options={[
                    { value: 'system', label: 'System' },
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                />
                <FormControlLabel
                  control={<Switch checked={form.animationEnabled !== false} onChange={toggle('animationEnabled')} />}
                  label={t('settings.animationEnabled', 'Enable animations')}
                  sx={{ display: 'flex', justifyContent: 'space-between', mx: 0, width: '100%' }}
                  labelPlacement="start"
                />
              </Stack>
            </TabPanel>

            <TabPanel value={tab} index={2}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('settings.notifications', 'Notifications')}
              </Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={<Switch checked={!!form.emailNotifications} onChange={toggle('emailNotifications')} />}
                  label={t('settings.emailNotif', 'Email Notifications')}
                  sx={{ display: 'flex', justifyContent: 'space-between', mx: 0, width: '100%' }}
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={<Switch checked={!!form.pushNotifications} onChange={toggle('pushNotifications')} />}
                  label={t('settings.pushNotif', 'Push Notifications')}
                  sx={{ display: 'flex', justifyContent: 'space-between', mx: 0, width: '100%' }}
                  labelPlacement="start"
                />
              </Stack>
            </TabPanel>

            <TabPanel value={tab} index={3}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {t('settings.privacy', 'Privacy')}
              </Typography>
              <Stack spacing={2}>
                <SelectField
                  label={t('settings.profileVis', 'Profile Visibility')}
                  value={form.profileVisibility || 'public'}
                  onChange={set('profileVisibility')}
                  options={[
                    { value: 'public', label: 'Public' },
                    { value: 'connections', label: 'Connections' },
                    { value: 'private', label: 'Private' },
                  ]}
                />
                <FormControlLabel
                  control={<Switch checked={!!form.showEmail} onChange={toggle('showEmail')} />}
                  label={t('settings.showEmail', 'Show Email')}
                  sx={{ display: 'flex', justifyContent: 'space-between', mx: 0, width: '100%' }}
                  labelPlacement="start"
                />
                <FormControlLabel
                  control={<Switch checked={!!form.showPhone} onChange={toggle('showPhone')} />}
                  label={t('settings.showPhone', 'Show Phone')}
                  sx={{ display: 'flex', justifyContent: 'space-between', mx: 0, width: '100%' }}
                  labelPlacement="start"
                />
              </Stack>
            </TabPanel>

            <TabPanel value={tab} index={4}>
              {profileSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setProfileSuccess(false)}>{t('settings.saved', 'Settings saved successfully')}</Alert>}
              {profileError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProfileError('')}>{profileError}</Alert>}
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {profileSteps.map((label, i) => (
                  <Step
                    key={label}
                    completed={i < activeStep}
                    sx={{
                      cursor: 'pointer',
                      '& .MuiStepLabel-label': { transition: 'color .2s' },
                      '&:hover .MuiStepLabel-label': { color: 'primary.main' },
                    }}
                    onClick={() => goStep(i)}
                  >
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box
                component={motion.div}
                key={activeStep}
                initial={animEnabled ? { opacity: 0, x: stepDir * (isRtl ? -40 : 40) } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {activeStep === 0 && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                    <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
                      <Avatar
                        src={avatarSrc}
                        sx={{
                          width: 110,
                          height: 110,
                          mx: 'auto',
                          boxShadow: '0 8px 24px rgba(61,28,110,0.18)',
                          border: '3px solid #fff',
                        }}
                      >
                        {fullName?.[0]}
                      </Avatar>
                      <Button
                        component="label"
                        variant="outlined"
                        size="small"
                        startIcon={avatarLoading ? <CircularProgress size={16} color="inherit" /> : <PhotoCameraOutlined />}
                        disabled={avatarLoading}
                        sx={{ mt: 1.5 }}
                      >
                        {t('settings.changePhoto', 'Change photo')}
                        <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                      </Button>
                    </Box>
                    <Stack spacing={2} sx={{ flex: 1, maxWidth: 520 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField fullWidth size="small" label={t('settings.firstName')} value={profileForm.firstName} onChange={setProfileField('firstName')} />
                        <TextField fullWidth size="small" label={t('settings.lastName')} value={profileForm.lastName} onChange={setProfileField('lastName')} />
                      </Stack>
                      <TextField fullWidth size="small" label={t('settings.headline')} value={profileForm.headline} onChange={setProfileField('headline')} />
                      <TextField fullWidth size="small" multiline minRows={3} label={t('settings.bio')} value={profileForm.bio} onChange={setProfileField('bio')} />
                    </Stack>
                  </Stack>
                )}

                {activeStep === 1 && (
                  <Stack spacing={2} sx={{ maxWidth: 520 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField fullWidth size="small" label={t('settings.location')} value={profileForm.location} onChange={setProfileField('location')} />
                      <TextField fullWidth size="small" label={t('settings.phone')} value={profileForm.phoneNumber} onChange={setProfileField('phoneNumber')} />
                    </Stack>
                    <TextField fullWidth size="small" label={t('settings.linkedin')} value={profileForm.linkedin} onChange={setProfileField('linkedin')} />
                    <TextField fullWidth size="small" label={t('settings.github')} value={profileForm.github} onChange={setProfileField('github')} />
                    <TextField fullWidth size="small" label={t('settings.website')} value={profileForm.website} onChange={setProfileField('website')} />
                  </Stack>
                )}

                {activeStep === 2 && (
                  <Stack spacing={2} sx={{ maxWidth: 520 }}>
                    <Box>
                      <Button variant="outlined" startIcon={<AddOutlined />} onClick={() => setSkillsModalOpen(true)} sx={{ mb: 1 }}>
                        {t('settings.skills', 'Skills')}
                      </Button>
                      {selectedSkills.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                          {selectedSkills.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              color="primary"
                              variant="filled"
                              onDelete={() => toggleSkill(skill)}
                              sx={{ fontWeight: 600 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField fullWidth size="small" label={t('settings.industry')} value={profileForm.industry} onChange={setProfileField('industry')} />
                      <TextField fullWidth size="small" type="number" label={t('settings.experience')} value={profileForm.yearsOfExperience} onChange={setProfileField('yearsOfExperience')} />
                    </Stack>
                    <SkillsModal
                      open={skillsModalOpen}
                      onClose={() => setSkillsModalOpen(false)}
                      selected={selectedSkills}
                      onToggle={toggleSkill}
                    />
                  </Stack>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="text" onClick={() => goStep(activeStep - 1)} disabled={activeStep === 0}>
                  {t('settings.back', 'Back')}
                </Button>
                {activeStep < profileSteps.length - 1 ? (
                  <Button variant="contained" onClick={() => goStep(activeStep + 1)}>
                    {t('settings.next', 'Next')}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={profileLoading ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                  >
                    {t('settings.save', 'Save Settings')}
                  </Button>
                )}
              </Box>
            </TabPanel>

            <Divider sx={{ my: 3 }} />

            {tab !== 4 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                  onClick={handleSave}
                  disabled={!isDirty || loading}
                >
                  {t('settings.save', 'Save Settings')}
                </Button>
              </Box>
            )}
          </Box>
        </Stack>
      </Paper>

      <Fab
        color="primary"
        aria-label="home"
        onClick={() => navigate('/')}
        sx={{
          position: 'fixed',
          bottom: 24,
          insetInlineEnd: 24,
          boxShadow: '0 12px 32px rgba(61,28,110,0.35)',
          animation: animEnabled ? 'fadeUp 0.4s ease both' : 'none',
        }}
      >
        <HomeOutlined />
      </Fab>
    </Container>
  )
}
