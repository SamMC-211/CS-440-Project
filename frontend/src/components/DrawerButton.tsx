import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
// import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Badge, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';

type User = {
    userID: number | null;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    providerName: string;
};

type Notification = {
    notif_id: number;
    user_id: number;
    time: string;
    message: string;
};

type Props = {
    user: User;
};

export default function TemporaryDrawer({ user }: Props) {
    const [open, setOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState<Notification[]>([]);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);

        // Fetch notifications when drawer opens
        if (newOpen) {
            fetchUserNotifications();
        }
    };

    async function fetchUserNotifications() {
        if (!user.userID) return;

        console.log('Get User Notifications For:' + user);
        try {
            const res = await fetch('api/notifications/user', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userID: user.userID }),
            });

            const data = await res.json();

            if (data.ok) {
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
                <Badge badgeContent={notifications.length} color='secondary'>
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}
