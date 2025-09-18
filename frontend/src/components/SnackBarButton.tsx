import * as React from 'react';
import Button from '@mui/material/Button';
import { Snackbar, Grow, Alert } from '@mui/material';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function SimpleSnackbar() {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const action = (
        <React.Fragment>
            <Button color='secondary' size='small' onClick={handleClose} sx={{ fontWeight: 'Bold' }}>
                UNDO
            </Button>
            <IconButton size='small' aria-label='close' color='inherit' onClick={handleClose}>
                <CloseIcon fontSize='small' />
            </IconButton>
        </React.Fragment>
    );

    return (
        <div>
            <Button variant='contained' onClick={handleClick}>
                Open Snackbar
            </Button>
            {/* The action is customizable, this is a plain snackbar*/}
            {/* <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} message='Session added to Calendar!' action={action} slots={{ transition: Grow }} /> */}

            {/* Snackbar with an Alert nested within it */}
            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} slots={{ transition: Grow }}>
                <Alert action={action} onClose={handleClose} severity='success' variant='filled' sx={{ width: '100%' }}>
                    Session added to Calendar!
                </Alert>
            </Snackbar>
        </div>
    );
}
