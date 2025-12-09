import { Button, Divider, List, ListItem, ListItemText, ListSubheader, Paper, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import type { Appointment, User } from '../types';
import CustomHeader from './CustomHeader';

type Props = {
    appointments?: Appointment[];
    user: User;
    onBook?: (appt: Appointment) => void;
    onCancel?: (appt: Appointment) => void;
    listTitle?: string;
    variant?: 'provider' | 'user' | 'admin' | '';
};

export default function SlotListSimple({ appointments = [], user, onBook, onCancel, listTitle = '', variant = '' }: Props) {
    const visibleAppointments = useMemo(() => {
        // Work from a local copy, never mutate props
        let list = Array.isArray(appointments) ? appointments : [];

        // provider variant: only keep appointments for this provider
        if (variant === 'provider') {
            const providerUid = (user as any).userID ?? (user as any).user_id;
            list = list.filter((a) => a.provider_id === providerUid);
        }

        // always exclude cancelled
        return list.filter((a) => a.status !== 'cancelled' && a.status !== 'completed');
    }, [appointments, variant, user]);

    if (!visibleAppointments.length) {
        return (
            <Paper elevation={3} sx={{ p: 2, mt: 4, margin: 'auto' }}>
                <Typography>No upcoming appointments.</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ flexGrow: 1, margin: 'auto' }}>
            <List
                sx={{ maxHeight: 480, overflow: 'auto' }}
                subheader={
                    <ListSubheader component='div' sx={{ bgcolor: 'background.paper' }}>
                        <CustomHeader text={listTitle} margin={2} variant='h6' link={false} />
                    </ListSubheader>
                }
            >
                {visibleAppointments.map((a, i) => {
                    const key = `${a.provider_name}-${a.start_time}-${i}`;

                    // Build the three lines exactly as requested
                    const primary = `${a.title} | ${a.provider_firstname} ${a.provider_lastname} | ${a.appt_type}`;
                    const secondary = `Room ${a.room_num} | status: ${a.status}`;
                    const tertiary = `${a.date} | ${a.start_time} - ${a.end_time}`;

                    const booked = Number(a.is_booked ?? 0) !== 0;
                    const showBook = user.role === 'user' && !booked && typeof onBook === 'function';
                    const showCancel = user.role === 'user' && booked && user.userID === a.user_id && typeof onCancel === 'function';
                    const showProviderCancel = user.role === 'provider' && user.userID === a.provider_id && typeof onCancel === 'function';
                    const showOpen = user.role === 'provider' && !booked;
                    const showFull = user.role === 'provider' && booked;

                    return (
                        <React.Fragment key={key}>
                            <ListItem
                                alignItems='flex-start'
                                secondaryAction={
                                    showBook ? (
                                        <Button variant='contained' size='small' onClick={() => onBook!(a)}>
                                            Book
                                        </Button>
                                    ) : showCancel ? (
                                        <Button variant='contained' size='small' onClick={() => onCancel!(a)}>
                                            Cancel
                                        </Button>
                                    ) : showProviderCancel ? (
                                        <Button variant='contained' size='small' onClick={() => onCancel!(a)}>
                                            Cancel
                                        </Button>
                                    ) : showOpen ? (
                                        <Typography variant='body2' color='green' sx={{ minWidth: 72, textAlign: 'right' }}>
                                            Open
                                        </Typography>
                                    ) : showFull ? (
                                        <Typography variant='body2' color='red' sx={{ minWidth: 72, textAlign: 'right' }}>
                                            Full
                                        </Typography>
                                    ) : (
                                        <Typography variant='body2' color='red' sx={{ minWidth: 72, textAlign: 'right' }}>
                                            {a.status}
                                        </Typography>
                                    )
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                            {primary}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant='body2' color='text.secondary'>
                                                {secondary}
                                            </Typography>
                                            <Typography variant='body2' color='text.secondary'>
                                                {tertiary}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                            {i < appointments.length - 1 && <Divider component='li' />}
                        </React.Fragment>
                    );
                })}
            </List>
        </Paper>
    );
}
