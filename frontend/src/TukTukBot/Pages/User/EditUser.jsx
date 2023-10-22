
import LinearProgress from '@mui/material/LinearProgress';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import { useCallback, useMemo, useState } from "react";
import AutoComplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import DownloadIcon from '@mui/icons-material/Download';
import Box from '@mui/material/Box';
import Server from "../../Server.ts";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CheckBox from '@mui/material/Checkbox';

import { Typography } from '@mui/material';

const EditUser = ({ user : currentUser }) => {
    const [user, setUser] = useState(null);
    const [rights, setRights] = useState(user?.rights || 0);
    const [refreshKey, setRefreshKey] = useState(0);
    const id = new URLSearchParams(window.location.search).get('id');
    useState(() => {
        if(!id)
            return;
        Server.getUser(id).then(u => {
            setUser(u);
            setRights(u.rights);
        })
    }, [id, refreshKey])
    const save = useCallback(() => {
        Server.updateUser({id, rights}).then((user) => {
            setUser(user);
            setRights(user.rights);
        })
    }, [id, rights])
    if(!user)
        return <LinearProgress />
    if (Server.hasAccess(currentUser.rights, Server.RIGHTS.GRANT) === false)
        return <h1>Access Denied</h1>;
    return (
        <Box>
            <Card>
                <CardHeader title={user.username} action={
                    <Button variant="contained" onClick={save}>
                        Save
                    </Button>
                } />
                <CardContent>
                    <Typography variant="h6" component="div">
                        Rights
                    </Typography>
                    <Divider />
                    <List>
                        <ListItem>
                            <ListItemText primary="Task Rights" />
                            <CheckBox sx={{cursor : 'pointer'}} disabled checked={Server.hasAccess(rights, Server.RIGHTS.TASK)} /* onClick={() => setRights(Server.toggleAccess(rights, Server.RIGHTS.TASK))}*/ />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Topic Rights" />
                            <CheckBox sx={{cursor : 'pointer'}} checked={Server.hasAccess(rights, Server.RIGHTS.TOPIC)} onClick={() => setRights(Server.toggleAccess(rights, Server.RIGHTS.TOPIC))} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Stats Rights" />
                            <CheckBox sx={{cursor : 'pointer'}} checked={Server.hasAccess(rights, Server.RIGHTS.STATS)} onClick={() => setRights(Server.toggleAccess(rights, Server.RIGHTS.STATS))} />
                        </ListItem>

                        <ListItem>
                            <ListItemText primary="Grant Rights" />
                            <CheckBox sx={{cursor : 'pointer'}} checked={Server.hasAccess(rights, Server.RIGHTS.GRANT)} onClick={() => setRights(Server.toggleAccess(rights, Server.RIGHTS.GRANT))} />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </Box>
    )
}
export default EditUser