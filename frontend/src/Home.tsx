import gymImage from './assets/gym_image.jpg';
import CompanyTitle from './components/CompanyTitle';
import CustomHeader from './components/CustomHeader';
// MUI
import { Container, Grid, Box, Button, Paper, Typography } from '@mui/material';
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
                    justifyContent: 'flex-start', // vertical centering
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
                <CompanyTitle margin={50} />
                <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid container spacing={6}>
                        <Grid size={4}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                <CustomHeader variant='h4' text='About Us' />
                            </Paper>
                        </Grid>
                        <Grid size={8}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                <CustomHeader variant='h4' text='Mission Statement  ' />
                            </Paper>
                        </Grid>
                        <Grid size={12}>
                            <Button component={Link} to='/Login' variant='contained'>
                                Button
                            </Button>
                        </Grid>
                        <Grid size={12}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                <CustomHeader text='Meet our Trainers' variant='h3' />
                                <Grid container spacing={4}>
                                    <Grid size={6}>grid 1</Grid>
                                    <Grid size={6}>grid 2</Grid>
                                    <Grid size={6}>grid 3</Grid>
                                    <Grid size={6}>grid 4</Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                        <Grid size={6}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                <Typography variant='body1'>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse lacinia eros arcu, vel dapibus massa hendrerit hendrerit. Curabitur vel lobortis magna, sed vestibulum nulla. Fusce quis tristique leo.
                                    Aenean nunc velit, tincidunt in nisi id, eleifend aliquam quam. Ut ac ligula in sem tempor rutrum molestie ac odio. Cras erat arcu, bibendum nec lacinia vel, facilisis ut nisi. Nullam lectus ipsum,
                                    suscipit in libero non, hendrerit bibendum dolor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse lacinia eros arcu, vel dapibus massa hendrerit hendrerit. Curabitur vel lobortis
                                    magna, sed vestibulum nulla. Fusce quis tristique leo. Aenean nunc velit, tincidunt in nisi id, eleifend aliquam quam. Ut ac ligula in sem tempor rutrum molestie ac odio. Cras erat arcu, bibendum nec
                                    lacinia vel, facilisis ut nisi. Nullam lectus ipsum, suscipit in libero non, hendrerit bibendum dolor.
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={6}>
                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                <Typography variant='body1'>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse lacinia eros arcu, vel dapibus massa hendrerit hendrerit. Curabitur vel lobortis magna, sed vestibulum nulla. Fusce quis tristique leo.
                                    Aenean nunc velit, tincidunt in nisi id, eleifend aliquam quam. Ut ac ligula in sem tempor rutrum molestie ac odio. Cras erat arcu, bibendum nec lacinia vel, facilisis ut nisi. Nullam lectus ipsum,
                                    suscipit in libero non, hendrerit bibendum dolor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse lacinia eros arcu, vel dapibus massa hendrerit hendrerit. Curabitur vel lobortis
                                    magna, sed vestibulum nulla. Fusce quis tristique leo. Aenean nunc velit, tincidunt in nisi id, eleifend aliquam quam. Ut ac ligula in sem tempor rutrum molestie ac odio. Cras erat arcu, bibendum nec
                                    lacinia vel, facilisis ut nisi. Nullam lectus ipsum, suscipit in libero non, hendrerit bibendum dolor.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>

                {/* Loading overlay */}
                {/* <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop> */}
            </Box>
        </>
    );
}

export default Home;
