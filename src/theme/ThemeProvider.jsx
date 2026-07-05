import { useEffect, useMemo, useState } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import stylisRTLPlugin from 'stylis-plugin-rtl'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getTheme } from './index'

const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [stylisRTLPlugin],
})

const ltrCache = createCache({
  key: 'mui-ltr',
})

function useEffectiveMode() {
  const settingsTheme = useSelector((state) => state.user.user?.settings?.theme) || 'system'
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  if (settingsTheme === 'light') return 'light'
  if (settingsTheme === 'dark') return 'dark'
  return systemDark ? 'dark' : 'light'
}

function ThemeProvider({ children }) {
  const { i18n } = useTranslation()
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr'
  const mode = useEffectiveMode()
  const theme = useMemo(() => getTheme(direction, mode), [direction, mode])

  useEffect(() => {
    document.documentElement.setAttribute('dir', direction)
  }, [direction])

  return (
    <CacheProvider key={direction} value={direction === 'rtl' ? rtlCache : ltrCache}>
      <div dir={direction}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </div>
    </CacheProvider>
  )
}

export default ThemeProvider
