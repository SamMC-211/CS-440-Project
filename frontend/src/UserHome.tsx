import gymImage from './assets/gym_image.jpg';
// MUI
import DrawerButton from './components/DrawerButton';
import SnackBarButton from './components/SnackBarButton';
import CustomHeader from './components/CustomHeader';
import SlotList from './components/AppointmentList';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
    Container,
    Grid,
    Box,
    Button,
    Paper,
    Stack,
    FormGroup,
    FormControlLabel,
    AppBar,
    Typography,
    Toolbar,
    Card,
    CardContent,
    TextField,
    Switch,
    Snackbar,
    Alert,
    Grow,
    CircularProgress,
    Backdrop,
    IconButton,
    Avatar,
} from '@mui/material';
import { useNavigate, Link } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

function UserHome() {
    //active user data
    const initialUser = {
        userID: '',
        firstName: '',
        lastName: '',
        role: '',
        email: '',
        providerName: '',
    };
    const [user, setUser] = useState(initialUser);
    const initialAppointment = {
        title: '',
        type: '',
        room: '',
        time: '',
        date: '',
        description: '',
    };
    const [appointment, setAppointment] = useState(initialAppointment);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [appointmentList, setAppointmentList] = useState([]);
    //Snackbar component
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info',
    });
    const handleClose = () => setSnackbar({ open: false, message: '', severity: 'success' });
    //User table definition
    const columns: GridColDef[] = [
        { field: 'firstname', headerName: 'First Name', flex: 1 },
        { field: 'lastname', headerName: ' Last Name', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'password', headerName: 'Password', flex: 1 },
    ];

    //If user is admin, pull list of users
    useEffect(() => {
        // Only fetch if the user is a provider
        if (user.role !== 'admin') {
            return;
        }

        fetch('/api/users?limit=10&sort=lastname', {
            method: 'GET',
            credentials: 'include',
        })
            .then((res) => res.json()) //res(ponse) object recieved from fetch gets the .json method called on it, this method returns another promise (this time the parsed json)
            //same as doing
            // .then((res) => {
            //     return res.json();
            // })
            .then((data) => {
                //data is whatever I passed to res.json on the express side
                if (data.success) {
                    setRows(data.results);
                } else {
                    setError(data.message);
                }
            })
            .catch((err) => console.error(err));
    }, [user.role]);

    //Grab active user information
    useEffect(() => {
        fetch('/api/users/active', { method: 'GET', credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                if (data.ok) {
                    setUser({
                        userID: data.user.user_id,
                        firstName: data.user.first_name,
                        lastName: data.user.last_name,
                        role: data.user.role,
                        email: data.user.email,
                        providerName: data.user.provider_name,
                    });
                } else {
                    setError('Failed to fetch user');
                }
            })
            .catch((err) => console.error(err));
    }, []);

    //Grab all of the appointments from the database
    useEffect(() => {
        fetch('/api/appointments/all', { method: 'GET', credentials: 'include' })
            .then((res) => res.json()) //res(ponse) object recieved from fetch gets the .json method called on it, this method returns another promise (this time the parsed json)
            .then((data) => {
                //data is whatever I passed to res.json on the express side
                if (data.ok) {
                    setAppointmentList(data.results);
                } else {
                    setError(data.message);
                }
            })
            .catch((err) => console.error(err));
    }, [snackbar]);

    //LOGOUT
    async function handleLogout() {
        try {
            const res = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include', // important: sends session cookie
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (data.ok) {
                // Successful logout
                setUser(initialUser); // clear user state
                navigate('/login'); // redirect to login page (using react-router)
            } else {
                // Logout failed
                console.error('Logout failed:', data.message);
                setSnackbar({ open: true, message: 'Logout failed. Please try again.', severity: 'error' });
            }
        } catch (err) {
            console.error('Network error during logout:', err);
            setSnackbar({ open: true, message: 'Network error during logout', severity: 'error' });
        }
    }

    // Add appointment (not users)
    async function addAppointment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (user.role !== 'provider') {
            setError('You must be a service provider to create appointments!');
            return;
        }

        //Confirm password matches
        if (Object.values(appointment).some((value) => value === '')) {
            setError('Please fill out all fields!');
            return;
        }

        //Tries a post request
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: user.userID, ...appointment, role: user.role }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Appointment Creation Failed');
                return;
            }
            //Snackbar popup to inform user that their account was successfully registered
            setAppointment(initialAppointment);
            setSnackbar({ open: true, message: 'Appointment Created! ID: ' + data.appt_id, severity: 'success' });
        } catch (err) {
            setError('Network error');
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    async function bookAppointment(appt: any) {
        // Basic checks
        if (!user) {
            setError('Not authenticated');
            return;
        }

        if (user.role !== 'user') {
            setError('You must be a user to book appointments!');
            return;
        }

        if (!appt || !appt.appt_id) {
            setError('Invalid appointment');
            return;
        }

        // Optional client-side quick check
        if (Number(appt.is_booked ?? 0) !== 0) {
            setError('This appointment is already booked');
            return;
        }

        setLoading(true);
        setError(null);
        //Tries a post request
        try {
            const res = await fetch('/api/appointments/book', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: user.userID, apptID: appt.appt_id }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Appointment Booking Failed');
                return;
            }
            //Snackbar popup to inform user that their account was successfully registered
            setSnackbar({ open: true, message: 'Appointment Booked!', severity: 'success' });
        } catch (err) {
            setError('Network error');
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    //useCallback: React hook to "memoize" function, meaning react will reuse the same function object between renders unless its dependencies change
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getRowID = useCallback((row: any) => row.email, []);

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
                {/* Logout Button */}
                <Button
                    component={Link}
                    to='/Login'
                    onClick={handleLogout}
                    variant='contained'
                    sx={{
                        position: 'absolute',
                        width: 115,
                        height: 37,
                        top: 20,
                        right: 40,
                    }}
                >
                    Logout
                </Button>
                {/*only displays the user display if is user role. */}
                <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
                    {user.role === 'provider' && <CustomHeader text={user.providerName} margin={2} variant='h1' />}
                    <Box sx={{ flexGrow: 1, marginTop: 5, marginBottom: 5 }}>
                        <AppBar position='static'>
                            <Toolbar>
                                {/* Left side: profile avatar + name */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar alt={user.firstName} src='' />
                                    <Typography variant='h5' component='div'>
                                        {user.firstName} {user.lastName}
                                    </Typography>
                                </Box>
                                {/* Spacer pushes hamburger to the right */}
                                <Box sx={{ flexGrow: 1 }} />
                                <DrawerButton />
                            </Toolbar>
                        </AppBar>
                    </Box>

                    {/* Render Users */}
                    {user.role == 'user' && (
                        <Grid container spacing={6}>
                            <Grid size={6}>
                                <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                    <SlotList appointments={appointmentList} onBook={(appt) => bookAppointment(appt)} listTitle='Available Appointments' />
                                </Paper>
                            </Grid>
                            <Grid size={6}>
                                <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                    {/* TODO: Dynamically update?? */}
                                    <DataGrid rows={rows} columns={columns} getRowId={getRowID} checkboxSelection disableRowSelectionOnClick />
                                </Paper>
                            </Grid>
                        </Grid>
                    )}

                    {/* Render providers */}
                    {user.role == 'provider' && (
                        <span>
                            <Card sx={{ width: 650, padding: 2, zIndex: 1, position: 'relative' }}>
                                <CardContent>
                                    <Typography variant='h5' component='div' textAlign='center' gutterBottom>
                                        Create Appointment
                                    </Typography>

                                    {error && (
                                        <Alert severity='error' sx={{ mb: 2 }}>
                                            {error}
                                        </Alert>
                                    )}

                                    {/* Wrap in a form element */}
                                    <form onSubmit={addAppointment}>
                                        <Stack spacing={2}>
                                            <TextField label='Appointment Title' value={appointment.title} onChange={(e) => setAppointment({ ...appointment, title: e.target.value })} fullWidth />

                                            <TextField
                                                select
                                                label='Type'
                                                value={appointment.type}
                                                onChange={(e) => setAppointment({ ...appointment, type: e.target.value })}
                                                fullWidth
                                                SelectProps={{
                                                    native: true, // uses native HTML select
                                                }}
                                            >
                                                <option value=''></option>
                                                <option value='Consultation'>Consultation</option>
                                                <option value='Training'>Training</option>
                                                <option value='Follow-up'>Follow-up</option>
                                            </TextField>

                                            <TextField
                                                select
                                                label='Room'
                                                value={appointment.room}
                                                onChange={(e) => setAppointment({ ...appointment, room: e.target.value })}
                                                fullWidth
                                                SelectProps={{
                                                    native: true,
                                                }}
                                            >
                                                <option value=''></option>
                                                <option value='101'>Room 101</option>
                                                <option value='102'>Room 102</option>
                                                <option value='103'>Room 103</option>
                                            </TextField>

                                           <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label="Appointment Date"
                                                value={appointment.date ? new Date(appointment.date) : null} // parse string back to Date for picker
                                                onChange={(newValue) => {
                                                if (newValue) {
                                                    const formattedDate = format(newValue, 'MM/dd/yyyy'); // convert Date -> string
                                                    setAppointment({ ...appointment, date: formattedDate });
                                                } else {
                                                    setAppointment({ ...appointment, date: '' });
                                                }
                                                }}
                                                minDate={new Date()}
                                            />
                                            </LocalizationProvider>

                                            <TextField
                                                select
                                                label='Timeslot'
                                                value={appointment.time}
                                                onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                                                fullWidth
                                                SelectProps={{
                                                    native: true,
                                                }}
                                            >
                                                <option value=''></option>
                                                <option value='9:00-10:00'>9:00-10:00</option>
                                                <option value='10:00-11:00'>10:00-11:00</option>
                                                <option value='11:00-12:00'>11:00-12:00</option>
                                            </TextField>

                                            <TextField label='Description' value={appointment.description} onChange={(e) => setAppointment({ ...appointment, description: e.target.value })} multiline rows={4} fullWidth />

                                            {/* Submit Button */}
                                            <Button type='submit' variant='contained' color='primary' fullWidth>
                                                Create Appointment
                                            </Button>
                                        </Stack>
                                    </form>
                                </CardContent>
                            </Card>
                        </span>
                    )}

                    {/* Render Admin */}
                    {user.role == 'dev' && ( //admin I guess
                        <Grid container spacing={6}>
                            <Grid size={12}>
                                <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                    {/* TODO: Dynamically update?? */}
                                    <DataGrid rows={rows} columns={columns} getRowId={getRowID} checkboxSelection disableRowSelectionOnClick />
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </Container>

                {/* Loading overlay */}
                <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                    <CircularProgress color='inherit' />
                </Backdrop>
                {/* Snackbar Component */}
                <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleClose} slots={{ transition: Grow }}>
                    <Alert onClose={handleClose} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </>
    );
}

export default UserHome;
