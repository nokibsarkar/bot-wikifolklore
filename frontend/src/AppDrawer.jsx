import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import AccountCircle from '@mui/icons-material/AccountCircle';

const AppDrawer = ({ open = true, setOpen, anchor = 'left', user, toolName, components }) => {
    return (
        <SwipeableDrawer
            anchor="left"
            open={open}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            sx={{
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    // width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box
                sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
                role="presentation"
            //   onClick={toggleDrawer}
            //   onKeyDown={toggleDrawer}
            >
                <List>
                    <ListItem key='username'>
                        <ListItemIcon>
                            <AccountCircle />
                        </ListItemIcon>
                        <ListItemText primary={user?.username} />
                    </ListItem>
                </List>
                <Divider />
                <List>
                    {components?.map((comp, index) => comp && (
                        <ListItem key={comp?.text} disablePadding
                            sx={{
                                '&:hover': {
                                    backgroundColor: '#e0e0e0',
                                    color: '#000000'
                                },
                                '&.Mui-selected': {
                                    backgroundColor: '#e0e0e0',
                                    color: '#000000'
                                },
                                backgroundColor: comp?.active ? '#e0e0e0' : 'inherit',
                            }}
                        >
                            <ListItemButton>
                                <ListItemIcon>
                                    {comp?.icon}
                                </ListItemIcon>
                                <ListItemText primary={comp?.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </SwipeableDrawer>
    )
}
export default AppDrawer;