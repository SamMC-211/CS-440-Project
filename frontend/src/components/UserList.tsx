import * as React from 'react';
import Button from '@mui/material/Button';
import { Snackbar, Grow, Alert, Paper, List, ListSubheader, ListItem, Divider, Typography, ListItemText, Box, TextField, InputAdornment } from '@mui/material';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import type { Appointment, User } from '../types';
import { useGridRowSelectionPreProcessors } from '@mui/x-data-grid/internals';
import { useMemo, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CustomHeader from './CustomHeader';

type Props = {
    users?: User[];
    user: User;
    activateUser?: (user: User) => void;
    deactivateUser?: (user: User) => void;
};

export default function UserList({ users = [], user, activateUser, deactivateUser }: Props) {
    const [search, setSearch] = useState('');
    const [viewing, setViewing] = useState<number | null>(null);

    const visibleUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];
        if (viewing !== null) return users.filter((a) => a.userID === viewing);
        const query = search.toLowerCase();
        return users.filter((a) => {
            const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
            const email = `${a.email}`.toLowerCase();
            return fullName.includes(query) || email.includes(query);
        });
    }, [users, user, search, viewing]);

    // useEffect(() => {
    // fetch('/api/users/active', { method: 'GET', credentials: 'include' })
    //     .then((res) => res.json())
    //     .then((data) => {
    //         if (data.ok) {
    //             setUser({
    //                 userID: data.user.user_id,
    //                 firstName: data.user.first_name,
    //                 lastName: data.user.last_name,
    //                 role: data.user.role,
    //                 email: data.user.email,
    //                 providerName: data.user.provider_name,
    //                 isActive: data.user.is_active,
    //             });
    //             if (data.user.role === 'admin') {
    //                 setCurrentToggleButtons(adminToggleButtons);
    //                 getUserList();
    //             } else if (data.user.role === 'provider') {
    //                 setCurrentToggleButtons(providerToggleButtons);
    //             } else {
    //                 setCurrentToggleButtons(userToggleButtons);
    //                 getBookedAppointments(data.user);
    //                 // getUserNotifications(data.user as User);
    //             }
    //         } else {
    //             setError('Failed to fetch user');
    //         }
    //     })
    //     .catch((err) => console.error(err));
    // getAppointments();
    // }, [viewing]);

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
                        const showActivate = a.isActive == 0;

                        return (
                            <React.Fragment key={key}>
                                <ListItem
                                    alignItems='flex-start'
                                    secondaryAction={
                                        <Box display='flex' gap={1}>
                                            {viewing === null && (
                                                <Button variant='contained' size='small' onClick={() => setViewing(a.userID)}>
                                                    View
                                                </Button>
                                            )}
                                            {viewing !== null && a.role === 'provider' && (
                                                <Button variant='contained' size='small' onClick={() => setViewing(a.userID)}>
                                                    Cancel All Appointments
                                                </Button>
                                            )}
                                            {showActivate ? (
                                                <Button variant='contained' size='small' onClick={() => activateUser!(a)}>
                                                    Activate
                                                </Button>
                                            ) : (
                                                <Button variant='contained' size='small' onClick={() => deactivateUser!(a)}>
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
                    {viewing !== null && <CustomHeader text='User Appointments' variant='h4' margin={4} link={false} />}
                </List>
            </Paper>
        </>
    );
}
