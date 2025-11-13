import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
// import Button from '@mui/material/Button';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useState } from 'react';
import type { Notification, User } from '../types';

type Props = {
    user: User;
};

export default function TemporaryDrawer({ user }: Props) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [trackNotif, setTrackNotif] = useState({
        listLength: 0,
        newCount: 0,
    });

    useEffect(() => {
        console.log('useEffect: fetchUserNotif (on user)');
        fetchUserNotifications();
    }, [user]);

    //Update notifications
    useEffect(() => {
        // console.log('useEffect: setTrackNotif (on notification)');

        //store length of list before update
        const prevLength = trackNotif.listLength;
        const diff = notifications.length - prevLength;

        //update length, and newCount = existing count + change in list length
        setTrackNotif({ listLength: notifications.length, newCount: trackNotif.newCount + diff });

        // console.log('PrevListLen: ' + prevLength + ' NotifLen: ' + notifications.length);
    }, [notifications]);

    //On drawer toggle
    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);

        // Fetch notifications when drawer opens
        if (newOpen) {
            fetchUserNotifications();
            setTrackNotif({
                ...trackNotif,
                //decrement newCount by number of list items seen
                newCount: trackNotif.newCount - trackNotif.newCount,
            });
        }
    };

    async function fetchUserNotifications() {
        console.log('Get User Notifications For:' + user.userID);
        if (!user.userID) return;

        try {
            const query = new URLSearchParams({ userID: user.userID.toString() });
            const res = await fetch(`api/notifications/user?${query.toString()}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (data.ok) {
                console.log('Set Notifications');
                setNotifications(data.results);
            } else {
                console.error('Failed to fetch notifications:', data.message);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    }

    const DrawerList = (
        <Box sx={{ width: 300 }} role='presentation' onClick={toggleDrawer(false)}>
            <Typography variant='h6' sx={{ p: 2 }}>
                Notifications
            </Typography>
            <Divider />
            <List>
                {notifications.length === 0 && (
                    <ListItem>
                        <ListItemText primary='No notifications' />
                    </ListItem>
                )}

                {notifications.map((notif) => (
                    <ListItem key={notif.notif_id} disablePadding>
                        <ListItemButton>
                            <ListItemText primary={notif.message} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <div>
            <IconButton size='large' edge='end' color='inherit' aria-label='menu' onClick={() => toggleDrawer(true)()}>
                <Badge badgeContent={trackNotif.newCount} color='secondary'>
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}
