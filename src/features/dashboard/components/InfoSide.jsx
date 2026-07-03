import { Avatar, Box, Chip, Typography, Stack } from '@mui/material'
import WorkspacePremiumRounded from '@mui/icons-material/WorkspacePremiumRounded'
import {
    LocationOnOutlined,
    WorkOutlineOutlined,
    SchoolOutlined,
    PeopleAltOutlined,
    PostAddOutlined,
    TrendingUpOutlined,
} from '@mui/icons-material'

import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

export default function InfoSide() {
    const user = useSelector((state) => state.user.user)
    const profile = useSelector((state) => state.user.profile)
    const fullName = profile?.fullname || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || user?.username

    const { t } = useTranslation()


    const avatarSrc = profile?.avatar
    const Rscore = profile?.rScore || 0;

    return (
        <Box sx={{  width: 300, bgcolor: '#e1ccff73', borderRadius: 2, py: 2 }}>
            <Box sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column',gap: 2, textAlign: 'center', position: 'relative', top: -40 }}>
                <Box sx={{ mx: 'auto', width: '100%', height: '100%' }}>
                    <Avatar src={avatarSrc} sx={{ width: 150, height: 150, border: `4px solid #2D1055`, mb: 3.5, mx: 'auto' }} />
                    <Typography variant='h4' sx={{ fontWeight: 'bolder', mb: 1.5 }}>{fullName}</Typography>
                    {profile?.headline && (
                        <Typography variant="subtitle2" noWrap>
                            {profile.headline}
                        </Typography>
                    )}
                   
                    <Chip
                        icon={Rscore >= 4000 ? <img src="/Images/High-Score.gif" width={18} height={18} alt="Score" /> : <WorkspacePremiumRounded sx={{ color: 'primary.light' }} />}
                        label={`${t('profile.rScore')}: ${Rscore}`}
                        sx={{
                            bgcolor: 'background.paper',
                            color: 'primary.dark',
                            fontWeight: 800,
                            height: 34,
                            border: 'none',
                            my: 1.5,
                            position: 'relative',
                            zIndex: 2
                        }}
                    />
 <Box>
                        {user?.role && (
                        <Chip label={user.role} size="small" />
                    )}
                    </Box>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-evenly' }}>
                    <Box sx={{ width: '35%', bgcolor: '#fff', p: 2, borderRadius: 2 }}>
                        <PeopleAltOutlined sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                            {profile?.followersCount ?? 0}
                        </Typography>
                        <Typography variant="caption">
                            {t('profile.followers', 'Followers')}
                        </Typography>
                    </Box>

                    <Box sx={{ width: '35%', bgcolor: '#fff', p: 2, borderRadius: 2 }}>
                        <PeopleAltOutlined sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight="bold">
                            {profile?.followingCount ?? 0}
                        </Typography>
                        <Typography variant="caption">
                            {t('profile.following', 'Following')}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative', top: 20 }}>
                    {user?.professional?.skills?.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {user?.professional?.skills?.map((skill) => (
                                <Chip key={skill} label={skill} size="small" />
                            ))}
                        </Stack>
                    )}
                </Box>
            </Box>
        </Box >
    )
}
