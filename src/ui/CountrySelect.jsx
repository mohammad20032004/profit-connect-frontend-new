import { useTranslation } from 'react-i18next'
import { TextField, MenuItem } from '@mui/material'
import { COUNTRIES } from '@/data/locations'

export default function CountrySelect({ value, onChange, label, size = 'small', fullWidth = true, ...rest }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  return (
    <TextField
      select
      label={label}
      value={value || ''}
      onChange={onChange}
      size={size}
      fullWidth={fullWidth}
      {...rest}
    >
      {COUNTRIES.map((c) => (
        <MenuItem key={c.value} value={c.en}>{lang === 'ar' ? c.ar : c.en}</MenuItem>
      ))}
    </TextField>
  )
}
