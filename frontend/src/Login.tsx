import gymImage from './assets/gym_image.jpg';
// MUI
import { Card, CardContent, Typography, TextField, Button, Stack, Box } from '@mui/material';

function Login() {
    return (
        <>
            <Box
                sx={{
                    minHeight: '100vh', // full viewport height
                    minWidth: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // backgroundColor: '#f0f2f5', // light gray background
                    // Backticks to insert JS into CSS
                    backgroundImage: `url(${gymImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0, // shorthand for top/right/bottom/left: 0
                        background: 'linear-gradient(45deg,rgba(19, 22, 24, 1) 0%, rgba(19, 22, 24, 0.13) 100%)',
                    }}
                />
                <Typography
                    variant='h1'
                    fontWeight='bold'
                    sx={{
                        position: 'absolute',
                        top: '25%',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-50%)',
                        color: '#a93331',
                        textAlign: 'center',
                        zIndex: 2,
                        textShadow: '2px 2px 20px #494746',
                    }}
                >
                    Schedule Fit
                </Typography>
                <Card sx={{ width: 350, padding: 2, zIndex: 1, position: 'relative' }}>
                    <CardContent>
                        <Typography variant='h5' component='div' textAlign='center' gutterBottom>
                            Login
                        </Typography>

                        <Stack spacing={2}>
                            <TextField label='Email' type='email' variant='outlined' fullWidth />
                            <TextField label='Password' type='password' variant='outlined' fullWidth />

                            <Button variant='contained' color='primary' fullWidth>
                                Sign In
                            </Button>
                        </Stack>

                        <Typography variant='body2' color='text.secondary' textAlign='center' mt={2}>
                            Don't have an account? <a href='#'>Sign Up</a>
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}

export default Login;
