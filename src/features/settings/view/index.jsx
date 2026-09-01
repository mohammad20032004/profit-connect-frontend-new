import { DANGER, RADIUS } from '@/theme/tokens'
import { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { alpha } from '@mui/material/styles'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import Button from '@/ui/Button'
import { SkillsModal } from '@/ui'
import UserAvatar from '@/components/common/UserAvatar'
import CountrySelect from '@/ui/CountrySelect'
import { LanguageOutlined, PaletteOutlined, NotificationsOutlined, LockOutlined, PersonOutlined, AddOutlined, HomeOutlined, PhotoCameraOutlined, SecurityOutlined, KeyOutlined, DeleteOutlineOutlined, WarningAmberOutlined } from '@mui/icons-material'
import { updateSettings, clearUserProfile } from '@/redux/slices/userSlice'
import { updateSettings as updateSettingsApi, updateProfile as updateProfileApi, updateAvatar as updateAvatarApi, changePassword as changePasswordApi, deleteAccount as deleteAccountApi } from '@/services/settingsService'
import { refreshReputation } from '@/services/reputation'
import { refreshProfile } from '@/services/profile'

function TabPanel({ children, value, index }) {
  return value === index ? <Box>{children}</Box> : null
}

function SelectField({ label, value, onChange, options }) {
  return (
    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
      <InputLabel>{label}</InputLabel>
      <Select value={value} label={label} onChange={onChange}>
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
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
    gender: profile?.gender || '',
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
      const res = await updateAvatarApi(file)
      if (res?.data?.avatar) {
        dispatch(updateSettings({}))
      }
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

  useEffect(() => {
    if (JSON.stringify(form) === JSON.stringify(userSettings)) return
    const id = setTimeout(async () => {
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
    }, 800)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const initialProfile = useRef(profileForm)
  useEffect(() => {
    if (JSON.stringify(profileForm) === JSON.stringify(initialProfile.current)) return
    const id = setTimeout(async () => {
      setProfileLoading(true)
      setProfileSuccess(false)
      setProfileError('')
      try {
        const payload = {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          gender: profileForm.gender,
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
    }, 800)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileForm])

  const tabs = [
    { label: t('settings.language', 'Language'), icon: <LanguageOutlined /> },
    { label: t('settings.appearance', 'Appearance'), icon: <PaletteOutlined /> },
    { label: t('settings.notifications', 'Notifications'), icon: <NotificationsOutlined /> },
    { label: t('settings.privacy', 'Privacy'), icon: <LockOutlined /> },
    { label: t('settings.personalInfo', 'Personal Data'), icon: <PersonOutlined /> },
    { label: t('settings.security', 'Security'), icon: <SecurityOutlined /> },
  ]

  const [passwordForm, setPasswordForm] = useState(() => ({ currentPassword: '', newPassword: '', confirmPassword: '' }))
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const setPasswordField = (key) => (e) => setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleChangePassword = async () => {
    setPasswordSuccess(false)
    setPasswordError('')
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError(t('settings.pwdRequired', 'Please fill in all password fields'))
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError(t('settings.pwdTooShort', 'New password must be at least 6 characters'))
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(t('settings.pwdMismatch', 'New password and confirmation do not match'))
      return
    }
    setPasswordLoading(true)
    try {
      const res = await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      if (res?.success) {
        setPasswordSuccess(true)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordError(res?.message || t('settings.pwdError', 'Failed to change password'))
      }
    } catch (err) {
      setPasswordError(err?.response?.data?.message || err.message || t('settings.pwdError', 'Failed to change password'))
    } finally {
      setPasswordLoading(false)
    }
  }

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await deleteAccountApi()
      if (res?.success) {
        localStorage.removeItem('profit_connect_token')
        localStorage.removeItem('profit_connect_refresh_token')
        dispatch(clearUserProfile())
        navigate('/landing')
      } else {
        setDeleteError(res?.message || t('settings.deleteError', 'Failed to delete account'))
        setDeleting(false)
      }
    } catch (err) {
      setDeleteError(err?.response?.data?.message || err.message || t('settings.deleteError', 'Failed to delete account'))
      setDeleting(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', mb: 3 }}>
          <UserAvatar src={avatarSrc} name={fullName} role={user?.role} gender={profile?.gender} sx={{ width: 56, height: 56 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">{fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{t('menu.accountSettings')}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>{t('settings.saved', 'Settings saved successfully')}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {loading && <Alert severity="info" sx={{ mb: 2 }}>{t('settings.saving', 'Saving changes…')}</Alert>}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Tabs
            orientation="vertical"
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderInlineEnd: '1px solid', borderColor: 'divider', minWidth: { xs: 0, md: 180 }, width: { xs: '100%', md: 'auto' }, '& .MuiTab-root': { alignItems: 'flex-start', textTransform: 'none', fontSize: '0.9rem', py: 1.5 } }}
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
              {profileLoading && <Alert severity="info" sx={{ mb: 2 }}>{t('settings.saving', 'Saving changes…')}</Alert>}
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
                      <UserAvatar
                        src={avatarSrc}
                        name={fullName}
                        role={user?.role}
                        gender={profile?.gender}
                        sx={{
                          width: 110,
                          height: 110,
                          mx: 'auto',
                          boxShadow: '0 8px 24px rgba(61,28,110,0.18)',
                          border: '3px solid #fff',
                        }}
                      />
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
                      <FormControl fullWidth size="small" sx={{ maxWidth: { sm: 240 } }}>
                        <InputLabel>{t('settings.gender')}</InputLabel>
                        <Select value={profileForm.gender} label={t('settings.gender')} onChange={setProfileField('gender')}>
                          <MenuItem value="male">{t('settings.genderMale')}</MenuItem>
                          <MenuItem value="female">{t('settings.genderFemale')}</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField fullWidth size="small" label={t('settings.headline')} value={profileForm.headline} onChange={setProfileField('headline')} />
                      <TextField fullWidth size="small" multiline minRows={3} label={t('settings.bio')} value={profileForm.bio} onChange={setProfileField('bio')} />
                    </Stack>
                  </Stack>
                )}

                {activeStep === 1 && (
                  <Stack spacing={2} sx={{ maxWidth: 520 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <CountrySelect label={t('settings.location')} value={profileForm.location} onChange={setProfileField('location')} />
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
                {activeStep < profileSteps.length - 1 && (
                  <Button variant="contained" onClick={() => goStep(activeStep + 1)}>
                    {t('settings.next', 'Next')}
                  </Button>
                )}
              </Box>
            </TabPanel>

            <TabPanel value={tab} index={5}>
              {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPasswordSuccess(false)}>{t('settings.pwdChanged', 'Password changed successfully')}</Alert>}
              {passwordError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError('')}>{passwordError}</Alert>}

              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: RADIUS, borderColor: 'divider', mb: 3 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <KeyOutlined sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight="bold">{t('settings.changePassword', 'Change Password')}</Typography>
                </Stack>
                <Stack spacing={2} sx={{ maxWidth: 420 }}>
                  <TextField
                    type="password"
                    size="small"
                    label={t('settings.currentPassword')}
                    value={passwordForm.currentPassword}
                    onChange={setPasswordField('currentPassword')}
                  />
                  <TextField
                    type="password"
                    size="small"
                    label={t('settings.newPassword')}
                    value={passwordForm.newPassword}
                    onChange={setPasswordField('newPassword')}
                  />
                  <TextField
                    type="password"
                    size="small"
                    label={t('settings.confirmPassword')}
                    value={passwordForm.confirmPassword}
                    onChange={setPasswordField('confirmPassword')}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={passwordLoading ? <CircularProgress size={18} color="inherit" /> : <KeyOutlined />}
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                    >
                      {t('settings.updatePassword', 'Update Password')}
                    </Button>
                  </Box>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: RADIUS, borderColor: 'error.main', bgcolor: alpha(DANGER, 0.03) }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                  <WarningAmberOutlined sx={{ color: 'error.main' }} />
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'error.main' }}>{t('settings.dangerZone', 'Danger Zone')}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('settings.deleteAccountDesc', 'Deleting your account will permanently remove your profile, posts and all associated data. This action cannot be undone.')}
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineOutlined />}
                  onClick={() => setDeleteOpen(true)}
                >
                  {t('settings.deleteAccount', 'Delete Account')}
                </Button>
              </Paper>
            </TabPanel>

            <Divider sx={{ my: 3 }} />
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

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <WarningAmberOutlined sx={{ color: 'error.main' }} />
            <Typography variant="h6" fontWeight={800}>{t('settings.deleteAccount', 'Delete Account')}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {t('settings.deleteConfirm', 'Are you sure you want to delete your account? This will permanently remove your profile, posts and all associated data and cannot be undone.')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={() => setDeleteOpen(false)} disabled={deleting}>
            {t('settings.cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteOutlineOutlined />}
            onClick={handleDeleteAccount}
            disabled={deleting}
          >
            {t('settings.confirmDelete', 'Delete Permanently')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
