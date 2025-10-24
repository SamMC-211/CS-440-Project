import { Box } from '@mui/material';
import gymImage from '../assets/gym_image.jpg';

export default function Background() {
    return (
        <>
            {/* Background image */}
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundImage: `url(${gymImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    zIndex: -2, // behind everything
                }}
            />

            {/* Gradient overlay */}
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'linear-gradient(45deg, rgba(19,22,24,1) 0%, rgba(19,22,24,0.27) 100%)',
                    zIndex: -1,
                }}
            />
        </>
    );
}
