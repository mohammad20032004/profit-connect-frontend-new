import React from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Container,
  Stack,
  Button,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import WorkIcon from '@mui/icons-material/Work'
import BusinessIcon from '@mui/icons-material/Business'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { Link, useLocation } from 'react-router-dom'
import Logo from '../../components/common/Logo'

const navItems = [
  { label: 'Find Jobs', icon: <WorkIcon />, link: '/jobs' },
  { label: 'Companies', icon: <BusinessIcon />, link: '/jobs/companies' },
  { label: 'Salaries', icon: <AttachMoneyIcon />, link: '/jobs/salaries' },
]

const JobHeader = () => {
  const { pathname } = useLocation()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        color: '#000',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '52px !important', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Logo />
          </Box>

          <Stack direction="row" spacing={{ xs: 2, md: 4 }} alignItems="center" sx={{ height: '52px' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.link
              return (
                <Link key={item.label} to={item.link} style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      height: '52px',
                      position: 'relative',
                      color: isActive ? '#191919' : '#666666',
                      '&:hover': { color: '#191919' },
                      width: { md: '80px', xs: 'auto' },
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 26 } })}
                    <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, fontSize: '12px' }}>
                      {item.label}
                    </Typography>
                    {isActive && (
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        bgcolor: '#191919',
                      }} />
                    )}
                  </Box>
                </Link>
              )
            })}

            <Link to="/" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  height: '52px',
                  position: 'relative',
                  color: pathname === '/' ? '#191919' : '#666666',
                  '&:hover': { color: '#191919' },
                  width: { md: '60px', xs: 'auto' },
                  borderLeft: '1px solid #e0e0e0',
                  pl: 3,
                }}
              >
                <HomeIcon sx={{ fontSize: 26 }} />
                <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, fontSize: '12px' }}>
                  Home
                </Typography>
                {pathname === '/' && (
                  <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    bgcolor: '#191919',
                  }} />
                )}
              </Box>
            </Link>

            <Link to="/jobs/post" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#0a66c2',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  py: 0.5,
                  borderRadius: '16px',
                  fontSize: '14px',
                  '&:hover': { bgcolor: '#004182' },
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Post a Job
              </Button>
            </Link>

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              height: '52px',
            }}>
              <Avatar
                alt="User Profile"
                src="https://i.pravatar.cc/150?img=68"
                sx={{ width: 24, height: 24 }}
              />
              <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, color: '#666', fontSize: '12px' }}>
                Me
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default JobHeader
