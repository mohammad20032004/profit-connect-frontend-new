import { Box, Container, Grid, Stack } from '@mui/material'
import InfoSide from '../components/InfoSide'
import PostsSection from '../components/PostsSection'
import TopCompaniesSidebar from '../components/TopCompaniesSidebar'
import LatestJobsSidebar from '../components/LatestJobsSidebar'
import AnimatedBox from '@/components/AnimatedBox'

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
        <Grid container spacing={2} sx={{ height: '100%' }}>
          <Grid
            size={{ xs: 12, lg: 3 }}
            sx={{ height: '100%', overflow: 'hidden', py: 'auto', display: { xs: 'none', md: 'none', lg: 'block' } }}
          >
            <AnimatedBox delay={0} sx={{ height: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <InfoSide />
            </AnimatedBox>
          </Grid>
          <Grid
            size={{ xs: 12, lg: 6 }}
            sx={{ height: '100%', overflow: 'hidden' }}
          >
            <AnimatedBox delay={0.1} sx={{ height: '100%', overflow: 'hidden' }}>
              <PostsSection />
            </AnimatedBox>
          </Grid>
          <Grid
            size={{ xs: 12, lg: 3 }}
            sx={{ height: '100%', overflow: 'auto', display: { xs: 'none', md: 'none', lg: 'block' }, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: 2 } }}
          >
            <Stack spacing={2}>
              <AnimatedBox delay={0.2}>
                <TopCompaniesSidebar />
              </AnimatedBox>
              <AnimatedBox delay={0.3}>
                <LatestJobsSidebar />
              </AnimatedBox>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DashboardView
