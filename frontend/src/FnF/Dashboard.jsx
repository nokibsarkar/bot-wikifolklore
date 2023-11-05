import { Box, Button, Card, CardActions, CardContent, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import SettingIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import Footer from "../Layout/Footer";
import Server from "./Server";
export default function Description({ user }) {
    const sections = [];
    if(Server.hasAccess(user.rights, Server.RIGHTS.TASK))
        sections.push(
            <Box key="task" sx={{ display: 'flex', flexDirection: 'row', p: 1, alignItems: 'center', justifyContent: 'center' }} component="fieldset">
            <legend>List Generation</legend>
            <Button variant="contained" color="primary" size="small" sx={{
                padding: 1,
                m: 1
            }}
                component={Link}
                to="/fnf/task/create"
            >
                <AddIcon /> &nbsp; Add Task
            </Button>
            <Button variant="contained" color="secondary" size="small" sx={{
                padding: 1,
                m: 1
            }}
                component={Link}
                to="/fnf/task"
            >
                <ListIcon /> &nbsp; List Tasks
            </Button>
        </Box>
        );
    if(Server.hasAccess(user.rights, Server.RIGHTS.TOPIC))
        sections.push(
            <Box key="topic" sx={{ display: 'flex', flexDirection: 'row', p: 1, alignItems: 'center', justifyContent: 'center' }} component="fieldset">
            <legend>Topic Management</legend>
            <Button variant="contained" color="primary" size="small" sx={{
                padding: 1,
                m: 1
            }}
                component={Link}
                to="/fnf/topic/create"
            >
                <AddIcon /> &nbsp; Create New Topic
            </Button>
            <Button variant="contained" color="secondary" size="small" sx={{
                padding: 1,
                m: 1
            }}
                component={Link}
                to="/fnf/topic"
            >
                <ListIcon /> &nbsp; See All Topics
            </Button>
        </Box>
        );
    if(Server.hasAccess(user.rights, Server.RIGHTS.STATS))
        sections.push(
            <Box key="user" sx={{ display: 'flex', flexDirection: 'row', p: 1, alignItems: 'center', justifyContent: 'center' }} component="fieldset">
            <legend>User Management</legend>
            <Button variant="contained" color="primary" size="small" sx={{
                padding: 1,
                m: 1
            }}
                component={Link}
                to="/fnf/setting"
            >
                <SettingIcon /> &nbsp; Settings
            </Button>
            <Button variant="contained" color="secondary" size="small" sx={{
                padding: 1,
                m: 1
            }}
                component={Link}
                to="/fnf/user"
            >
                <PeopleIcon /> &nbsp; See All Users
            </Button>
        </Box>
        );
    return (
        <Paper sx={{
            height: "100%",
            width: "100%",
            m: 0,
            border: 0,
            outline: 0,
            position: 'absolute',
        }}>
            <Typography variant="title" component="h2" sx={{
                textAlign: 'center',
                m: 2
            }}>
                Welcome {user.username},<br/>
            </Typography>
            <Typography sx={{ mb: 1.5, textAlign: 'center' }} color="text.secondary">
            Introducing a powerful tool that identifies articles in the English Wikipedia that are absent from your native language Wikipedia.
            You can customize your selection criteria, and our tool will provide you with a table displaying the missing articles along with suggested titles.
            You also have the option to download the list in both CSV and wikitables formats.
            Explore the gap and enhance your language's Wikipedia with ease.
            </Typography>
            <hr />
            
            {sections}
            <Footer />
        </Paper>
    )
}