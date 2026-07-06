import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
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
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import { SaveOutlined, LanguageOutlined, PaletteOutlined, NotificationsOutlined, LockOutlined } from '@mui/icons-material'
import { updateSettings } from '@/redux/slices/userSlice'
import { updateSettings as updateSettingsApi } from '@/services/settingsService'

function TabPanel({ children, value, index }) {
  return value === index ? <Box>{children}</Box> : null
}

export default function SettingsView() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const profile = useSelector((state) => state.user.profile)
  const userSettings = user?.settings || {}

  const [form, setForm] = useState(() => ({ ...userSettings }))
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState(0)

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
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('settings.saveError', 'Failed to save settings'))
    } finally {
      setLoading(false)
    }
  }

  const isDirty = JSON.stringify(form) !== JSON.stringify(userSettings)

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

            <Divider sx={{ my: 3 }} />

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
          </Box>
        </Stack>
      </Paper>
    </Container>
  )
}
