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

const darkPurpleDark = {
  50: '#1A1533',
  100: '#2D1F4A',
  200: '#4B2A7A',
  300: '#5C3594',
  400: '#7D5DAB',
  500: '#9E85C2',
  600: '#BFADD9',
  700: '#D9CFED',
  800: '#EBE6F5',
  900: '#F3EFF9',
  main: '#9E85C2',
  light: '#BFADD9',
  dark: '#7D5DAB',
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

const darkNavyDark = {
  50: '#0B1B3D',
  100: '#13294B',
  200: '#1F3670',
  300: '#2E4782',
  400: '#3B5591',
  500: '#576FA2',
  600: '#768BB5',
  700: '#A0ADCC',
  800: '#C7CFE2',
  900: '#EBEEF5',
  main: '#768BB5',
  light: '#A0ADCC',
  dark: '#576FA2',
  contrastText: '#FFFFFF',
}

const lightPalette = {
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
  success: { main: '#16A34A', light: '#DCFCE7', dark: '#15803D' },
  error: { main: '#DC2626', light: '#FEE2E2', dark: '#B91C1C' },
  warning: { main: '#F59E0B', light: '#FEF3C7', dark: '#D97706' },
  info: { main: '#3B82F6', light: '#DBEAFE', dark: '#2563EB' },
  grey: {
    50: '#F9F8FB', 100: '#F2F0F6', 200: '#E8E5EE', 300: '#D4CFE0',
    400: '#B5AECB', 500: '#8F86AD', 600: '#6B6390', 700: '#4D4573',
    800: '#332C55', 900: '#1A1533',
  },
}

const darkPalette = {
  primary: darkPurpleDark,
  secondary: darkNavyDark,
  background: {
    default: '#0F0B1A',
    paper: '#1A1533',
    light: '#1F1A38',
  },
  text: {
    primary: '#E8E2F2',
    secondary: '#A89FC8',
    disabled: '#5C5580',
  },
  divider: alpha('#E8E2F2', 0.08),
  success: { main: '#4ADE80', light: '#052E16', dark: '#22C55E' },
  error: { main: '#F87171', light: '#450A0A', dark: '#EF4444' },
  warning: { main: '#FBBF24', light: '#451A03', dark: '#F59E0B' },
  info: { main: '#60A5FA', light: '#0C1929', dark: '#3B82F6' },
  grey: {
    50: '#1A1533', 100: '#2D1F4A', 200: '#4B2A7A', 300: '#5C5580',
    400: '#6B6390', 500: '#8F86AD', 600: '#A89FC8', 700: '#BFADD9',
    800: '#D9CFED', 900: '#EBE6F5',
  },
}

export const getTheme = (direction, mode = 'light') => {
  const isLight = mode === 'light'
  const palette = isLight ? lightPalette : darkPalette
  const p = palette.primary
  const s = palette.secondary
  const bg = palette.background
  const txt = palette.text
  const div = palette.divider

  const shadowColor = isLight ? '31, 10, 59' : '0, 0, 0'

  return createTheme({
    direction,
    palette: { mode, ...palette },
    typography: {
      fontFamily: direction === 'ar'
        ? '"Almarai", sans-serif'
        : '"Inter", "Roboto", sans-serif',
      h1: { fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.2 },
      h2: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.25 },
      h3: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.3 },
      h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
      h5: { fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
      subtitle1: { fontWeight: 500, fontSize: '0.95rem', color: txt.secondary },
      subtitle2: { fontWeight: 500, fontSize: '0.85rem', color: txt.secondary },
      body1: { fontSize: '0.95rem', lineHeight: 1.6 },
      body2: { fontSize: '0.85rem', lineHeight: 1.55 },
      caption: { fontSize: '0.75rem', fontWeight: 500, color: palette.grey[500] },
    },
    shape: { borderRadius: 12 },
    shadows: [
      'none',
      `0px 2px 4px rgba(${shadowColor}, 0.04)`,
      `0px 4px 8px rgba(${shadowColor}, 0.04)`,
      `0px 4px 12px rgba(${shadowColor}, 0.05)`,
      `0px 6px 16px rgba(${shadowColor}, 0.05)`,
      `0px 8px 20px rgba(${shadowColor}, 0.06)`,
      `0px 10px 24px rgba(${shadowColor}, 0.06)`,
      `0px 12px 28px rgba(${shadowColor}, 0.07)`,
      `0px 14px 32px rgba(${shadowColor}, 0.07)`,
      `0px 16px 36px rgba(${shadowColor}, 0.08)`,
      `0px 18px 40px rgba(${shadowColor}, 0.08)`,
      `0px 20px 44px rgba(${shadowColor}, 0.09)`,
      `0px 22px 48px rgba(${shadowColor}, 0.09)`,
      `0px 24px 52px rgba(${shadowColor}, 0.10)`,
      `0px 26px 56px rgba(${shadowColor}, 0.10)`,
      `0px 28px 60px rgba(${shadowColor}, 0.11)`,
      `0px 30px 64px rgba(${shadowColor}, 0.11)`,
      `0px 32px 68px rgba(${shadowColor}, 0.12)`,
      `0px 34px 72px rgba(${shadowColor}, 0.12)`,
      `0px 36px 76px rgba(${shadowColor}, 0.13)`,
      `0px 38px 80px rgba(${shadowColor}, 0.13)`,
      `0px 40px 84px rgba(${shadowColor}, 0.14)`,
      `0px 42px 88px rgba(${shadowColor}, 0.14)`,
      `0px 44px 92px rgba(${shadowColor}, 0.15)`,
      `0px 46px 96px rgba(${shadowColor}, 0.15)`,
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: bg.default },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
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
            background: `linear-gradient(135deg, ${p.main}, ${s.main})`,
            '&:hover': { background: `linear-gradient(135deg, ${p.dark}, ${s.dark})` },
            '&:active': { background: s.dark },
          },
          outlined: {
            borderColor: alpha(p.main, 0.25),
            color: p.main,
            '&:hover': {
              backgroundColor: alpha(p.main, 0.04),
              borderColor: p.main,
            },
          },
          text: {
            color: p.main,
            '&:hover': { backgroundColor: alpha(p.main, 0.04) },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? 'rgba(255,255,255,0.78)' : 'rgba(15,11,26,0.82)',
            backdropFilter: 'blur(14px)',
            borderBottom: `1px solid ${div}`,
            color: txt.primary,
            boxShadow: `0 12px 28px rgba(${shadowColor}, 0.04)`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${div}`,
            boxShadow: `0 4px 12px rgba(${shadowColor}, 0.04)`,
            transition: 'all 0.25s ease',
            '&:hover': {
              boxShadow: `0 8px 24px rgba(${shadowColor}, 0.08)`,
              borderColor: alpha(p.main, 0.12),
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: isLight ? '#FFFFFF' : alpha('#FFFFFF', 0.04),
              transition: 'all 0.2s ease',
              '& fieldset': { borderColor: div },
              '&:hover fieldset': { borderColor: alpha(p.main, 0.3) },
              '&.Mui-focused fieldset': { borderColor: p.main, borderWidth: 2 },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: p.main },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isLight ? '#FFFFFF' : alpha('#FFFFFF', 0.04),
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 999, fontWeight: 500, fontSize: '0.8rem' },
          filled: {
            backgroundColor: alpha(p.main, 0.08),
            color: p.main,
            '&:hover': { backgroundColor: alpha(p.main, 0.12) },
          },
          outlined: {
            borderColor: alpha(p.main, 0.2),
            color: p.main,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { boxShadow: `0 10px 24px rgba(${shadowColor}, 0.12)` },
        },
      },
      MuiBadge: {
        styleOverrides: { dot: { backgroundColor: '#DC2626' } },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            '&.Mui-selected': { color: p.main },
          },
        },
      },
      MuiTabs: {
        styleOverrides: { indicator: { backgroundColor: p.main } },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: div } },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 6px',
            padding: '10px 12px',
            '&:hover': { backgroundColor: alpha(p.main, 0.04) },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            border: `1px solid ${div}`,
            boxShadow: `0 18px 40px rgba(${shadowColor}, 0.08)`,
            overflow: 'visible',
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: s.dark,
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: '0.75rem',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, backgroundColor: alpha(p.main, 0.08) },
          bar: { borderRadius: 999, background: `linear-gradient(135deg, ${p.main}, ${s.main})` },
        },
      },
      MuiSkeleton: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiSwitch: {
        styleOverrides: {
          track: { borderRadius: 999 },
          thumb: { boxShadow: `0 2px 4px rgba(${shadowColor}, 0.12)` },
          switchBase: {
            '&.Mui-checked': {
              color: p.main,
              '& + .MuiSwitch-track': { backgroundColor: p.main },
            },
          },
        },
      },
    },
  })
}
