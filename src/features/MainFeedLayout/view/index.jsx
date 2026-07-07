import React from 'react'
import { Box, Container, Grid } from '@mui/material'
import InfoSide from '../components/InfoSide'
import PostsSection from '../components/PostsSection'
import TopCompaniesSidebar from '../components/TopCompaniesSidebar'

function DashboardView() {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 88px)',
        overflow: 'hidden',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ height: '100%', py: 2 }}
      >
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%', overflow: 'hidden', py: 'auto' }}>
            <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <InfoSide />
            </Box>
          </Grid>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ height: '100%', overflow: 'hidden' }}
          >
            <Box sx={{ height: '100%', overflow: 'hidden' }}>
              <PostsSection />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%', overflow: 'hidden' }}>
            <TopCompaniesSidebar />
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DashboardView
