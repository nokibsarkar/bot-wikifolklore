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
import Footer from './Footer';
const Tool = (comp) => {
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
            backgroundColor: expanded? '#e0e0e0' : 'inherit',
        }}
    >

        <ListItemButton onClick={ e=> setExpanded(!expanded)}>
            <ListItemIcon>
                {comp?.icon}
            </ListItemIcon>
            <ListItemText primary={comp?.name} />
            {expanded? <CollapseIcon /> : <ExpandedIcon />}
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
                }}
            >
                <ListItemButton component={Link} to={child?.path}>
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
                {components?.map((comp, index) => comp && <Tool key={comp?.name} {...comp} />)}

            </Box>
        </SwipeableDrawer>
    )
}
export default AppDrawer;