import { useMemo } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import stylisRTLPlugin from 'stylis-plugin-rtl'
import { useTranslation } from 'react-i18next'
import { getTheme } from './index'

const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [stylisRTLPlugin],
})

const ltrCache = createCache({
  key: 'mui-ltr',
})

function ThemeProvider({ children }) {
  const { i18n } = useTranslation()
  const direction = i18n.language === 'ar' ? 'rtl' : 'ltr'

  const theme = useMemo(() => getTheme(direction), [direction])

  return (
    <CacheProvider value={direction === 'rtl' ? rtlCache : ltrCache}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </CacheProvider>
  )
}

export default ThemeProvider
