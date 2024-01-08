import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ExpandedIcon from '@mui/icons-material/ExpandMore';
import CollapseIcon from '@mui/icons-material/ExpandLess';
import React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import Collapse from '@mui/material/Collapse';
import BugIcon from '@mui/icons-material/BugReport';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
const Tool = (comp, user) => {
    const [expanded, setExpanded] = React.useState(true);
    return <List>
        <ListItem key={comp?.name} disablePadding
            sx={{
                '&:hover': {
                    backgroundColor: '#e0e0e0',
                    color: '#000000'
                },
                '&.Mui-selected': {
                    backgroundColor: '#e0e0e0',
                    color: '#000000'
                },
                backgroundColor: expanded ? '#e0e0e0' : 'inherit',
            }}
        >
            <ListItemButton component={Link} to={comp?.path} onClick={() => setExpanded(!expanded)}>
                <ListItemIcon>
                    {comp?.icon}
                </ListItemIcon>
                <ListItemText primary={comp?.name} />
                {expanded ? <CollapseIcon /> : <ExpandedIcon />}
            </ListItemButton>

        </ListItem>
        <Collapse in={expanded}>
            {comp?.children?.map((child, index) => (
                <ListItem key={child?.name} disablePadding
                    sx={{
                        '&:hover': {
                            backgroundColor: '#e0e0e0',
                            color: '#000000'
                        },
                        '&.Mui-selected': {
                            backgroundColor: '#e0e0e0',
                            color: '#000000'
                        },
                        backgroundColor: child?.active ? '#e0e0e0' : 'inherit',
                        textDecoration: 'none',
                        
                    }}
                >
                    <ListItemButton onClick={comp?.closeDrawer} component={Link} to={child?.path}>
                        <ListItemIcon>
                            {child?.icon}
                        </ListItemIcon>
                        <ListItemText primary={child?.name} />
                    </ListItemButton>
                </ListItem>
            ))}
        </Collapse>
    </List>
}
const AppDrawer = ({ open = true, setOpen, anchor = 'left', user, toolName, components, setFeedbackOpen }) => {

    const gotoHome = () => {
        window.location.href = '/';
    }
    const closeDrawer = () => setOpen(false)

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
              
            >
                <List>
                    <ListItem key='username'>
                        <ListItemIcon>
                            <AccountCircle />
                        </ListItemIcon>
                        <ListItemText primary={user?.username} />
                    </ListItem>
                    <ListItem key='home' disablePadding>
                        <ListItemButton onClick={gotoHome}>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary='Home' />
                        </ListItemButton>
                    </ListItem>
                </List>
                <Divider />
                {components?.map((comp, index) => comp && <Tool key={comp?.name} {...comp} closeDrawer={closeDrawer} />)}
                <Divider />
                <List>
                    <ListItem key='report' disablePadding>
                        <ListItemButton 
                            component={Link} to='https://github.com/nokibsarkar/bot-wikifolklore/issues'
                            target='_blank'
                        >
                            <ListItemIcon>
                                <BugIcon />
                            </ListItemIcon>
                            <ListItemText primary='Report Bug' />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key='feedback' disablePadding>
                        <ListItemButton onClick={e => setFeedbackOpen(true)}
                        >
                            <ListItemIcon>
                                <StarIcon />
                            </ListItemIcon>
                            <ListItemText primary='Give us Feedback' />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </SwipeableDrawer>
    )
}
export default AppDrawer;