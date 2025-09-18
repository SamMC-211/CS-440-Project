import { List, ListSubheader, ListItem, ListItemText, Divider, Paper } from '@mui/material';

export default function SlotList() {
    return (
        <Paper elevation={3} sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
            <List
                sx={{ maxHeight: 250, overflow: 'auto' }}
                subheader={
                    <ListSubheader component='div' sx={{ bgcolor: 'background.paper' }}>
                        Available Sessions
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary='Trainer 1 | Arobics Class' secondary='10:00 AM - 12:00 PM' />
                </ListItem>
                <Divider component='li' />

                <ListItem>
                    <ListItemText primary='Trainer 1 | Arobics Class' secondary='10:00 AM - 12:00 PM' />
                </ListItem>
                <Divider component='li' />

                <ListItem>
                    <ListItemText primary='Trainer 1 | Arobics Class' secondary='10:00 AM - 12:00 PM' />
                </ListItem>
                <Divider component='li' />
                <ListItem>
                    <ListItemText primary='Trainer 1 | Arobics Class' secondary='10:00 AM - 12:00 PM' />
                </ListItem>
                <Divider component='li' />
                <ListItem>
                    <ListItemText primary='Trainer 1 | Arobics Class' secondary='10:00 AM - 12:00 PM' />
                </ListItem>
                <Divider component='li' />
                <ListItem>
                    <ListItemText primary='Trainer 1 | Arobics Class' secondary='10:00 AM - 12:00 PM' />
                </ListItem>
            </List>
        </Paper>
    );
}
