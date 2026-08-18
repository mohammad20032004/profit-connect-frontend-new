import { Paper, Typography } from '@mui/material'

export default function EmptyState({ icon, text, action }) {
  return (
    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}>
      {icon}
      <Typography color="text.secondary" sx={{ mb: action ? 1.5 : 0 }}>{text}</Typography>
      {action}
    </Paper>
  )
}
