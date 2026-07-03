import React from 'react'
import { Box, Container, Grid, Typography, Paper } from '@mui/material'
import InfoSide from '../components/InfoSide'
import PostsSection from '../components/PostsSection'

function DashboardView() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }} sx={{ py: 10 }}>
          <InfoSide />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PostsSection />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              position: 'sticky',
              top: 100,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Section 3
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DashboardView
