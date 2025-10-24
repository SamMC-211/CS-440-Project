// Backround image needs to be imported
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Background from './components/Background';
import gymImage from './assets/gym_image.jpg';
// MUI
import { Box, Card, CardContent, Typography, Stack, TextField, Button, Alert, CircularProgress, Backdrop, InputAdornment, IconButton, Container } from '@mui/material';

// Login Page Imports
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import CustomHeader from './components/CustomHeader';

const EMAIL_REGEX = /\S+@\S+\.\S+/g;

function Login() {
    // Backend login stuff
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log('submit');

        //Error check email
        if (!email.match(EMAIL_REGEX) && password != '') {
            console.log('error');
            setError('Email is invalid');
            setLoading(false);
            return;
        }

        //Tries a post request
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // << important to include cookies
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Login failed');
                return;
            }
            // success -> navigate to home
            navigate('/home');
        } catch (err) {
            setError('Network error');
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    //Actual page content
    return (
        <>
            <Background />
            <Box
                sx={{
                    minHeight: '100vh', // full viewport height
                    width: '100vw',
                    display: 'flex', // use flexbox
                    justifyContent: 'center', // horizontal centering
                    alignItems: 'center', // vertical centering
                    padding: 2, // optional padding
                }}
            >
                <Stack spacing={2} direction={'column'} alignItems={'center'}>
                    <CustomHeader text='Schedule Fit' variant='h1' margin={30} />
                    <Card sx={{ width: 350, padding: 2, zIndex: 1, position: 'relative' }}>
                        <CardContent>
                            <Typography variant='h5' component='div' textAlign='center' gutterBottom>
                                Login
                            </Typography>

                            {/* Login stuff??? */}
                            {error && (
                                <Alert severity='error' sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* Wrap in a form element */}
                            <form onSubmit={submit} noValidate>
                                <Stack spacing={2}>
                                    <TextField label='Email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} variant='outlined' fullWidth />
                                    <TextField
                                        label='Password'
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        variant='outlined'
                                        fullWidth
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position='end'>
                                                    <IconButton onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <Button type='submit' variant='contained' color='primary' fullWidth>
                                        Sign In
                                    </Button>
                                </Stack>
                            </form>
                            <Typography variant='body2' color='text.secondary' textAlign='center' mt={2}>
                                Don't have an account? <Link to={'/Register'}>Sign Up</Link>
                            </Typography>
                        </CardContent>
                    </Card>
                </Stack>

                {/* Loading overlay */}
                <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress color='inherit' />
                </Backdrop>
            </Box>
        </>
    );
}

export default Login;
