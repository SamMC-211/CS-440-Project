import './Home.css';
// MUI
import { Container } from '@mui/material';
import { Grid } from '@mui/material';
import { Box } from '@mui/material';
import { Button } from '@mui/material';
import { Link } from 'react-router';

function UserHome() {
    return (
        <>
            <Container maxWidth='lg'>
                <Grid container spacing={6}>
                    <Grid size={4}>
                        <Box sx={{ p: 2, border: '1px dashed grey' }}>Profile information?</Box>
                    </Grid>
                    <Grid size={8}>
                        <Box sx={{ p: 2, border: '1px dashed grey' }}>List of appointments?</Box>
                    </Grid>
                    <Grid size={6}>
                        <Box sx={{ p: 2, border: '1px dashed grey' }}>Options for reports</Box>
                    </Grid>
                    <Grid size={6}>
                        <Box sx={{ p: 2, border: '1px dashed grey' }}>
                            <Button component={Link} to='/Login' variant='contained'>
                                Login Page
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}

export default UserHome;
