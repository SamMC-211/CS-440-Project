import gymImage from './assets/gym_image.jpg';
// MUI
import {
    Alert,
    AppBar,
    Avatar,
    Backdrop,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Grow,
    Paper,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import SlotList from './components/AppointmentList';
import CustomHeader from './components/CustomHeader';
import DrawerButton from './components/DrawerButton';

// TODO
// Make snackbar into serarate component that you pass message/error to
// Separate out forms into components to clean up code?
// Cleanup admin data fetch (Only pull when they click on toggle button? have component be loading until fetch happens?)
// Separate out filterable table into its own component (Use for viewing and possibly booking appointments?)(Takes an array of appointmentObjects (appointmentList))
//======================================Constants===========================================================
type AppointmentObject = {
    appt_id: number;
    provider_name: string;
    provider_firstname: string;
    provider_lastname: string;
    appt_type: string;
    room_num: number;
    status: string;
    is_booked: number;
    user_id: number | null;
    start_time: string;
    end_time: string;
    date: string;
    title: string;
    description: string;
};
type User = {
    userID: number | null;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    providerName: string;
};

//Toggle Button Names by User type
const userToggleButtons = ['Dashboard', 'Book', 'View Appointments'];
const providerToggleButtons = ['Dashboard', 'Create Appointment', 'View Appointments'];
const adminToggleButtons = ['Dashboard', 'Manage', 'View Appointments'];

const initialUser: User = {
    userID: null,
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    providerName: '',
};
const initialAppointment = {
    title: '',
    type: '',
    room: '',
    time: '',
    date: '',
    description: '',
};
const initAppointmentRange = {
    beforeDate: '',
    afterDate: '',
};
const columns: GridColDef[] = [
    { field: 'firstname', headerName: 'First Name', flex: 1 },
    { field: 'lastname', headerName: ' Last Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'password', headerName: 'Password', flex: 1 },
];

function UserHome() {
    const [user, setUser] = useState(initialUser);
    const [toggleButton, setToggleButton] = useState(0);
    const [currentToggleButtons, setCurrentToggleButtons] = useState<string[]>([]);
    const [filter, setFilter] = useState('');

    const [appointmentList, setAppointmentList] = useState<AppointmentObject[]>([]);
    const [bookedAppointmentList, setBookedAppointmentList] = useState();

    const [appointment, setAppointment] = useState(initialAppointment);

    const [appointmentRange, setAppointmentRange] = useState(initAppointmentRange);
    const [appointmentSearchType, setSearchAppointmentType] = useState('');

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning' | 'info',
    });
    const handleClose = () => setSnackbar({ open: false, message: '', severity: 'success' });
    //User table definition

    //======================================UseEffect===========================================================
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
                    if (data.user.role === 'admin') {
                        setCurrentToggleButtons(adminToggleButtons);
                    } else if (data.user.role === 'provider') {
                        setCurrentToggleButtons(providerToggleButtons);
                    } else {
                        setCurrentToggleButtons(userToggleButtons);
                        getBookedAppointments(data.user);
                    }
                } else {
                    setError('Failed to fetch user');
                }
            })
            .catch((err) => console.error(err));
        getAppointments();
    }, []);

    //Grab all of the appointments from the database
    // useEffect(() => {
    //     fetch('/api/appointments/all', { method: 'GET', credentials: 'include' })
    //         .then((res) => res.json()) //res(ponse) object recieved from fetch gets the .json method called on it, this method returns another promise (this time the parsed json)
    //         .then((data) => {
    //             //data is whatever I passed to res.json on the express side
    //             if (data.ok) {
    //                 setAppointmentList(data.results as AppointmentObject[]);
    //             } else {
    //                 setError(data.message);
    //             }
    //         })
    //         .catch((err) => console.error(err));
    // }, [user]);

    async function getAppointments() {
        fetch('/api/appointments/all', { method: 'GET', credentials: 'include' })
            .then((res) => res.json()) //res(ponse) object recieved from fetch gets the .json method called on it, this method returns another promise (this time the parsed json)
            .then((data) => {
                //data is whatever I passed to res.json on the express side
                if (data.ok) {
                    setAppointmentList(data.results as AppointmentObject[]);
                } else {
                    setError(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    //======================================OnClick Functions===========================================================

    //Logout
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
                setSnackbar({
                    open: true,
                    message: 'Logout failed. Please try again.',
                    severity: 'error',
                });
            }
        } catch (err) {
            console.error('Network error during logout:', err);
            setSnackbar({
                open: true,
                message: 'Network error during logout',
                severity: 'error',
            });
        }
    }

    //switch toggle button
    const handleToggleButton = (event: React.MouseEvent<HTMLElement>, alignButton: number) => {
        setToggleButton(alignButton);
    };

    //Add appointment (role: provider)
    async function addAppointment(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
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

        //Now set loading to true
        setLoading(true);

        //Tries a post request
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userID: user.userID,
                    ...appointment,
                    role: user.role,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Appointment Creation Failed');
                return;
            }
            //Snackbar popup to inform user that their account was successfully registered
            setAppointment(initialAppointment);
            setSnackbar({
                open: true,
                message: 'Appointment Created! ID: ' + data.appt_id,
                severity: 'success',
            });
        } catch (err) {
            setError('Network error');
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    //Book appointment (role: user)
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
            setSnackbar({
                open: true,
                message: 'Appointment Booked!',
                severity: 'success',
            });
        } catch (err) {
            setError('Network error');
            console.log(err);
        } finally {
            setLoading(false);
            getBookedAppointments(user);
            getAppointments();
        }
    }

    async function GetAppointmentsByDateRangeAndType(type: any = null, minDate: any = null, maxDate: any = null) {
        setError(null);

        setLoading(true);
        //Tries a post request
        try {
            console.log('here');

            const query = new URLSearchParams({
                userID: user.userID?.toString() ?? '',
                minDate: minDate ?? appointmentRange.afterDate,
                maxDate: maxDate ?? appointmentRange.beforeDate,
                type: type ?? appointmentSearchType,
                role: user.role,
            });

            const res = await fetch(`/api/appointments?${query.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Failed to get appointments.');
                return;
            }
            if (data.ok) {
                setAppointmentList(data.results);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Network error');
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    async function cancelAppointment(appt: any) {
        try {
            const res = await fetch('/api/appointments/cancel', {
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
            setSnackbar({
                open: true,
                message: 'Appointment Cancelled!',
                severity: 'success',
            });
        } catch (err) {
            setError('Network error');
            console.log(err);
        } finally {
            getBookedAppointments(user);
            getAppointments();
        }
    }

    async function getBookedAppointments(user: any) {
        setError(null);

        //Tries a post request
        if (user.role != 'user') {
            return;
        }
        console.log('Calling getBookedAppointments with user:', user);
        try {
            const query = new URLSearchParams({
                userID: (user.userID ?? user.user_id)?.toString() ?? '',
                role: user.role,
            });

            const res = await fetch(`/api/appointments/booked?${query.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Failed to get appointments.');
                return;
            }
            if (data.ok) {
                setBookedAppointmentList(data.results);
            } else {
                setError(data.message);
            }
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

                <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
                    \{/* PROVIDER HEADER */}
                    {user.role === 'provider' && <CustomHeader text={user.providerName} margin={2} variant='h1' />}
                    {/* APP BAR */}
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
                                <ToggleButtonGroup color='secondary' value={toggleButton} exclusive onChange={handleToggleButton} aria-label='Platform' sx={{ '& .MuiToggleButton-root': { borderWidth: 2 } }}>
                                    {currentToggleButtons.map((label, index) => (
                                        <ToggleButton key={index} value={index}>
                                            {label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                                <DrawerButton />
                            </Toolbar>
                        </AppBar>
                    </Box>
                    {/* Render Users */}
                    {user.role == 'user' && (
                        <Box>
                            {toggleButton == 0 && (
                                // <Grid container spacing={6}>
                                //     <Grid size={6}>
                                //         <TextField
                                //             select
                                //             label='Type'
                                //             value={appointmentSearchType}
                                //             onChange={(e) => {
                                //                 const newType = e.target.value;
                                //                 setSearchAppointmentType(newType);
                                //                 GetAppointmentsByDateRangeAndType(newType, null, null);
                                //             }}
                                //             fullWidth
                                //             SelectProps={{
                                //                 native: true,
                                //             }}
                                //             sx={{ p: 2, background: '#c1c3c5ff' }}
                                //         >
                                //             <option value=''></option>
                                //             <option value='Consultation'>Consultation</option>
                                //             <option value='Training'>Training</option>
                                //             <option value='Follow-up'>Follow-up</option>
                                //         </TextField>

                                //         <Stack direction='row' spacing={2} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                //             <LocalizationProvider dateAdapter={AdapterDateFns}>
                                //                 <DatePicker
                                //                     label='After'
                                //                     value={appointmentRange.afterDate ? new Date(appointmentRange.afterDate) : null} // parse string back to Date for picker
                                //                     onChange={(newValue) => {
                                //                         if (newValue) {
                                //                             const formattedDate = format(newValue, 'MM/dd/yyyy'); // convert Date -> string
                                //                             setAppointmentRange({
                                //                                 ...appointmentRange,
                                //                                 afterDate: formattedDate,
                                //                             });
                                //                             GetAppointmentsByDateRangeAndType(null, newValue, null);
                                //                             // TODO: Call function to filter
                                //                         }
                                //                     }}
                                //                     minDate={new Date()}
                                //                 />
                                //             </LocalizationProvider>

                                //             <LocalizationProvider dateAdapter={AdapterDateFns}>
                                //                 <DatePicker
                                //                     label='Before'
                                //                     value={appointmentRange.beforeDate ? new Date(appointmentRange.beforeDate) : null} // parse string back to Date for picker
                                //                     onChange={(newValue) => {
                                //                         if (newValue) {
                                //                             const formattedDate = format(newValue, 'MM/dd/yyyy'); // convert Date -> string
                                //                             setAppointmentRange({
                                //                                 ...appointmentRange,
                                //                                 beforeDate: formattedDate,
                                //                             });
                                //                             GetAppointmentsByDateRangeAndType(null, null, newValue);
                                //                             // TODO: Call function to filter
                                //                         }
                                //                     }}
                                //                     minDate={new Date()}
                                //                 />
                                //             </LocalizationProvider>
                                //         </Stack>
                                //         <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                //             <SlotList appointments={appointmentList} onBook={(appt) => bookAppointment(appt)} listTitle='Available Appointments' />
                                //         </Paper>
                                //     </Grid>
                                //     <Grid size={6}>
                                //         <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                //             {/* TODO: Dynamically update?? */}
                                //             <SlotList appointments={appointmentList} onCancel={(appt) => cancelAppointment(appt)} listTitle='Upcoming Appointments' />
                                //         </Paper>
                                //     </Grid>
                                // </Grid>
                                <span>
                                    <Grid container spacing={6}>
                                        <Grid size={6}>
                                            <TextField
                                                select
                                                label='Type'
                                                value={appointmentSearchType}
                                                onChange={(e) => {
                                                    const newType = e.target.value;
                                                    setSearchAppointmentType(newType);
                                                    GetAppointmentsByDateRangeAndType(newType, null, null);
                                                }}
                                                fullWidth
                                                SelectProps={{
                                                    native: true,
                                                }}
                                                sx={{ p: 2, background: '#c1c3c5ff' }}
                                            >
                                                <option value=''></option>
                                                <option value='Consultation'>Consultation</option>
                                                <option value='Training'>Training</option>
                                                <option value='Follow-up'>Follow-up</option>
                                            </TextField>

                                            <Stack direction='row' spacing={2} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label='After'
                                                        value={appointmentRange.afterDate ? new Date(appointmentRange.afterDate) : null} // parse string back to Date for picker
                                                        onChange={(newValue) => {
                                                            if (newValue) {
                                                                const formattedDate = format(newValue, 'MM/dd/yyyy'); // convert Date -> string
                                                                setAppointmentRange({
                                                                    ...appointmentRange,
                                                                    afterDate: formattedDate,
                                                                });
                                                                GetAppointmentsByDateRangeAndType(null, newValue, null);
                                                                // TODO: Call function to filter
                                                            }
                                                        }}
                                                        minDate={new Date()}
                                                    />
                                                </LocalizationProvider>

                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label='Before'
                                                        value={appointmentRange.beforeDate ? new Date(appointmentRange.beforeDate) : null} // parse string back to Date for picker
                                                        onChange={(newValue) => {
                                                            if (newValue) {
                                                                const formattedDate = format(newValue, 'MM/dd/yyyy'); // convert Date -> string
                                                                setAppointmentRange({
                                                                    ...appointmentRange,
                                                                    beforeDate: formattedDate,
                                                                });
                                                                GetAppointmentsByDateRangeAndType(null, null, newValue);
                                                                // TODO: Call function to filter
                                                            }
                                                        }}
                                                        minDate={new Date()}
                                                    />
                                                </LocalizationProvider>
                                            </Stack>
                                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                                <SlotList appointments={appointmentList} onBook={(appt) => bookAppointment(appt)} listTitle='Available Appointments' />
                                            </Paper>
                                        </Grid>
                                        <Grid size={6}>
                                            <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                                {/* TODO: Dynamically update?? */}
                                                <SlotList appointments={bookedAppointmentList} onCancel={(appt) => cancelAppointment(appt)} listTitle='Upcoming Appointments' />
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </span>
                            )}
                            {toggleButton == 2 && (
                                <>
                                    <Box display={'flex'}>
                                        <Box flexGrow={1} />
                                        <TextField
                                            select
                                            label='Sort By'
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            variant='filled'
                                            SelectProps={{ native: true }}
                                            sx={{
                                                '& .MuiFilledInput-root': {
                                                    backgroundColor: (theme) => theme.palette.primary.main,
                                                    color: 'white',
                                                    borderRadius: 1, // matches Button's default rounding
                                                    fontWeight: 'bold',
                                                    '&:hover': {
                                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: 'black',
                                                },
                                                margin: '4px',
                                                width: '25%',
                                            }}
                                        >
                                            <option value=''></option>
                                            <option value='101'>Provider</option>
                                            <option value='102'>Booked</option>
                                            <option value='103'>Date</option>
                                        </TextField>
                                    </Box>
                                    <TableContainer component={Paper}>
                                        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                                            <TableHead
                                                sx={{
                                                    '& .MuiTableCell-head': {
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem',
                                                    },
                                                }}
                                            >
                                                <TableRow>
                                                    {/* <TableCell>Appointment ID</TableCell> */}
                                                    <TableCell align='right'>Provider</TableCell>
                                                    <TableCell align='right'>Type</TableCell>
                                                    <TableCell align='right'>Room</TableCell>
                                                    <TableCell align='right'>Date</TableCell>
                                                    <TableCell align='right'>Start Time</TableCell>
                                                    <TableCell align='right'>End Time</TableCell>
                                                    <TableCell align='right'>Status</TableCell>
                                                    <TableCell align='right'>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {appointmentList.map((appointment) => (
                                                    <TableRow key={appointment.appt_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        {/* <TableCell component='th' scope='appointment'>
                                                            {appointment.appt_id}
                                                        </TableCell> */}
                                                        <TableCell align='right'>{appointment.provider_name}</TableCell>
                                                        <TableCell align='right'>{appointment.appt_type}</TableCell>
                                                        <TableCell align='right'>{appointment.room_num}</TableCell>
                                                        <TableCell align='right'>{appointment.date}</TableCell>
                                                        <TableCell align='right'>{appointment.start_time}</TableCell>
                                                        <TableCell align='right'>{appointment.end_time}</TableCell>

                                                        {appointment.is_booked === 0 && (appointment.user_id === null || appointment.user_id === undefined) && (
                                                            // appointment is open
                                                            <>
                                                                <TableCell align='right' sx={{ color: 'green' }}>
                                                                    {appointment.status}
                                                                </TableCell>
                                                                <TableCell align='right'>
                                                                    <Button variant='contained' size='medium' color='primary'>
                                                                        Book
                                                                    </Button>
                                                                </TableCell>
                                                            </>
                                                        )}
                                                        {appointment.is_booked === 1 && (appointment.user_id !== null || appointment.user_id !== undefined) && appointment.user_id === user.userID && (
                                                            // appointment is booked by current user
                                                            <>
                                                                <TableCell align='right' sx={{ color: 'green' }}>
                                                                    {appointment.status}
                                                                </TableCell>
                                                                <TableCell align='right'>
                                                                    <Button variant='contained' size='medium' color='primary'>
                                                                        Cancel
                                                                    </Button>
                                                                </TableCell>
                                                            </>
                                                        )}
                                                        {appointment.is_booked === 1 && appointment.user_id !== null && appointment.user_id !== user.userID && (
                                                            //appointment is booked, but not by current user
                                                            <>
                                                                <TableCell align='right' sx={{ color: 'red' }}>
                                                                    {appointment.status}
                                                                </TableCell>
                                                                <TableCell align='right'>{appointment.status}</TableCell>
                                                            </>
                                                        )}
                                                        <span />
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </Box>
                    )}
                    {/* Render providers */}
                    {user.role == 'provider' && (
                        <Box>
                            {toggleButton == 0 && (
                                <span>
                                    <Grid container spacing={6}>
                                        <Grid size={6}>
                                            <TextField
                                                select
                                                label='Type'
                                                value={appointmentSearchType}
                                                onChange={(e) => {
                                                    const newType = e.target.value;
                                                    setSearchAppointmentType(newType);
                                                    GetAppointmentsByDateRangeAndType(newType, null, null);
                                                }}
                                                fullWidth
                                                SelectProps={{
                                                    native: true,
                                                }}
                                                sx={{ p: 2, background: '#c1c3c5ff' }}
                                            >
                                                <option value=''></option>
                                                <option value='Consultation'>Consultation</option>
                                                <option value='Training'>Training</option>
                                                <option value='Follow-up'>Follow-up</option>
                                            </TextField>

                                            <Stack direction='row' spacing={2} sx={{ p: 2, background: '#c1c3c5ff' }}>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label='After'
                                                        value={appointmentRange.afterDate ? new Date(appointmentRange.afterDate) : null} // parse string back to Date for picker
                                                        onChange={(newValue) => {
                                                            if (newValue) {
                                                                const formattedDate = format(newValue, 'MM/dd/yyyy'); // convert Date -> string
                                                                setAppointmentRange({
                                                                    ...appointmentRange,
                                                                    afterDate: formattedDate,
                                                                });
                                                                GetAppointmentsByDateRangeAndType(null, newValue, null);
                                                                // TODO: Call function to filter
                                                            }
                                                        }}
                                                        minDate={new Date()}
                                                    />
                                                </LocalizationProvider>

                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label='Before'
                                                        value={appointmentRange.beforeDate ? new Date(appointmentRange.beforeDate) : null} // parse string back to Date for picker
                                                        onChange={(newValue) => {
                                                            if (newValue) {
                                                                const formattedDate = format(newValue, 'MM/dd/yyyy'); // convert Date -> string
                                                                setAppointmentRange({
                                                                    ...appointmentRange,
                                                                    beforeDate: formattedDate,
                                                                });
                                                                GetAppointmentsByDateRangeAndType(null, null, newValue);
                                                                // TODO: Call function to filter
                                                            }
                                                        }}
                                                        minDate={new Date()}
                                                    />
                                                </LocalizationProvider>
                                            </Stack>
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
                                </span>
                            )}
                            {/* CREATE APPOINTMENT */}
                            {toggleButton == 1 && (
                                <span>
                                    <Card
                                        sx={{
                                            width: 650,
                                            padding: 2,
                                            zIndex: 1,
                                            position: 'relative',
                                        }}
                                    >
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
                                                    <TextField
                                                        label='Appointment Title'
                                                        value={appointment.title}
                                                        onChange={(e) =>
                                                            setAppointment({
                                                                ...appointment,
                                                                title: e.target.value,
                                                            })
                                                        }
                                                        fullWidth
                                                    />

                                                    <TextField
                                                        select
                                                        label='Type'
                                                        value={appointment.type}
                                                        onChange={(e) =>
                                                            setAppointment({
                                                                ...appointment,
                                                                type: e.target.value,
                                                            })
                                                        }
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
                                                        onChange={(e) =>
                                                            setAppointment({
                                                                ...appointment,
                                                                room: e.target.value,
                                                            })
                                                        }
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
                                                            label='Appointment Date'
                                                            value={appointment.date ? new Date(appointment.date) : null} // parse string back to Date for picker
                                                            onChange={(newValue) => {
                                                                if (newValue) {
                                                                    const formattedDate = format(newValue, 'MM/dd/yyyy'); // convert Date -> string
                                                                    setAppointment({
                                                                        ...appointment,
                                                                        date: formattedDate,
                                                                    });
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
                                                        onChange={(e) =>
                                                            setAppointment({
                                                                ...appointment,
                                                                time: e.target.value,
                                                            })
                                                        }
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

                                                    <TextField
                                                        label='Description'
                                                        value={appointment.description}
                                                        onChange={(e) =>
                                                            setAppointment({
                                                                ...appointment,
                                                                description: e.target.value,
                                                            })
                                                        }
                                                        multiline
                                                        rows={4}
                                                        fullWidth
                                                    />

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
                            {toggleButton == 2 && (
                                <>
                                    <Box display={'flex'}>
                                        <Box flexGrow={1} />
                                        <TextField
                                            select
                                            label='Sort By'
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            variant='filled'
                                            SelectProps={{ native: true }}
                                            sx={{
                                                '& .MuiFilledInput-root': {
                                                    backgroundColor: (theme) => theme.palette.primary.main,
                                                    color: 'white',
                                                    borderRadius: 1, // matches Button's default rounding
                                                    fontWeight: 'bold',
                                                    '&:hover': {
                                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                                    },
                                                    '&.Mui-focused': {
                                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                },
                                                '& .MuiInputBase-input': {
                                                    color: 'black',
                                                },
                                                margin: '4px',
                                                width: '25%',
                                            }}
                                        >
                                            <option value=''></option>
                                            <option value='101'>Provider</option>
                                            <option value='102'>Booked</option>
                                            <option value='103'>Date</option>
                                        </TextField>
                                    </Box>
                                    <TableContainer component={Paper}>
                                        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                                            <TableHead
                                                sx={{
                                                    '& .MuiTableCell-head': {
                                                        fontWeight: 'bold',
                                                        fontSize: '1rem',
                                                    },
                                                }}
                                            >
                                                <TableRow>
                                                    {/* <TableCell>Appointment ID</TableCell> */}
                                                    <TableCell align='right'>Provider</TableCell>
                                                    <TableCell align='right'>Type</TableCell>
                                                    <TableCell align='right'>Room</TableCell>
                                                    <TableCell align='right'>Date</TableCell>
                                                    <TableCell align='right'>Start Time</TableCell>
                                                    <TableCell align='right'>End Time</TableCell>
                                                    <TableCell align='right'>Status</TableCell>
                                                    <TableCell align='right'>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {appointmentList.map((appointment) => (
                                                    <TableRow key={appointment.appt_id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        {/* <TableCell component='th' scope='appointment'>
                                            {appointment.appt_id}
                                        </TableCell> */}
                                                        <TableCell align='right'>{appointment.provider_name}</TableCell>
                                                        <TableCell align='right'>{appointment.appt_type}</TableCell>
                                                        <TableCell align='right'>{appointment.room_num}</TableCell>
                                                        <TableCell align='right'>{appointment.date}</TableCell>
                                                        <TableCell align='right'>{appointment.start_time}</TableCell>
                                                        <TableCell align='right'>{appointment.end_time}</TableCell>

                                                        {appointment.is_booked === 0 && appointment.user_id === undefined && (
                                                            // appointment is open
                                                            <>
                                                                <TableCell align='right' sx={{ color: 'green' }}>
                                                                    {appointment.status}
                                                                </TableCell>
                                                                <TableCell align='right'>
                                                                    <Button variant='contained' size='medium' color='primary'>
                                                                        Book
                                                                    </Button>
                                                                </TableCell>
                                                            </>
                                                        )}
                                                        {appointment.is_booked === 1 && appointment.user_id !== null && appointment.user_id === initialUser.userID && (
                                                            // appointment is booked by current user
                                                            <>
                                                                <TableCell align='right' sx={{ color: 'green' }}>
                                                                    {appointment.status}
                                                                </TableCell>
                                                                <TableCell align='right'>
                                                                    <Button variant='contained' size='medium' color='primary'>
                                                                        Cancel
                                                                    </Button>
                                                                </TableCell>
                                                            </>
                                                        )}
                                                        {appointment.is_booked === 1 && appointment.user_id !== null && appointment.user_id !== initialUser.userID && (
                                                            //appointment is booked, but not by current user
                                                            <>
                                                                <TableCell align='right' sx={{ color: 'red' }}>
                                                                    {appointment.status}
                                                                </TableCell>
                                                                <TableCell align='right'>{appointment.status}</TableCell>
                                                            </>
                                                        )}
                                                        <span />
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </>
                            )}
                        </Box>
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
