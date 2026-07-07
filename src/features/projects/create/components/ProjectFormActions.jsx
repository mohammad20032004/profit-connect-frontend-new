import React from 'react'
import { Stack, Button, CircularProgress } from '@mui/material'

export default function ProjectFormActions({ loading, valid, onSubmit, onCancel, t }) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 2.5 }}>
      <Button variant="outlined" onClick={onCancel} disabled={loading} size="small">{t('projects.cancel', 'Cancel')}</Button>
      <Button variant="contained" onClick={onSubmit} disabled={loading || !valid} size="small">
        {loading ? <CircularProgress size={18} sx={{ color: 'white' }} /> : t('projects.post', 'Post Project')}
      </Button>
    </Stack>
  )
}
