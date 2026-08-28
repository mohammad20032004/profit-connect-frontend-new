import { RADIUS } from '@/theme/tokens'
import React, { useMemo, useState } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  InputBase,
  Container,
  Stack,
  Badge,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import WorkIcon from '@mui/icons-material/Work'
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import BusinessIcon from '@mui/icons-material/Business'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Logo from './common/Logo'
import UserAvatar from './common/UserAvatar'
import HeaderProjectsButton from './HeaderProjectsButton'
import { clearUserProfile } from '../redux/slices/userSlice'
import { logoutRequest } from '../services/authService'

const Header = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const profile = useSelector((state) => state.user.profile)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const unreadCount = useSelector((state) => state.notifications?.unreadCount || 0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [navAnchorEl, setNavAnchorEl] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const dir = i18n.dir()

  const navItems = [
    { label: t('nav.home'), icon: <HomeIcon />, hasBadge: false, link: '/' },
    { label: t('nav.network'), icon: <PeopleIcon />, hasBadge: false, link: '/network' },
    { label: t('nav.companies'), icon: <BusinessIcon />, hasBadge: false, link: '/companies' },
    { label: t('nav.projects'), icon: <WorkIcon />, hasBadge: false, link: '/projects' },
    { label: t('nav.jobs'), icon: <BusinessCenterIcon />, hasBadge: false, link: '/jobs' },
  ]

  const hiddenRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/verify-email', '/landing', '/settings']
  const menuOpen = Boolean(anchorEl)
  const navMenuOpen = Boolean(navAnchorEl)

  const handleOpenNav = (event) => setNavAnchorEl(event.currentTarget)
  const handleCloseNav = () => setNavAnchorEl(null)

  const fullName = useMemo(
    () =>
      profile?.fullname ||
      [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
      user?.username ||
      'My Profile',
    [profile, user],
  )

  const subLabel = user?.email || user?.role || 'View profile'
  const avatarSrc = profile?.avatar

  const shouldHideHeader = hiddenRoutes.some((route) => pathname.startsWith(route))

  const handleOpenMenu = (event) => {
    if (!isAuthenticated) {
      navigate('/sign-in')
      return
    }

    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    const refreshToken = window.localStorage.getItem('profit_connect_refresh_token')
    if (refreshToken) {
      logoutRequest(refreshToken).catch(() => {})
    }
    window.localStorage.removeItem('profit_connect_token')
    window.localStorage.removeItem('profit_connect_refresh_token')
    dispatch(clearUserProfile())
    handleCloseMenu()
    navigate('/landing')
  }

  if (shouldHideHeader) return null

  return (
    <AppBar
      position="sticky"
      elevation={0}
      role="banner"
      aria-label={t('header.mainNavigation', 'Main navigation')}
      sx={{ color: 'text.primary' }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ minHeight: '72px !important', justifyContent: 'space-between', gap: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, height: '100%', gap: { md: 2, lg: 3 } }}>
            <Logo size={32} />
            <IconButton
              onClick={handleOpenNav}
              aria-label={t('header.menu', 'Menu')}
              aria-haspopup="menu"
              aria-expanded={navMenuOpen}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'text.primary', ml: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={(theme) => ({
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                position: 'relative',
                borderRadius: 20,
                backgroundColor: alpha(theme.palette.background.paper, 0.82),
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: `0 14px 34px ${alpha(theme.palette.common.black, 0.05)}`,
                backdropFilter: 'blur(14px)',
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
                width: { md: 220, lg: 320, xl: 380 },
                transition: 'all 0.3s',
                height: 42,
              })}
            >
              <Box
                sx={{
                  p: (theme) => theme.spacing(0, 1.5),
                  height: '100%',
                  position: 'absolute',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'secondary.main',
                }}
              >
                <SearchIcon />
              </Box>
              <InputBase
                placeholder={t('header.search')}
                inputProps={{ 'aria-label': t('header.search') }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`)
                    setSearchQuery('')
                  }
                }}
                sx={{
                  color: 'inherit',
                  width: '100%',
                  '& .MuiInputBase-input': {
                    p: (theme) => theme.spacing(1.35, 1.5, 1.35, 0),
                    paddingInlineStart: (theme) => `calc(1em + ${theme.spacing(4.4)})`,
                    transition: (theme) => theme.transitions.create('width'),
                    width: '100%',
                    fontSize: '0.95rem',
                  },
                }}
              />
            </Box>
          </Box>

          <Stack direction="row" spacing={{ xs: 1, md: 1.5 }} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', height: '72px', flexShrink: 0 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.link || (item.link !== '/' && pathname.startsWith(item.link + '/'))
              return (
                <Box
                  key={item.link}
                  component={Link}
                  to={item.link}
                  aria-current={isActive ? 'page' : undefined}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    height: '100%',
                    position: 'relative',
                    color: isActive ? 'text.primary' : 'text.secondary',
                    '&:hover': { color: 'text.primary' },
                    width: { xs: '40px', md: '60px', lg: '72px' },
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    gap: 0.3,
                  }}
                >
                  <Badge color="error" variant={item.badgeCount > 9 ? 'standard' : 'dot'} badgeContent={item.badgeCount} invisible={!item.hasBadge} max={99}>
                    {React.cloneElement(item.icon, { sx: { fontSize: 26 } })}
                  </Badge>
                  <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, fontSize: '12px', fontWeight: isActive ? 700 : 500, lineHeight: 1.2 }}>
                    {item.label}
                  </Typography>
                </Box>
              )
            })}
          </Stack>

          {/* Right: Notifications + Profile */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minWidth: 0, height: '100%', gap: 1.5 }}>
            {isAuthenticated && <HeaderProjectsButton />}
            <Box
              component={Link}
              to="/alerts"
              aria-label={t('nav.alerts')}
              title={t('nav.alerts')}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: 'action.selected', color: 'text.primary' },
              }}
            >
              <Badge color="error" variant={unreadCount > 9 ? 'standard' : 'dot'} badgeContent={unreadCount} invisible={unreadCount === 0} max={99}>
                <NotificationsIcon sx={{ fontSize: 22 }} />
              </Badge>
            </Box>
            <Box
              onClick={handleOpenMenu}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenMenu(e); } }}
              role="button"
              tabIndex="0"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderInlineStart: '1px solid',
                borderColor: 'divider',
                paddingInlineStart: { xs: 1.5, md: 2.5 },
                height: '100%',
                cursor: 'pointer',
                gap: 0.3,
              }}
            >
              <UserAvatar src={avatarSrc} name={fullName} role={user?.role} gender={profile?.gender} sx={(theme) => ({ width: 32, height: 32, boxShadow: `0 10px 24px ${alpha(theme.palette.common.black, 0.12)}` })} />
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.2 }}>
                  {t('header.me')}
                </Typography>
                <ArrowDropDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 280,
              borderRadius: RADIUS,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'visible',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.8 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <UserAvatar src={avatarSrc} name={fullName} role={user?.role} gender={profile?.gender} sx={{ width: 44, height: 44 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, color: 'text.primary' }} noWrap>
                {fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                {subLabel}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <MenuItem
          component={Link}
          to="/profile"
          onClick={handleCloseMenu}
          sx={{ py: 1.4, px: 2 }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('menu.viewProfile')}
            secondary={t('menu.profileDesc')}
          />
        </MenuItem>

        <MenuItem component={Link} to="/settings" onClick={handleCloseMenu} sx={{ py: 1.4, px: 2 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('menu.accountSettings')}
            secondary={t('menu.settingsDesc')}
          />
        </MenuItem>

        {user?.role === 'Employer' && (
          <MenuItem component={Link} to="/employer/dashboard" onClick={handleCloseMenu} sx={{ py: 1.4, px: 2 }}>
            <ListItemIcon>
              <BusinessIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={t('menu.companyDashboard', 'Company Dashboard')}
              secondary={t('menu.companyDashboardDesc', 'Manage your company page')}
            />
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ py: 1.4, px: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('menu.signOut')} secondary={t('menu.signOutDesc')} />
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={navAnchorEl}
        open={navMenuOpen}
        onClose={handleCloseNav}
        anchorOrigin={{ horizontal: dir === 'rtl' ? 'right' : 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: dir === 'rtl' ? 'right' : 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              mt: 1.5,
              minWidth: 240,
              borderRadius: RADIUS,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'visible',
            },
          },
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.link || (item.link !== '/' && pathname.startsWith(item.link + '/'))
          return (
            <MenuItem
              key={item.link}
              component={Link}
              to={item.link}
              onClick={handleCloseNav}
              sx={(theme) => ({
                py: 1.2,
                px: 2,
                gap: 1.5,
                color: isActive ? 'primary.main' : 'text.primary',
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
              })}
            >
              <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                {React.cloneElement(item.icon, { fontSize: 'small' })}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
            </MenuItem>
          )
        })}
      </Menu>
    </AppBar>
  )
}

export default Header
