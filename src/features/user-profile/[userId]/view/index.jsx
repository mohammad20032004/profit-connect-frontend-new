import { useState, useEffect } from 'react'
import { Box, Container, Paper, Avatar, Typography, Chip, Stack, alpha, Grid,   CircularProgress, IconButton } from '@mui/material'
import Button from '@/ui/Button'
import {
  ArrowBackOutlined,
  LocationOnOutlined,
  WorkspacePremiumRounded,
  LinkedIn,
  GitHub,
  Language,
  EmailOutlined,
  PhoneOutlined,
  BusinessCenterOutlined,
  BuildOutlined,
  StarRounded,
  BadgeOutlined,
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserById, resolveMediaPath } from '@/services/profile'

export default function UserProfileUserIdView() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUser = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getUserById(userId)
      if (res?.success) setUser(res.data)
      else setError(res?.message || t('common.error'))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUser() }, [userId])

  const profile = user?.profile || {}
  const professional = user?.professional || {}
  const skills = professional?.skills || []
  const socialLinks = profile?.socialLinks || {}
  const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username
  const avatarSrc = resolveMediaPath(profile?.avatar)
  const Rscore = profile?.rScore || 0

  if (loading) return (
    <Container maxWidth={false} sx={{ mt: 4, textAlign: 'center' }}>
      <CircularProgress />
    </Container>
  )

  if (error) return (
    <Container maxWidth={false} sx={{ mt: 4, textAlign: 'center' }}>
      <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      <Button variant="outlined" onClick={fetchUser}>{t('companies.retry', 'Retry')}</Button>
    </Container>
  )

  if (!user) return (
    <Container maxWidth={false} sx={{ mt: 4, textAlign: 'center' }}>
      <Typography color="error">{t('companies.notFound', 'Profile not found')}</Typography>
    </Container>
  )

  const roleLabel = user.role === 'Employer' ? (isRtl ? 'صاحب عمل' : 'Employer')
    : user.role === 'Employee' ? (isRtl ? 'موظف' : 'Employee')
    : user.role === 'CompanyEmployee' ? (isRtl ? 'موظف شركة' : 'Company Employee')
    : user.role || (isRtl ? 'باحث عن عمل' : 'Job Seeker')

  const isEmployer = user.role === 'Employer'
  const isCompanyEmployee = user.role === 'CompanyEmployee'

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
        <IconButton onClick={() => navigate(-1)} size="small"><ArrowBackOutlined /></IconButton>
        <Typography variant="h5" fontWeight="bold" noWrap>{fullName}</Typography>
      </Stack>

      <Paper sx={{ borderRadius: 3, p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
            <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Avatar
                src={avatarSrc}
                sx={{
                  width: { xs: 100, md: 140 },
                  height: { xs: 100, md: 140 },
                  border: '4px solid',
                  borderColor: 'primary.light',
                  boxShadow: 4,
                  bgcolor: 'primary.light',
                }}
              >
                {fullName?.charAt(0)?.toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {fullName}
                </Typography>
                {profile?.headline && (
                  <Typography variant="body2" color="text.secondary">
                    {profile.headline}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip label={roleLabel} size="small" color="primary" variant="outlined" />
                  {profile?.location && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <LocationOnOutlined sx={{ fontSize: 14 }} />
                      {profile.location}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {isEmployer && user.company && (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: '100%' }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar src={resolveMediaPath(user.company.logo)} sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 16 }}>
                      {user.company.name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>{user.company.name}</Typography>
                      {user.company.industry && <Typography variant="caption" color="text.secondary" noWrap>{user.company.industry}</Typography>}
                    </Box>
                  </Stack>
                </Paper>
              )}

              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', width: '100%' }}>
                <Box sx={{ textAlign: 'center', flex: 1, py: 1, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold">{profile?.postsCount ?? 0}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('profile.posts')}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1, py: 1, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold">{profile?.followersCount ?? 0}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('profile.followers')}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', flex: 1, py: 1, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
                  <Typography variant="h6" fontWeight="bold">{profile?.followingCount ?? 0}</Typography>
                  <Typography variant="caption" color="text.secondary">{t('profile.following')}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
            <Stack spacing={2.5}>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <StarRounded sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight="bold">{t('profile.reputation')}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      icon={Rscore >= 4000 ? <Box component="img" src="/Images/High-Score.gif" sx={{ width: 18, height: 18 }} /> : <WorkspacePremiumRounded />}
                      label={`${Rscore}`}
                      color={Rscore >= 4000 ? 'warning' : 'default'}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 1.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">{t('profile.rScore')}</Typography>
                  </Stack>
                </Paper>

                {(user?.email || profile?.phoneNumber) && (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{t('profile.contactInfo')}</Typography>
                    <Stack spacing={0.75}>
                      {user?.email && (
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                          <EmailOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.85rem' }}>{user.email}</Typography>
                        </Stack>
                      )}
                      {profile?.phoneNumber && (
                        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                          <PhoneOutlined sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{profile.phoneNumber}</Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Stack>

              {isCompanyEmployee && user.companyEmployeeProfile && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <BadgeOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight="bold">{isRtl ? 'البيانات الوظيفية' : 'Work Info'}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
                    {user.companyEmployeeProfile.department && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">{isRtl ? 'القسم' : 'Department'}</Typography>
                        <Typography variant="body2">{user.companyEmployeeProfile.department}</Typography>
                      </Box>
                    )}
                    {user.companyEmployeeProfile.position && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">{isRtl ? 'المنصب' : 'Position'}</Typography>
                        <Typography variant="body2">{user.companyEmployeeProfile.position}</Typography>
                      </Box>
                    )}
                    {user.company && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">{isRtl ? 'الشركة' : 'Company'}</Typography>
                        <Typography variant="body2">{user.company.name}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}

              {(professional?.industry || professional?.yearsOfExperience > 0 || skills.length > 0) && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                    <BusinessCenterOutlined sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" fontWeight="bold">{t('profile.professionalInfo')}</Typography>
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
                    {professional?.industry && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">{t('profile.industry')}</Typography>
                        <Typography variant="body2">{professional.industry}</Typography>
                      </Box>
                    )}
                    {professional?.yearsOfExperience > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">{t('profile.yearsExp')}</Typography>
                        <Typography variant="body2">{professional.yearsOfExperience} {t('profile.yearsExp')}</Typography>
                      </Box>
                    )}
                    {skills.length > 0 && (
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">{t('profile.skills')}</Typography>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.3 }}>
                          {skills.map((skill) => (
                            <Chip key={skill} label={skill} size="small" icon={<BuildOutlined sx={{ fontSize: 13 }} />} sx={{ borderRadius: 1.5, height: 26 }} />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}

              {(socialLinks?.linkedin || socialLinks?.github || socialLinks?.website) && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>{t('profile.socialLinks')}</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {socialLinks?.linkedin && (
                      <Button href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" size="small" variant="text" startIcon={<LinkedIn />} sx={{ borderRadius: 1.5, fontSize: '0.8rem' }}>LinkedIn</Button>
                    )}
                    {socialLinks?.github && (
                      <Button href={socialLinks.github} target="_blank" rel="noopener noreferrer" size="small" variant="text" startIcon={<GitHub />} sx={{ borderRadius: 1.5, fontSize: '0.8rem' }}>GitHub</Button>
                    )}
                    {socialLinks?.website && (
                      <Button href={socialLinks.website} target="_blank" rel="noopener noreferrer" size="small" variant="text" startIcon={<Language />} sx={{ borderRadius: 1.5, fontSize: '0.8rem' }}>{t('companies.website')}</Button>
                    )}
                  </Stack>
                </Paper>
              )}

              {profile?.bio && (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.75 }}>{t('profile.bio')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.875rem' }}>
                    {profile.bio}
                  </Typography>
                </Paper>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}
