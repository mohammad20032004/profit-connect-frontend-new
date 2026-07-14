import React, { useMemo, useState } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  InputBase,
  Avatar,
  Container,
  Stack,
  Badge,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import HomeIcon from '@mui/icons-material/Home'
import PeopleIcon from '@mui/icons-material/People'
import WorkIcon from '@mui/icons-material/WorkOutlineOutlined'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AppsIcon from '@mui/icons-material/Apps'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import Logo from './common/Logo'
import LanguageSwitcher from './LanguageSwitcher'
import { clearUserProfile } from '../redux/slices/userSlice'

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user)
  const profile = useSelector((state) => state.user.profile)
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated)
  const unreadCount = useSelector((state) => state.notifications?.unreadCount || 0)
  const [anchorEl, setAnchorEl] = useState(null)

  const navItems = [
    { label: t('nav.home'), icon: <HomeIcon />, hasBadge: false, link: '/' },
    { label: t('nav.network'), icon: <PeopleIcon />, hasBadge: false, link: '/network' },
    { label: t('nav.projects'), icon: <WorkIcon />, hasBadge: false, link: '/projects' },
    { label: t('nav.alerts'), icon: <NotificationsIcon />, hasBadge: unreadCount > 0, badgeCount: unreadCount, link: '/alerts' },
  ]

  const hiddenRoutes = ['/sign-in', '/sign-up', '/landing', '/settings']
  const menuOpen = Boolean(anchorEl)

  const fullName = useMemo(
    () =>
      profile?.fullname ||
      [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
      user?.username ||
      'My Profile',
    [profile, user],
  )

  const subLabel = user?.email || user?.role || 'View profile'
  const avatarSrc = profile?.avatar || undefined

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
    window.localStorage.removeItem('profit_connect_token')
    dispatch(clearUserProfile())
    handleCloseMenu()
    navigate('/landing')
  }

  if (shouldHideHeader) return null

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ color: 'text.primary' }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{ minHeight: '72px !important', justifyContent: 'space-between', gap: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, height: '100%' }}>
            <Logo size={32} />
            <Box
              sx={(theme) => ({
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                position: 'relative',
                borderRadius: 999,
                backgroundColor: alpha(theme.palette.background.paper, 0.82),
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: `0 14px 34px ${alpha(theme.palette.common.black, 0.05)}`,
                backdropFilter: 'blur(14px)',
                '&:hover': {
                  backgroundColor: theme.palette.background.paper,
                },
                mr: 2,
                ml: { xs: 0, sm: 3 },
                width: { sm: 250, md: 330, lg: 380 },
                transition: 'all 0.3s',
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
                inputProps={{ 'aria-label': 'search' }}
                sx={{
                  color: 'inherit',
                  width: '100%',
                  '& .MuiInputBase-input': {
                    p: (theme) => theme.spacing(1.35, 1.5, 1.35, 0),
                    pl: (theme) => `calc(1em + ${theme.spacing(4.4)})`,
                    transition: (theme) => theme.transitions.create('width'),
                    width: '100%',
                    fontSize: '0.95rem',
                  },
                }}
              />
            </Box>
          </Box>

          <Stack direction="row" spacing={{ xs: 1.25, md: 2.5 }} sx={{ alignItems: 'center', height: '72px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.link || (item.link !== '/' && pathname.startsWith(item.link + '/'))
              return (
                <Link to={item.link} key={item.link} style={{ textDecoration: 'none', height: '100%' }}>
                  <Box
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
                      width: { md: '72px', xs: '42px' },
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
                </Link>
              )
            })}

            <Box
              onClick={handleOpenMenu}
              role="button"
              tabIndex="0"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: '1px solid',
                borderColor: 'divider',
                pl: { xs: 1.5, md: 2.5 },
                height: '100%',
                cursor: 'pointer',
                gap: 0.3,
              }}
            >
              <Avatar alt={fullName} src={avatarSrc} sx={(theme) => ({ width: 32, height: 32, boxShadow: `0 10px 24px ${alpha(theme.palette.common.black, 0.12)}` })}>
                {fullName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px', lineHeight: 1.2 }}>
                  {t('header.me')}
                </Typography>
                <ArrowDropDownIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
            </Box>

            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
                height: '100%',
                gap: 0.3,
              }}
            >
              <AppsIcon sx={{ fontSize: 24 }} />
              <Typography variant="caption" sx={{ fontSize: '12px', lineHeight: 1.2 }}>
                {t('header.forBusiness')}
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          sx: {
            mt: 1.5,
            minWidth: 280,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'visible',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.8 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar src={avatarSrc} sx={{ width: 44, height: 44 }}>
              {fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
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
            <PersonOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('menu.viewProfile')}
            secondary={t('menu.profileDesc')}
          />
        </MenuItem>

        <MenuItem component={Link} to="/settings" onClick={handleCloseMenu} sx={{ py: 1.4, px: 2 }}>
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t('menu.accountSettings')}
            secondary={t('menu.settingsDesc')}
          />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ py: 1.4, px: 2, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t('menu.signOut')} secondary={t('menu.signOutDesc')} />
        </MenuItem>
      </Menu>
    </AppBar>
  )
}

export default Header
