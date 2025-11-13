import { Alert, Box, Paper, Stack, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import SlotList from './AppointmentList';
import CustomHeader from './CustomHeader';

type AppointmentObject = {
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
    user: User;
    onBook?: (appt: AppointmentObject) => void;
    initialAppointments: AppointmentObject[];
    title: string;
};

const initAppointmentRange = {
    beforeDate: '',
    afterDate: '',
};

export default function QuickViewWindow({ user, onBook, initialAppointments, title }: Props) {
    const [appointmentRange, setAppointmentRange] = useState(initAppointmentRange);
    const [appointmentSearchType, setSearchAppointmentType] = useState('');

    const [error, setError] = useState<string | null>(null);

    const [appointmentList, setAppointmentList] = useState<AppointmentObject[]>();

    //When to update list
    useEffect(() => {
       GetAppointmentsByDateRangeAndType(null, null, null);
    });

    async function GetAppointmentsByDateRangeAndType(type: any = null, minDate: any = null, maxDate: any = null) {
        setError(null);

        //Tries a post request
        try {
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
        }
    }

    return (
        <>
            <Box>
                {error && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Paper elevation={3} sx={{ p: 2, background: '#c1c3c5ff' }}>
                    <Box sx={{ background: 'white' }}>
                        <CustomHeader text={title} margin={6} variant='h4' link={false} />
                        <Box sx={{ p: 2 }}>
                            <TextField
                                select
                                label='Appointment Type'
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
                                color='primary'
                            >
                                <option value=''></option>
                                <option value='Consultation'>Consultation</option>
                                <option value='Training'>Training</option>
                                <option value='Follow-up'>Follow-up</option>
                            </TextField>
                        </Box>

                        <Stack direction='row' spacing={2} sx={{ p: 2, background: 'white' }}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label='After'
                                    value={appointmentRange.afterDate ? new Date(appointmentRange.afterDate) : null} // parse string back to Date for picker
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            const formattedDate = format(newValue, 'MM/dd/yyyy'); // match backend
                                            setAppointmentRange({ ...appointmentRange, afterDate: formattedDate });
                                            GetAppointmentsByDateRangeAndType(null, formattedDate, null);
                                        } else {
                                            setAppointmentRange({ ...appointmentRange, afterDate: '' });
                                            GetAppointmentsByDateRangeAndType(null, '', null);
                                        }
                                    }}
                                />
                            </LocalizationProvider>

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label='Before'
                                    value={appointmentRange.beforeDate ? new Date(appointmentRange.beforeDate) : null} // parse string back to Date for picker
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            const formattedDate = format(newValue, 'MM/dd/yyyy'); // match backend
                                            setAppointmentRange({ ...appointmentRange, beforeDate: formattedDate });
                                            GetAppointmentsByDateRangeAndType(null, null, formattedDate);
                                        } else {
                                            setAppointmentRange({ ...appointmentRange, beforeDate: '' });
                                            GetAppointmentsByDateRangeAndType(null, null, '');
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Stack>
                        <Box sx={{ p: 2, background: 'white' }}>
                            <SlotList user={user} appointments={appointmentList} onBook={(appt) => onBook!(appt)} listTitle='Available Appointments' />
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </>
    );
}
