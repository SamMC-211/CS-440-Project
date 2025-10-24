import gymImage from './assets/gym_image.jpg';
import CompanyTitle from './components/CompanyTitle';
import CustomHeader from './components/CustomHeader';
import Background from './components/Background';
// MUI
import { Container, Grid, Box, Button, Paper, Typography } from '@mui/material';
import { Link } from 'react-router';

function Home() {
    return (
        <>
            {/* Background */}
            <Background />
            <Button
                component={Link}
                to='/Login'
                variant='contained'
                sx={{
                    position: 'absolute',
                    width: 115,
                    height: 37,
                    top: 20,
                    right: 40,
                }}
            >
                Login
            </Button>
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
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column', // stack vertically
                        justifyContent: 'center',
                        alignItems: 'center', // horizontal centering
                        gap: 4, // spacing between children
                        width: '100%',
                        maxWidth: 'lg',
                    }}
                >
                    <CompanyTitle margin={50} />
                    <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
                        {/* <Grid container spacing={6}>
                        <Grid size={4}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                        <CustomHeader variant='h4' text='About Us' />
                        </Paper>
                        </Grid>
                        <Grid size={8}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                        <CustomHeader variant='h4' text='Mission Statement  ' />
                        </Paper>
                        </Grid>
                        <Grid size={12}>
                        <Button component={Link} to='/Login' variant='contained'>
                        Button
                        </Button>
                        </Grid>
                        <Grid size={12}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                        <CustomHeader text='Meet our Trainers' variant='h3' />
                        <Grid container spacing={4}>
                        <Grid size={6}>grid 1</Grid>
                        <Grid size={6}>grid 2</Grid>
                        <Grid size={6}>grid 3</Grid>
                        <Grid size={6}>grid 4</Grid>
                        </Grid>
                        </Paper>
                        </Grid>
                        </Grid> */}
                    </Container>
                </Box>
            </Box>
        </>
    );
}

export default Home;
