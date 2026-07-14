import React, { useRef } from 'react'
import { Stack, Box, Avatar, Typography, alpha } from '@mui/material'
import Button from '@/ui/Button'

export default function StepAvatarReview({ form, setForm }) {
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return
      if (file.size > 5 * 1024 * 1024) return
      setForm((prev) => ({ ...prev, avatar: file }))
    }
  }

  const previewUrl = form.avatar instanceof File ? URL.createObjectURL(form.avatar) : null

  return (
    <Stack spacing={3} sx={{ alignItems: 'center' }}>
      <Box sx={{ animation: 'fadeUp 0.5s ease both', position: 'relative' }}>
        <Box sx={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3D1C6E, #1F3670)',
          opacity: 0.15, animation: 'pulse 2.5s ease-in-out infinite',
        }} />
        <Avatar src={previewUrl} sx={{
          width: 120, height: 120, fontSize: 40, bgcolor: '#3D1C6E',
          border: '3px solid white', boxShadow: '0 8px 32px rgba(61,28,110,0.2)',
          transition: 'all 0.4s ease',
          '&:hover': { transform: 'scale(1.04)' },
        }}>
          {form.firstName?.charAt(0)}{form.lastName?.charAt(0)}
        </Avatar>
      </Box>
      <Box sx={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />
        <Button variant="outlined" onClick={() => inputRef.current?.click()}
            sx={{
            px: 3, borderColor: '#3D1C6E44', color: '#3D1C6E',
            transition: 'all 0.25s ease',
            '&:hover': { borderColor: '#3D1C6E', bgcolor: 'rgba(61,28,110,0.04)', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(61,28,110,0.12)' },
          }}
        >
          {form.avatar ? 'Change Photo' : 'Upload Photo'}
        </Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ animation: 'fadeUp 0.4s ease 0.25s both' }}>JPG, PNG or WebP. Max 5MB.</Typography>
    </Stack>
  )
}
