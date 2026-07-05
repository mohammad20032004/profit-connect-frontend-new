import { Box } from '@mui/material'
import { Link } from 'react-router-dom'

function Logo({ white = false, size = 36 }) {
  const src = white ? '/logo/white-logo.svg' : '/logo/logo.svg'

  return (
    <Link to="/" style={{ textDecoration: 'none', lineHeight: 0 }}>
      <Box
        component="img"
        src={src}
        alt="ProfitConnect"
        sx={{ height: size, width: 'auto' }}
      />
    </Link>
  )
}

export default Logo
