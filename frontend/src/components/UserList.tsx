import * as React from 'react';
import Button from '@mui/material/Button';
import { Snackbar, Grow, Alert, Paper, List, ListSubheader, ListItem, Divider } from '@mui/material';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import type { Appointment, User } from '../types';
import { useGridRowSelectionPreProcessors } from '@mui/x-data-grid/internals';
import { useMemo } from 'react';

type Props = {
    users?: User[];
    user: User;
    activateUser?: (user: User) => void;
    deactivateUser?: (user: User) => void;
};

export default function UserList({ users = [], user, activateUser, deactivateUser} : Props) {

    const visibleUsers = useMemo(() => {
        return  Array.isArray(users) ? users : [];

        
    }, [users, user]);

    

 return (
    <Paper elevation={3} sx={{ flexGrow: 1, margin: 'auto' }}>
            <List
                sx={{ maxHeight: 480, overflow: 'auto' }}
                subheader={
                    <ListSubheader component='div' sx={{ bgcolor: 'background.paper' }}>
                        { "UserData" }
                    </ListSubheader>
                }
            >
                {visibleUsers.map((a, i) => {
                    const key = `${a.userID} | ${a.email} ${a.firstName} ${a.lastName} ${a.role} ${i}`;
                    const showActivate = a.isActive == 0;

                    return (
                        <React.Fragment key={key}>
                            <ListItem
                                alignItems='flex-start'
                                secondaryAction={
                                    showActivate ? (
                                        <Button variant='contained' size='small' onClick={() => activateUser!(a)}>
                                            Book
                                        </Button>
                                    ) : (
                                        <Button variant='contained' size='small' onClick={() => deactivateUser!(a)}>
                                            Cancel
                                        </Button>
                                    )
                                }
                            >
                            </ListItem>
                            {i < users.length - 1 && <Divider component='li' />}
                        </React.Fragment>
                    );
                })}
            </List>
        </Paper>

    );
}