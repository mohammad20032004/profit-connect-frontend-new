import React, { useState, useRef, useEffect } from 'react'
import { Stack, Box, Typography, TextField, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'

const OTP_LENGTH = 6

export default function StepEmailVerification({ form, onChange, errors }) {
  const { t } = useTranslation()
  const theme = useTheme()
  const [code, setCode] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH)
    setCode(val)
    if (val.length === OTP_LENGTH) {
      onChange('emailCode')({ target: { value: val } })
    }
  }

  return (
    <Stack spacing={3} sx={{ alignItems: 'center' }}>
      <Box sx={{ animation: 'fadeUp 0.5s ease both' }}>
        <Box sx={{
          width: 80, height: 80, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${theme.palette.primary.main}12`,
          border: `2px solid ${theme.palette.primary.main}25`,
        }}>
          <MarkEmailReadOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', animation: 'fadeUp 0.4s ease 0.1s both' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', mb: 0.5 }}>
          {t('auth.verifyEmailTitle')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth.verifyEmailDesc')} <strong>{form.email}</strong>
        </Typography>
      </Box>

      <Box sx={{ width: '100%', maxWidth: 320, animation: 'fadeUp 0.4s ease 0.2s both' }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          value={code}
          onChange={handleChange}
          inputProps={{
            maxLength: OTP_LENGTH,
            inputMode: 'numeric',
            style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.5em', direction: 'ltr' },
          }}
          placeholder="------"
          error={!!errors.emailCode}
          helperText={errors.emailCode || t('auth.verifyEmailHint')}
        />
      </Box>
    </Stack>
  )
}
