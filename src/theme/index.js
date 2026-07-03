import { createTheme, alpha } from '@mui/material/styles'

const darkPurple = {
  50: '#F3EFF9',
  100: '#D9CFED',
  200: '#BFADD9',
  300: '#9E85C2',
  400: '#7D5DAB',
  500: '#5C3594',
  600: '#4B2A7A',
  700: '#3D1C6E',
  800: '#2D1055',
  900: '#1F0A3B',
  main: '#3D1C6E',
  light: '#5C3594',
  dark: '#2D1055',
  contrastText: '#FFFFFF',
}

const darkNavy = {
  50: '#EBEEF5',
  100: '#C7CFE2',
  200: '#A0ADCC',
  300: '#768BB5',
  400: '#576FA2',
  500: '#3B5591',
  600: '#2E4782',
  700: '#1F3670',
  800: '#13294B',
  900: '#0B1B3D',
  main: '#1F3670',
  light: '#3B5591',
  dark: '#13294B',
  contrastText: '#FFFFFF',
}

export const getTheme = (direction) =>
  createTheme({
    direction,
    palette: {
      primary: darkPurple,
      secondary: darkNavy,
      background: {
        default: '#F6F4FA',
        paper: '#FFFFFF',
        light: '#FBF9FE',
      },
      text: {
        primary: '#1F0A3B',
        secondary: '#5C5580',
        disabled: '#B5AECB',
      },
      divider: alpha('#1F0A3B', 0.08),
      success: {
        main: '#16A34A',
        light: '#DCFCE7',
        dark: '#15803D',
      },
      error: {
        main: '#DC2626',
        light: '#FEE2E2',
        dark: '#B91C1C',
      },
      warning: {
        main: '#F59E0B',
        light: '#FEF3C7',
        dark: '#D97706',
      },
      info: {
        main: '#3B82F6',
        light: '#DBEAFE',
        dark: '#2563EB',
      },
      grey: {
        50: '#F9F8FB',
        100: '#F2F0F6',
        200: '#E8E5EE',
        300: '#D4CFE0',
        400: '#B5AECB',
        500: '#8F86AD',
        600: '#6B6390',
        700: '#4D4573',
        800: '#332C55',
        900: '#1A1533',
      },
    },
    typography: {
      fontFamily: direction === 'ar'
        ? '"Noto Sans Arabic", "Tajawal", sans-serif'
        : '"Inter", "Roboto", sans-serif',
      h1: { fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.2 },
      h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.25 },
      h3: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.3 },
      h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
      h5: { fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
      subtitle1: { fontWeight: 500, fontSize: '0.95rem', color: '#5C5580' },
      subtitle2: { fontWeight: 500, fontSize: '0.85rem', color: '#5C5580' },
      body1: { fontSize: '0.95rem', lineHeight: 1.6 },
      body2: { fontSize: '0.85rem', lineHeight: 1.55 },
      caption: { fontSize: '0.75rem', fontWeight: 500, color: '#8F86AD' },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(31, 10, 59, 0.04)',
      '0px 4px 8px rgba(31, 10, 59, 0.04)',
      '0px 4px 12px rgba(31, 10, 59, 0.05)',
      '0px 6px 16px rgba(31, 10, 59, 0.05)',
      '0px 8px 20px rgba(31, 10, 59, 0.06)',
      '0px 10px 24px rgba(31, 10, 59, 0.06)',
      '0px 12px 28px rgba(31, 10, 59, 0.07)',
      '0px 14px 32px rgba(31, 10, 59, 0.07)',
      '0px 16px 36px rgba(31, 10, 59, 0.08)',
      '0px 18px 40px rgba(31, 10, 59, 0.08)',
      '0px 20px 44px rgba(31, 10, 59, 0.09)',
      '0px 22px 48px rgba(31, 10, 59, 0.09)',
      '0px 24px 52px rgba(31, 10, 59, 0.10)',
      '0px 26px 56px rgba(31, 10, 59, 0.10)',
      '0px 28px 60px rgba(31, 10, 59, 0.11)',
      '0px 30px 64px rgba(31, 10, 59, 0.11)',
      '0px 32px 68px rgba(31, 10, 59, 0.12)',
      '0px 34px 72px rgba(31, 10, 59, 0.12)',
      '0px 36px 76px rgba(31, 10, 59, 0.13)',
      '0px 38px 80px rgba(31, 10, 59, 0.13)',
      '0px 40px 84px rgba(31, 10, 59, 0.14)',
      '0px 42px 88px rgba(31, 10, 59, 0.14)',
      '0px 44px 92px rgba(31, 10, 59, 0.15)',
      '0px 46px 96px rgba(31, 10, 59, 0.15)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#F6F4FA',
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 999,
            padding: '10px 24px',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
          },
          contained: {
            background: `linear-gradient(135deg, ${darkPurple.main}, ${darkNavy.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${darkPurple.dark}, ${darkNavy.dark})`,
            },
            '&:active': {
              background: darkNavy.dark,
            },
          },
          outlined: {
            borderColor: alpha(darkPurple.main, 0.25),
            color: darkPurple.main,
            '&:hover': {
              backgroundColor: alpha(darkPurple.main, 0.04),
              borderColor: darkPurple.main,
            },
          },
          text: {
            color: darkPurple.main,
            '&:hover': {
              backgroundColor: alpha(darkPurple.main, 0.04),
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.78)',
            backdropFilter: 'blur(14px)',
            borderBottom: `1px solid ${alpha('#1F0A3B', 0.08)}`,
            color: '#1F0A3B',
            boxShadow: '0 12px 28px rgba(31, 10, 59, 0.04)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${alpha('#1F0A3B', 0.06)}`,
            boxShadow: '0 4px 12px rgba(31, 10, 59, 0.04)',
            transition: 'all 0.25s ease',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(31, 10, 59, 0.08)',
              borderColor: alpha(darkPurple.main, 0.12),
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: '#FFFFFF',
              transition: 'all 0.2s ease',
              '& fieldset': {
                borderColor: alpha('#1F0A3B', 0.12),
              },
              '&:hover fieldset': {
                borderColor: alpha(darkPurple.main, 0.3),
              },
              '&.Mui-focused fieldset': {
                borderColor: darkPurple.main,
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: darkPurple.main,
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 500,
            fontSize: '0.8rem',
          },
          filled: {
            backgroundColor: alpha(darkPurple.main, 0.08),
            color: darkPurple.main,
            '&:hover': {
              backgroundColor: alpha(darkPurple.main, 0.12),
            },
          },
          outlined: {
            borderColor: alpha(darkPurple.main, 0.2),
            color: darkPurple.main,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: '0 10px 24px rgba(31, 10, 59, 0.12)',
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          dot: {
            backgroundColor: '#DC2626',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            '&.Mui-selected': {
              color: darkPurple.main,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: darkPurple.main,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: alpha('#1F0A3B', 0.08),
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 6px',
            padding: '10px 12px',
            '&:hover': {
              backgroundColor: alpha(darkPurple.main, 0.04),
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            border: `1px solid ${alpha('#1F0A3B', 0.08)}`,
            boxShadow: '0 18px 40px rgba(31, 10, 59, 0.08)',
            overflow: 'visible',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: darkNavy.dark,
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: '0.75rem',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            backgroundColor: alpha(darkPurple.main, 0.08),
          },
          bar: {
            borderRadius: 999,
            background: `linear-gradient(135deg, ${darkPurple.main}, ${darkNavy.main})`,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          track: {
            borderRadius: 999,
          },
          thumb: {
            boxShadow: '0 2px 4px rgba(31, 10, 59, 0.12)',
          },
          switchBase: {
            '&.Mui-checked': {
              color: darkPurple.main,
              '& + .MuiSwitch-track': {
                backgroundColor: darkPurple.main,
              },
            },
          },
        },
      },
    },
  })
