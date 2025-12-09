import * as React from 'react';
import Button from '@mui/material/Button';
import { Snackbar, Grow, Alert, Paper, List, ListSubheader, ListItem, Divider, Typography, ListItemText, Box, TextField, InputAdornment } from '@mui/material';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import type { Appointment, User } from '../types';
import { useGridRowSelectionPreProcessors } from '@mui/x-data-grid/internals';
import { useEffect, useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CustomHeader from './CustomHeader';

type Props = {
    users?: User[];
    user: User;
    activateUser?: (user: User) => void;
    deactivateUser?: (user: User) => void;
    cancelAppointment?: (appt: Appointment, userID: number | null) => void;
};

export default function UserList({ users = [], user, activateUser, deactivateUser, cancelAppointment }: Props) {
    const [search, setSearch] = useState('');
    const [viewing, setViewing] = useState<number | null>(null);
    const [viewingAppointments, setViewingAppointments] = useState<Appointment[]>([]);
    const [refreshCounter, setRefreshCounter] = useState(0);

    const visibleUsers = useMemo(() => {
        //If array is empty return an empty list
        if (!Array.isArray(users)) return [];
        //If viewing a user, filter out other users from array
        if (viewing !== null) return users.filter((a) => a.userID === viewing);
        //Filter array based on search bar
        const query = search.toLowerCase();
        return users.filter((a) => {
            const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
            const email = `${a.email}`.toLowerCase();
            return fullName.includes(query) || email.includes(query);
        });
    }, [users, user, search, viewing]);

    //Pull viewed user appointments
    useEffect(() => {
        //capture visibleUsers
        const user0 = visibleUsers[0];

        //if user is not an admin, or visible users is empty return
        if (user.role !== 'admin' || !user0 || user0.userID === null) return;

        const fetchAppointments = async () => {
            try {
                let res;
                if (user0.role === 'provider') {
                    const params = new URLSearchParams({
                        role: user.role,
                        providerID: user0.userID.toString(),
                    });

                    res = await fetch(`/api/appointments/provider?${params.toString()}`, {
                        method: 'GET',
                        credentials: 'include',
                    });
                } else {
                    const params = new URLSearchParams({
                        role: user.role,
                        userID: user0.userID.toString(),
                    });

                    res = await fetch(`/api/appointments/booked/user?${params.toString()}`, {
                        method: 'GET',
                        credentials: 'include',
                    });
                }

                const data = await res.json();

                if (!res.ok || data.ok === false) {
                    console.log(data.message);
                    return;
                }

                setViewingAppointments(data.results);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAppointments();
    }, [user.role, viewing, refreshCounter]);

    return (
        <>
            <Box display='flex' alignItems='center' sx={{ gap: 1, pr: 2, pb: 2 }}>
                <Box flexGrow={1} />
                {viewing !== null && (
                    <Button variant='contained' onClick={() => setViewing(null)}>
                        Return to Search
                    </Button>
                )}
                {viewing === null && (
                    <TextField
                        variant='outlined'
                        size='small'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search Users'
                        slotProps={{
                            input: {
                                sx: {
                                    color: 'white',
                                },
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: search ? (
                                    <InputAdornment position='end'>
                                        <IconButton onClick={() => setSearch('')} edge='end' sx={{ color: 'white' }} size='small'>
                                            <CloseIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null,
                            },
                        }}
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
                            '& .MuiSvgIcon-root': {
                                color: 'white',
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: 'white',
                            },
                        }}
                    />
                )}
            </Box>
            <Paper elevation={3} sx={{ flexGrow: 1, margin: 'auto' }}>
                {viewing === null && <CustomHeader text='User Search' variant='h4' margin={4} link={false} />}
                <List sx={{ maxHeight: 1000, overflow: 'auto' }}>
                    {/* {viewing === null && */}

                    {visibleUsers.map((a, i) => {
                        console.log(a);
                        const key = `${a.userID}`;
                        const name = `${a.firstName} ${a.lastName}`;
                        const email = `${a.email}`;
                        // const two = `${a.firstName} ${a.lastName}  | `;
                        const role = `${a.role} `;
                        const showActivate = a.role !== 'admin' && a.isActive === 0;
                        const showDeactivate = a.role !== 'admin' && a.isActive === 1;

                        return (
                            <React.Fragment key={key}>
                                <ListItem
                                    alignItems='flex-start'
                                    secondaryAction={
                                        <Box display='flex' gap={1}>
                                            {viewing === null && a.role !== 'admin' && (
                                                <Button variant='contained' size='small' onClick={() => setViewing(a.userID)}>
                                                    View
                                                </Button>
                                            )}
                                            {showActivate && (
                                                <Button
                                                    variant='contained'
                                                    size='small'
                                                    onClick={() => {
                                                        activateUser!(a);
                                                        setRefreshCounter((prev) => prev + 1);
                                                    }}
                                                >
                                                    Activate
                                                </Button>
                                            )}
                                            {showDeactivate && (
                                                <Button
                                                    variant='contained'
                                                    size='small'
                                                    onClick={() => {
                                                        deactivateUser!(a);
                                                        setRefreshCounter((prev) => prev + 1);
                                                    }}
                                                >
                                                    Deactivate
                                                </Button>
                                            )}
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                {name + ' | ' + email}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                    {'Role: ' + role}
                                                </Typography>
                                                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                    {'UserID: ' + key}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                                {i < users.length - 1 && <Divider component='li' />}
                            </React.Fragment>
                        );
                    })}

                    {/* USER Appointment Display */}
                    {viewing !== null && visibleUsers[0].role === 'user' && (
                        <>
                            <CustomHeader text='User Appointments' variant='h4' margin={4} link={false} />

                            {viewingAppointments.map((a, i) => {
                                const key = `${a.appt_id}`;
                                const appointmentTitle = `${a.title}`;
                                const providerName = `${a.provider_firstname} ${a.provider_lastname}`;
                                const type = `${a.appt_type}`;
                                const roomNum = `${a.room_num}`;
                                const date = `${a.date}`;
                                const startTime = `${a.start_time}`;
                                const endTime = `${a.end_time}`;

                                return (
                                    <React.Fragment key={key}>
                                        <ListItem
                                            alignItems='flex-start'
                                            secondaryAction={
                                                <Box display='flex' gap={1}>
                                                    {/* {status === 'booked' && (
                                                        // <Button variant='contained' size='small' onClick={() => ()}>
                                                        //     View
                                                        // </Button>
                                                    )} */}
                                                </Box>
                                            }
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                        {appointmentTitle + ' | ' + providerName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                            {type + ' | ' + 'Room: ' + roomNum}
                                                        </Typography>
                                                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                            {date + ' | ' + startTime + ' - ' + endTime}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component='li' />
                                    </React.Fragment>
                                );
                            })}
                        </>
                    )}
                    {/* PROVIDER Appointment Display */}
                    {viewing !== null && visibleUsers[0].role === 'provider' && (
                        <>
                            <CustomHeader text='Provider Appointments' variant='h4' margin={4} link={false} />

                            {viewingAppointments.map((a, i) => {
                                const key = `${a.appt_id}`;
                                const appointmentTitle = `${a.title}`;
                                const userID = `${a.user_id}`;
                                const type = `${a.appt_type}`;
                                const roomNum = `${a.room_num}`;
                                const date = `${a.date}`;
                                const startTime = `${a.start_time}`;
                                const endTime = `${a.end_time}`;
                                const status = `${a.status}`;
                                return (
                                    <React.Fragment key={key}>
                                        <ListItem
                                            alignItems='flex-start'
                                            secondaryAction={
                                                <Box display='flex' gap={1}>
                                                    {status !== 'cancelled' && status !== 'completed' && (
                                                        <Button
                                                            variant='contained'
                                                            size='small'
                                                            onClick={() => {
                                                                cancelAppointment!(a, visibleUsers[0].userID);
                                                                setRefreshCounter((prev) => prev + 1);
                                                            }}
                                                        >
                                                            Cancel Appointment
                                                        </Button>
                                                    )}
                                                </Box>
                                            }
                                        >
                                            <ListItemText
                                                primary={
                                                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                        {appointmentTitle + ' | Status: '}
                                                        <Box
                                                            component='span'
                                                            sx={{
                                                                color: status === 'booked' ? 'green' : status === 'completed' ? 'blue' : status === 'cancelled' ? 'red' : 'inherit', // default
                                                                fontWeight: 700, // optional: make status bold
                                                            }}
                                                        >
                                                            {status}
                                                        </Box>
                                                    </Typography>
                                                }
                                                secondary={
                                                    <>
                                                        {status === 'booked' && (
                                                            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                                {'Booked By User: ' + userID}
                                                            </Typography>
                                                        )}
                                                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                            {type + ' | ' + 'Room: ' + roomNum}
                                                        </Typography>
                                                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                                            {date + ' | ' + startTime + ' - ' + endTime}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component='li' />
                                    </React.Fragment>
                                );
                            })}
                        </>
                    )}
                </List>
            </Paper>
        </>
    );
}
