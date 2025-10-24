import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Home from './Home';
import Login from './Login';
import UserHome from './UserHome';
import Register from './Register';
// MUI Rec.
import { CssBaseline, Snackbar, Alert, Grow } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// Login with Backend
import RequireAuth from './components/RequireAuth';

const theme = createTheme({
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    margin: 0,
                    padding: 0,
                    backgroundColor: 'transparent', // or your bg
                    overflowX: 'hidden',
                },
                '#root': {
                    margin: 0,
                    padding: 0,
                    minHeight: '100vh',
                    maxWidth: '1280px',
                    textAlign: 'center',
                },
            },
        },
    },
    palette: {
        primary: {
            main: '#a93331', // your custom color
        },
        text: {
            // primary: '#a93331',
            // secondary: '#131618',
        },
        secondary: {
            main: '#ffffff',
        },
    },
});

function App() {
    //Global snackbar component
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info',
    });
    const handleClose = () => setSnackbar({ open: false, message: '', severity: 'success' });

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Routes>
                        <Route path='/' element={<Home />}></Route>
                        <Route path='/Login' element={<Login />}></Route>
                        <Route path='/Register' element={<Register setSnackbar={setSnackbar} />}></Route>
                        <Route
                            path='/Home'
                            element={
                                <RequireAuth>
                                    <UserHome />
                                </RequireAuth>
                            }
                        />
                    </Routes>
                    <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleClose} slots={{ transition: Grow }}>
                        <Alert onClose={handleClose} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Router>
            </ThemeProvider>
        </>
    );
}

export default App;
