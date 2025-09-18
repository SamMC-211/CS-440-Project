// This is a "higher-order wrapper" you wrap around another component to enforce authentication
//There are two states "loading" and "authenticated"
// src/components/RequireAuth.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router';

// MUI Loading Backdrop
import { Backdrop, CircularProgress, Fade } from '@mui/material';

//React.ReactNode <- instead of JSX.Element
export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true); //true initially because we dont know if the user is authed yet
    const [authed, setAuthed] = useState(false); //false initially because we haven't checked yet

    // When the component mounts a fetch (get) request is made to the backend server
    useEffect(() => {
        let mounted = true;
        fetch('/api/me', { credentials: 'include' }) //cred: inclu. sends along the session cookie
            .then((r) => {
                if (!mounted) return;
                if (r.ok) setAuthed(true);
                setLoading(false);
            })
            .catch(() => {
                if (!mounted) return;
                setLoading(false);
                setAuthed(false);
            });
        return () => {
            mounted = false;
        };
    }, []); //[]=No dependencies will run once after rendered

    // While loading, show overlay on top of whatever page is rendered
    if (loading) {
        return (
            <Fade in={true} timeout={1000}>
                <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={true}>
                    <CircularProgress color='inherit' />
                </Backdrop>
            </Fade>
        );
    }
    if (!authed) return <Navigate to='/login' />;
    return children;
}
