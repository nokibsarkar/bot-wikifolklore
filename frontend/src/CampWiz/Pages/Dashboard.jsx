import { Box, Button, Card, CardActions, CardContent, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import SettingIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import Server from "../Server";
import Footer from "../../Layout/Footer";
import { useEffect, useState } from "react";
import CampaignList from "./Campaign";

export default function Description({ user }) {
    const sections = [];
    const [banner, setBanner] = useState('');
    useEffect(() => {
        Server.getConfig().then((res) => {
            if(res?.campwiz?.dashboard?.banner)
                setBanner(res.campwiz.dashboard.banner);
        }
        ).catch((err) => {
            console.log(err);
        });
    }, []);
    // if(Server.hasAccess(user.rights, Server.RIGHTS.TASK))
    //     sections.push(
    //         <Box key="task" sx={{ display: 'flex', flexDirection: 'row', p: 1, alignItems: 'center', justifyContent: 'center' }} component="fieldset">
    //         <legend>List Generation</legend>
    //         <Button variant="contained" color="primary" size="small" sx={{
    //             padding: 1,
    //             m: 1
    //         }}
    //             component={Link}
    //             to="/campwiz/task/create"
    //         >
    //             <AddIcon /> &nbsp; Add Task
    //         </Button>
    //         <Button variant="contained" color="secondary" size="small" sx={{
    //             padding: 1,
    //             m: 1
    //         }}
    //             component={Link}
    //             to="/campwiz/task"
    //         >
    //             <ListIcon /> &nbsp; List Tasks
    //         </Button>
    //     </Box>
    //     );
    // if(Server.hasAccess(user.rights, Server.RIGHTS.TOPIC))
    //     sections.push(
    //         <Box key="topic" sx={{ display: 'flex', flexDirection: 'row', p: 1, alignItems: 'center', justifyContent: 'center' }} component="fieldset">
    //         <legend>Topic Management</legend>
    //         <Button variant="contained" color="primary" size="small" sx={{
    //             padding: 1,
    //             m: 1
    //         }}
    //             component={Link}
    //             to="/campwiz/topic/create"
    //         >
    //             <AddIcon /> &nbsp; Create New Topic
    //         </Button>
    //         <Button variant="contained" color="secondary" size="small" sx={{
    //             padding: 1,
    //             m: 1
    //         }}
    //             component={Link}
    //             to="/campwiz/topic"
    //         >
    //             <ListIcon /> &nbsp; See All Topics
    //         </Button>
    //     </Box>
    //     );
    // sections.push(
    //     <Box key="campaign" sx={{ display: 'flex', flexDirection: 'row', p: 1, alignItems: 'center', justifyContent: 'center' }} component="fieldset">
    //         <legend>Campaign Management</legend>
    //         <Button variant="contained" color="primary" size="small" sx={{
    //             padding: 1,
    //             m: 1
    //         }}
    //             component={Link}
    //             to="/campwiz/campaign/new"
    //         >
    //             <AddIcon /> &nbsp; Create New Campaign
    //         </Button>
    //         <Button variant="contained" color="secondary" size="small" sx={{
    //             padding: 1,
    //             m: 1
    //         }}
    //             component={Link}
    //             to="/campwiz/campaign"
    //         >
    //             <ListIcon /> &nbsp; See All Campaigns
    //         </Button>
    //     </Box>
    // );
    // sections.push(
    //     <Box key="user" sx={{ display: 'flex', flexDirection: 'row', p: 1, alignItems: 'center', justifyContent: 'center' }} component="fieldset">
    //         <legend>User Management</legend>
    //         <Button variant="contained" color="primary" size="small" sx={{
    //             padding: 1,
    //             m: 1
    //         }}
    //             component={Link}
    //             to="/campwiz/setting"
    //         >
    //             <SettingIcon /> &nbsp; Settings
    //         </Button>
    //         {(Server.hasAccess(user.rights, Server.RIGHTS.STATS) || Server.hasAccess(user.rights, Server.RIGHTS.GRANT) ) && 
    //         <Button variant="contained" color="secondary" size="small" sx={{
    //             padding: 1,
    //             m: 1
    //         }}
    //             component={Link}
    //             to="/campwiz/user"
    //         >
    //             <PeopleIcon /> &nbsp; See All Users
    //         </Button>}
    //     </Box>
    // );
    return (
        <Paper sx={{
            // height: "100%",
            width: "100%",
            m: 0,
            border: 0,
            outline: 0,
            position: 'absolute',
            textAlign: 'center',
        }}>
            {banner != '' && <img src={banner} style={{ maxHeight : '150px', maxWidth: '99%'}}/>}
            <Typography variant="title" component="h2" sx={{
                textAlign: 'center',
                m: 2
            }}>
                Welcome {user?.username},<br />
            </Typography>
            <Typography sx={{ mb: 1, textAlign: 'center', p:1, pb:2, display:'block', overflow : 'hidden'}} color="text.secondary">
            Welcome to the Feminism and Folklore Writing Contest, an annual celebration of cultural diversity and gender inclusivity on Wikipedia.
            This contest invites passionate contributors to embark on a journey of documenting local cultural events, folk-related activities, and the often overlooked but significant contributions of women.
            As an integral part of the Wiki Loves Folklore (WLF) campaign, this project goes beyond the lens of photography, encouraging participants to craft compelling narratives through the creation and expansion of Wikipedia articles.
            </Typography>
           <CampaignList />
            <Footer />
        </Paper>
    )
}
