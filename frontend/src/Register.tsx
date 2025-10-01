// Backround image needs to be imported
import gymImage from './assets/gym_image.jpg';
import CustomHeader from './components/CustomHeader';
// MUI
import { Box, Card, CardContent, Typography, Stack, TextField, Button, Alert, CircularProgress, Backdrop } from '@mui/material';
// Login Page Imports
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
//Global snackbar element prop for page component
type RegisterProps = {
    setSnackbar: React.Dispatch<React.SetStateAction<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>>;
};

function Register({ setSnackbar }: RegisterProps) {
    // Backend login stuff
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null); //<Type of state (string or null)> (Initial value)
    const navigate = useNavigate();

    function validateEmail(e) {
        setError(null);
        if (e.target.value === '') {
            setError('');
        } else if (/\S+@\S+\.\S+/.test(e.target.value)) {
            setEmail(e.target.value);
        } else {
            setError('Email is invalid');
        }
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault(); //stop page from reloading upon form submission ()
        setLoading(true);
        setError(null);

        //Confirm password matches
        if (password !== confirmPassword) {
            setError('Passwords do no match');
            return;
        }

        //Tries a post request
        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Registration failed');
                return;
            }
            // success -> navigate to login
            navigate('/login');
            //Snackbar popup to inform user that their account was successfully registered
            setSnackbar({ open: true, message: 'Account Registered', severity: 'success' });
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
            <Box
                sx={{
                    minHeight: '100vh', // full viewport height
                    minWidth: '100vw',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
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
                        background: 'linear-gradient(45deg,rgba(19, 22, 24, 1) 0%, rgba(19, 22, 24, 0.27) 100%)',
                    }}
                />
                <CustomHeader text='Schedule Fit' variant='h1' margin={30} />
                <Card sx={{ width: 650, padding: 2, zIndex: 1, position: 'relative' }}>
                    <CardContent>
                        <Typography variant='h5' component='div' textAlign='center' gutterBottom>
                            Sign Up
                        </Typography>

                        {/* Login stuff??? */}
                        {error && (
                            <Alert severity='error' sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Wrap in a form element */}
                        <form onSubmit={submit}>
                            <Stack spacing={2}>
                                <Stack direction='row' spacing={2}>
                                    <TextField label='First Name' value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
                                    <TextField label='Last Name' value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
                                </Stack>
                                <TextField label='Email' type='email' onChange={(e) => setEmail(e.target.value)} onBlur={(e) => validateEmail(e)} variant='outlined' fullWidth />
                                <TextField label='Password' type={showPassword ? 'text' : 'password'} onChange={(e) => setPassword(e.target.value)} variant='outlined' fullWidth />
                                <TextField label='Confirm Password' type='password' onChange={(e) => setConfirmPassword(e.target.value)} variant='outlined' fullWidth />

                                <Button type='submit' variant='contained' color='primary' fullWidth>
                                    Register
                                </Button>
                            </Stack>
                        </form>
                    </CardContent>
                </Card>
                {/* Loading overlay */}
                <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress color='inherit' />
                </Backdrop>
            </Box>
        </>
    );
}

export default Register;
