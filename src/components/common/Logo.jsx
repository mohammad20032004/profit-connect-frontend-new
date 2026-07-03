import { Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

function Logo() {
  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 900, color: 'secondary.main', letterSpacing: '-0.5px' }}
        >
          Profit
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 400, color: 'text.primary', letterSpacing: '-0.5px' }}
        >
          Connect
        </Typography>
      </Box>
    </Link>
  )
}

export default Logo
