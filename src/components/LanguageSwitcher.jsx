import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import TranslateIcon from '@mui/icons-material/Translate'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
]

function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleOpen = (e) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const switchLanguage = (code) => {
    i18n.changeLanguage(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
    handleClose()
  }

  return (
    <>
      <IconButton onClick={handleOpen} size="small" sx={{ color: 'text.secondary' }}>
        <TranslateIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { mt: 1, minWidth: 160, borderRadius: 2, boxShadow: '0 12px 28px rgba(12,8,24,0.1)' },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => switchLanguage(lang.code)}
            selected={i18n.language === lang.code}
            sx={{ gap: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <Typography variant="body2">{lang.code === 'ar' ? '🇸🇦' : '🇺🇸'}</Typography>
            </ListItemIcon>
            <ListItemText primary={lang.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default LanguageSwitcher
