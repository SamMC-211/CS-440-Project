import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import Background from './Background';

type Appointment = {
    appt_id: number;
    provider_id: number;
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

type Props = {
    appointments: Appointment[];
    user: User;
    onBook?: (appt: Appointment) => void;
    onCancel?: (appt: Appointment) => void;
    variant?: 'admin' | '';
};

export default function AppointmentTableSimple({ appointments, user, onBook, onCancel, variant = '' }: Props) {
    const [filter, setFilter] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dateString, setDateString] = useState<string>(''); // will hold "MM/dd/yyyy"

    const visibleAppointments = useMemo(() => {
        // if no date filter selected, start from all appointments
        let list = Array.isArray(appointments) ? appointments : [];

        // If you also want to apply your "filter" dropdown, do it here:
        if (filter) {
            if (filter === 'provider') {
                // example: keep only provider rows (adapt to your real logic)
                list = list.filter((a) => a.provider_name); // or other check
            } else if (filter === 'booked') {
                list = list.filter((a) => a.status === 'booked');
            } else if (filter === 'cancelled') {
                list = list.filter((a) => a.status === 'cancelled');
            }
        }

        // If no date selected, return filtered-by-dropdown list
        if (!dateString) return list;

        // If appointment.date is already 'MM/dd/yyyy', compare directly:
        return list.filter((a) => a.date === dateString);
    }, [appointments, filter, dateString]);

    return (
        <>
            <Container disableGutters maxWidth={variant === 'admin' ? false : 'lg'}>
                <Box display='flex' alignItems='center' sx={{ gap: 1, pr: 2 }}>
                    <Box flexGrow={1} />
                    {/* Date picker on the left */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            value={selectedDate} // Date | null
                            onChange={(newDate) => {
                                setSelectedDate(newDate);
                                if (newDate) {
                                    setDateString(format(newDate, 'MM/dd/yyyy')); // store formatted string
                                } else {
                                    setDateString('');
                                }
                            }}
                            format='MM/dd/yyyy' // ensures the displayed string uses MM/dd/yyyy
                            label='Date'
                            sx={{
                                backgroundColor: (theme) => theme.palette.primary.main,
                                '& .MuiFilledInput-root': {
                                    backgroundColor: (theme) => theme.palette.primary.main,
                                    color: 'white',
                                    borderRadius: 1,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: (theme) => theme.palette.primary.dark,
                                        color: 'white',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: 'white',
                                    fontWeight: 'bold',
                                },
                                '& .MuiPickersSectionList-root': {
                                    color: 'white',
                                },
                                '& .MuiSvgIcon-root': {
                                    color: 'white',
                                },
                            }}
                        />
                    </LocalizationProvider>

                    {dateString && (
                        <Button
                            variant='contained'
                            onClick={() => {
                                setDateString('');
                                setSelectedDate(null);
                            }}
                        >
                            Clear Date
                        </Button>
                    )}

                    {/* Existing dropdown to the right */}
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
                                borderRadius: 1,
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
                            '& .MuiSvgIcon-root': {
                                color: 'white',
                            },
                            margin: '8px',
                            width: '220px', // width for dropdown
                        }}
                    >
                        <option value=''></option>
                        <option value='provider'>Provider</option>
                        <option value='booked'>Booked</option>
                        <option value='cancelled'>Cancelled</option>
                    </TextField>
                </Box>
                <TableContainer component={Paper}>
                    {/* ADMIN TABLE */}
                    {variant === 'admin' && (
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
                                    <TableCell align='right'>Appt_ID</TableCell>
                                    <TableCell align='right'>Appt_Title</TableCell>
                                    <TableCell align='right'>Appt_Desc</TableCell>
                                    <TableCell align='right'>Appt_Type</TableCell>
                                    <TableCell align='right'>Provider_ID</TableCell>
                                    <TableCell align='right'>Provider</TableCell>
                                    <TableCell align='right'>First_Name</TableCell>
                                    <TableCell align='right'>Last_Name</TableCell>
                                    <TableCell align='right'>Room_Number</TableCell>
                                    <TableCell align='right'>Date</TableCell>
                                    <TableCell align='right'>Start Time</TableCell>
                                    <TableCell align='right'>End Time</TableCell>
                                    <TableCell align='right'>Status</TableCell>
                                    <TableCell align='right'>User_ID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visibleAppointments.map((appointment) => (
                                    <TableRow
                                        key={appointment.appt_id}
                                        sx={{
                                            '&:last-child td, &:last-child th': {
                                                border: 0,
                                            },
                                        }}
                                    >
                                        <TableCell align='right'>{appointment.appt_id}</TableCell>
                                        <TableCell align='right'>{appointment.title}</TableCell>
                                        <TableCell align='right'>{appointment.description}</TableCell>
                                        <TableCell align='right'>{appointment.appt_type}</TableCell>
                                        <TableCell align='right'>{appointment.provider_id}</TableCell>
                                        <TableCell align='right'>{appointment.provider_name}</TableCell>
                                        <TableCell align='right'>{appointment.provider_firstname}</TableCell>
                                        <TableCell align='right'>{appointment.provider_lastname}</TableCell>
                                        <TableCell align='right'>{appointment.room_num}</TableCell>
                                        <TableCell align='right'>{appointment.date}</TableCell>
                                        <TableCell align='right'>{appointment.start_time}</TableCell>
                                        <TableCell align='right'>{appointment.end_time}</TableCell>
                                        <TableCell align='right'>{appointment.status}</TableCell>
                                        <TableCell align='right'>{appointment.user_id}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    {variant === '' && (
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
                                {appointments.map((appointment) => (
                                    <TableRow
                                        key={appointment.appt_id}
                                        sx={{
                                            '&:last-child td, &:last-child th': {
                                                border: 0,
                                            },
                                        }}
                                    >
                                        {/* <TableCell component='th' scope='appointment'>
                                                            {appointment.appt_id}
                                                        </TableCell> */}
                                        <TableCell align='right'>{appointment.provider_name}</TableCell>
                                        <TableCell align='right'>{appointment.appt_type}</TableCell>
                                        <TableCell align='right'>{appointment.room_num}</TableCell>
                                        <TableCell align='right'>{appointment.date}</TableCell>
                                        <TableCell align='right'>{appointment.start_time}</TableCell>
                                        <TableCell align='right'>{appointment.end_time}</TableCell>

                                        {appointment.status === 'cancelled' && (
                                            <>
                                                <TableCell align='right' sx={{ color: 'red' }}>
                                                    Cancelled by Provider
                                                </TableCell>
                                                <TableCell align='right' />
                                            </>
                                        )}
                                        {appointment.is_booked === 0 && (appointment.user_id === null || appointment.user_id === undefined) && (
                                            // appointment is open
                                            <>
                                                {/* USER STATUS/BUTTONS */}
                                                {user.role === 'user' && (
                                                    <>
                                                        <TableCell align='right' sx={{ color: 'green' }}>
                                                            Available
                                                        </TableCell>
                                                        <TableCell align='right'>
                                                            <Button variant='contained' size='medium' color='primary' onClick={() => onBook!(appointment)}>
                                                                Book
                                                            </Button>
                                                        </TableCell>
                                                    </>
                                                )}
                                                {/* PROVIDER STATUS/BUTTONS */}
                                                {user.role === 'provider' && (
                                                    <>
                                                        <TableCell align='right' sx={{ color: 'green' }}>
                                                            Open
                                                        </TableCell>
                                                        <TableCell align='right'>
                                                            <Button variant='contained' size='medium' color='primary' onClick={() => onCancel!(appointment)}>
                                                                Cancel
                                                            </Button>
                                                        </TableCell>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {appointment.is_booked === 1 && (appointment.user_id !== null || appointment.user_id !== undefined) && appointment.user_id === user.userID && (
                                            // appointment is booked by current user
                                            <>
                                                <TableCell align='right' sx={{ color: 'green' }}>
                                                    Booked by You
                                                </TableCell>
                                                <TableCell align='right'>
                                                    <Button variant='contained' size='medium' color='primary' onClick={() => onCancel!(appointment)}>
                                                        Cancel
                                                    </Button>
                                                </TableCell>
                                            </>
                                        )}
                                        {appointment.is_booked === 1 && appointment.user_id !== null && appointment.user_id !== user.userID && (
                                            //appointment is booked, but not by current user
                                            <>
                                                {user.role === 'user' && (
                                                    <>
                                                        <TableCell align='right' sx={{ color: 'red' }}>
                                                            Booked
                                                        </TableCell>
                                                        <TableCell align='right'>{/* {appointment.status} */}</TableCell>
                                                    </>
                                                )}
                                                {user.role === 'provider' && (
                                                    <>
                                                        <TableCell align='right' sx={{ color: 'red' }}>
                                                            Full
                                                        </TableCell>

                                                        {/* PROVIDER'S APPOINTMENT */}
                                                        {user.userID === appointment.provider_id && (
                                                            <TableCell align='right'>
                                                                <Button variant='contained' size='medium' color='primary' onClick={() => onCancel!(appointment)}>
                                                                    Cancel
                                                                </Button>
                                                            </TableCell>
                                                        )}

                                                        {/* NOT PROVIDER'S APPOINTMENT */}
                                                        {user.userID !== appointment.provider_id && <TableCell align='right'></TableCell>}
                                                    </>
                                                )}
                                            </>
                                        )}
                                        <span />
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            </Container>
        </>
    );
}
