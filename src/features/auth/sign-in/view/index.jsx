import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Chip,
    Typography,
    TextField,
    Button,
    Link,
    InputAdornment,
    IconButton,
    Stack,
    Container
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { login } from '@/services/authService';
import { setAuthData } from '@/redux/slices/userSlice';
import Logo from '@/components/common/Logo';

export default function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const data = await login(formData);
            dispatch(setAuthData({ token: data?.token, user: data?.user }));
            localStorage.setItem('profit_connect_token', data?.token);
            alert('تم تسجيل الدخول بنجاح!');
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container
            maxWidth="xl"
            sx={{
                minHeight: '100vh',
                py: { xs: 3, md: 2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >    
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    height: { xs: 'auto', md: '88vh' },
                    minHeight: { md: '650px' },
                    width: '100%',
                    maxWidth: '1320px',
                    boxShadow: { xs: 'none', sm: '0 32px 80px rgba(12,8,24,0.18)' },
                    borderRadius: { xs: 0, sm: 2 },
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255,255,255,0.82)',
                    border: '1px solid rgba(31, 13, 66, 0.12)',
                    backdropFilter: 'blur(18px)',
                    mx: { xs: 0, md: 4, lg: 8 }
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        position: 'relative',
                        background: 'linear-gradient(160deg, rgba(12,24,40,0.95) 0%, rgba(26,8,53,0.9) 42%, rgba(61,28,110,0.7) 100%), url(/Images/login-photo.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        color: 'white',
                        p: { md: 2, lg: 3 },
                    }}
                >
                    <Box>
                        <Chip
                            label="Premium Career Experience"
                            sx={{
                                mb: 4,
                                bgcolor: 'rgba(255,255,255,0.14)',
                                color: '#ffffff',
                                border: '1px solid rgba(255,255,255,0.18)',
                                backdropFilter: 'blur(12px)',
                            }}
                        />
                        <Box sx={{ maxWidth: 520, py: { md: 1, lg: 5 } }}>
                            <Typography variant="h3" fontWeight="bold" sx={{ mb: 2, fontSize: { md: '2.35rem', lg: '3.1rem' }, lineHeight: 1.1 }}>
                                Welcome back to a sharper way to grow your network.
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'normal', opacity: 0.92, fontSize: { md: '1rem', lg: '1.08rem' }, maxWidth: 460 }}>
                                Access tailored opportunities, trusted connections, and a profile experience designed to make your next move feel effortless.
                            </Typography>
                        </Box>
                    </Box>


                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Box>
                            <Typography sx={{ fontSize: '0.85rem', opacity: 0.72 }}>Trusted by ambitious professionals</Typography>
                            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900 }}>24k+ active members</Typography>
                        </Box>
                       
                    </Box>
                </Box>

                <Box
                    sx={{
                        flex: 1,
                        width: { xs: '100%', md: 'auto' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(244,242,248,0.96) 100%)',
                        p: { xs: 2, sm: 4, md: 2.5 },
                        overflowY: 'auto'
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: '560px', px: { xs: 1, sm: 3 }, py: 2, mx: 'auto' }}>
                        <Logo />
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                            sx={{ mt: 3, color: 'text.primary', fontSize: { xs: '2rem', sm: '2.4rem' }, lineHeight: 1.15 }}
                        >
                            Sign in to continue
                        </Typography>
                        
                        <form noValidate onSubmit={handleSubmit}>
                            <Stack spacing={2.4}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                />
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={handleClickShowPassword} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 0 }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
                                    
                                    <Link href="#" underline="hover" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                        Forgot Password?
                                    </Link>
                                </Box>

                                <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ py: 1.55, fontSize: '1rem', borderRadius: 4, bgcolor:'#12082a' }}>
                                    {loading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </Stack>
                        </form>

                       

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                            Don&apos;t have an account?{' '}
                            <Link href="/sign-up" underline="hover" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                Sign up
                            </Link>
                        </Typography>
                    </Box>
                </Box>
                
            </Box>
        </Container>
    );
}