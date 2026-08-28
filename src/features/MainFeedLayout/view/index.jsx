﻿import { RADIUS } from '@/theme/tokens'
import { Box, Container, Grid, Stack, Divider } from '@mui/material'
import InfoSide from '../components/InfoSide'
import PostsSection from '../components/PostsSection'
import TopCompaniesSidebar from '../components/TopCompaniesSidebar'
import LatestJobsSidebar from '../components/LatestJobsSidebar'
import TopUsersSidebar from '../components/TopUsersSidebar'
import AnimatedBox from '@/components/AnimatedBox'

function DashboardView() {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 88px)',
        overflow: 'auto',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{ height: '100%', py: 2 }}
      >
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid
            size={{ xs: 12, lg: 2.5 }}
            sx={{ height: '100%', overflow: 'auto', py: 'auto', display: { xs: 'none', lg: 'block' }, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: RADIUS } }}
          >
            <Stack spacing={2}>
              <AnimatedBox delay={0} sx={{ width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <InfoSide variant="plain" />
                  <Divider sx={{ my: 1 }} />
                  <TopUsersSidebar variant="plain" />
                </Box>
              </AnimatedBox>
            </Stack>
          </Grid>
          <Grid
            size={{ xs: 12, lg: 7 }}
            sx={{ height: '100%', overflow: 'auto' }}
          >
            <AnimatedBox delay={0.1} sx={{ height: '100%', overflow: 'auto' }}>
              <PostsSection />
            </AnimatedBox>
          </Grid>
          <Grid
            size={{ xs: 12, lg: 2.5 }}
            sx={{ height: '100%', overflow: 'auto', display: { xs: 'none', lg: 'block' }, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: RADIUS } }}
          >
            <Stack spacing={2}>
              <AnimatedBox delay={0.2} sx={{ width: '100%' }}>
                <Box sx={{ width: '100%' }}>
                  <TopCompaniesSidebar variant="plain" />
                  <Divider sx={{ my: 1 }} />
                  <LatestJobsSidebar variant="plain" />
                </Box>
              </AnimatedBox>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DashboardView
