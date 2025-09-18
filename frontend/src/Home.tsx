import gymImage from './assets/gym_image.jpg';
import CompanyTitle from './components/CompanyTitle';
import DrawerButton from './components/DrawerButton';
import SnackBarButton from './components/SnackBarButton';
// MUI
import { Container, Grid, Box, Button, Paper } from '@mui/material';
import { Link } from 'react-router';

function Home() {
    return (
        <>
            {/* Background */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: '100vh',
                    width: '100vw',
                    display: 'flex',
                    flexDirection: 'column', // default is column
                    justifyContent: 'center', // vertical centering
                    alignItems: 'center', // horizontal centering if needed
                }}
            >
                <Box
                    sx={{
                        position: 'fixed',
                        inset: 0,
                        minHeight: '100vh',
                        width: '100vw',
                        backgroundImage: `url(${gymImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'fixed', // keeps background static
                        zIndex: -1,
                    }}
                ></Box>
                {/* Background gradient cover */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0, // shorthand for top/right/bottom/left: 0
                        minHeight: '100vh',
                        width: '100vw',
                        background: 'linear-gradient(45deg,rgba(19, 22, 24, 1) 0%, rgba(19, 22, 24, 0.27) 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'fixed', // keeps background static
                        zIndex: 0,
                    }}
                />
                <CompanyTitle />
                <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6}>
                        <Grid size={4}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                Paper 3
                            </Paper>
                        </Grid>
                        <Grid size={8}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                <SnackBarButton />
                            </Paper>
                        </Grid>
                        <Grid size={6}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                <DrawerButton />
                            </Paper>
                        </Grid>
                        <Grid size={6}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                <Button component={Link} to='/Login' variant='contained'>
                                    Login Page
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}

export default Home;
