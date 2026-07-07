import React from 'react'
import { TextField, InputAdornment } from '@mui/material'
import { CalendarMonthOutlined } from '@mui/icons-material'

export default function ProjectDatePicker({ value, onChange, label, t }) {
  return (
    <TextField
      type="date"
      value={value}
      onChange={onChange}
      fullWidth
      size="small"
      InputLabelProps={{ shrink: true }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <CalendarMonthOutlined sx={{ color: 'primary.main', fontSize: 20 }} />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: 'background.light',
          transition: 'all 0.2s',
          '&:hover': { borderColor: 'primary.light' },
          '&.Mui-focused': {
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}22`,
          },
        },
        '& .MuiOutlinedInput-input': {
          color: value ? 'text.primary' : 'text.secondary',
          fontWeight: 500,
        },
      }}
    />
  )
}
