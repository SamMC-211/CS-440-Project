import React from 'react';
import { List, ListSubheader, ListItem, ListItemText, Divider, Paper, Button, Typography } from '@mui/material';

type Appointment = {
    date: string;
    title: string;
    appt_id: number;
    provider_name: string;
    provider_firstname: string;
    provider_lastname: string;
    appt_type: string;
    room_num: number | string;
    status: string;
    is_booked: number | boolean;
    start_time: string;
    end_time: string;
    description: string;
};

type Props = {
    appointments: Appointment[];
    role?: 'user' | 'provider';
    onBook?: (appt: Appointment) => void;
    listTitle?: string;
};

export default function SlotListSimple({ appointments, role = 'user', onBook, listTitle = 'Available Sessions' }: Props) {
    if (!appointments || appointments.length === 0) {
        return (
            <Paper elevation={3} sx={{ p: 2, mt: 4, margin: 'auto' }}>
                <Typography>No appointments available.</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ flexGrow: 1, margin: 'auto', mt: 4 }}>
            <List
                sx={{ maxHeight: 480, overflow: 'auto' }}
                subheader={
                    <ListSubheader component='div' sx={{ bgcolor: 'background.paper' }}>
                        {listTitle}
                    </ListSubheader>
                }
            >
                {appointments.map((a, i) => {
                    const key = `${a.provider_name}-${a.start_time}-${i}`;

                    // Build the three lines exactly as requested
                    const primary = `${a.title} | ${a.provider_firstname} ${a.provider_lastname} | ${a.appt_type}`;
                    const secondary = `Room ${a.room_num} | status: ${a.status}`;
                    const tertiary = `${a.date} | ${a.start_time} - ${a.end_time}`;

                    const booked = Number(a.is_booked ?? 0) !== 0;
                    const showBook = role === 'user' && !booked && typeof onBook === 'function';

                    return (
                        <React.Fragment key={key}>
                            <ListItem
                                alignItems='flex-start'
                                secondaryAction={
                                    showBook ? (
                                        <Button variant='contained' size='small' onClick={() => onBook!(a)}>
                                            Book
                                        </Button>
                                    ) : (
                                        <Typography variant='body2' color='text.secondary' sx={{ minWidth: 72, textAlign: 'right' }}>
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
