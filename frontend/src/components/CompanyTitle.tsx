import { Box, Typography } from '@mui/material';
import { Link } from 'react-router';

function CompanyTitle() {
    return (
        <>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                {/* Shadow */}
                <Typography
                    variant='h1'
                    fontWeight='bold'
                    sx={{
                        position: 'absolute',
                        top: '5px',
                        // left: '0.01%',
                        transform: 'translateX(1%) ',
                        color: '#494746',
                        zIndex: 0,
                    }}
                >
                    Schedule Fit
                </Typography>

                {/* Main title */}
                <Typography
                    component={Link}
                    to='/'
                    variant='h1'
                    fontWeight='bold'
                    sx={{
                        position: 'relative',
                        color: '#a93331',
                        zIndex: 1,
                        textDecoration: 'none',
                    }}
                >
                    Schedule Fit
                </Typography>
            </Box>
            ;
        </>
    );
}

export default CompanyTitle;
