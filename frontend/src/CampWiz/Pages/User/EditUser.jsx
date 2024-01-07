
import LinearProgress from '@mui/material/LinearProgress';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import { useCallback, useMemo, useState, forwardRef } from "react";
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
import CampWizServer from "../../Server.ts";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CheckBox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Typography } from '@mui/material';
const Alert = forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={1} ref={ref} variant="filled" {...props} />;
});
const EditUser = ({ user: currentUser }) => {
    const [user, setUser] = useState(null);
    const [rights, setRights] = useState(user?.rights || 0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [saved, setSaved] = useState(false);
    const id = new URLSearchParams(window.location.search).get('id');
    useState(() => {
        if (!id)
            return;
        CampWizServer.User.getUser(id).then(u => {
            setUser(u);
            setRights(u.rights);
        })
    }, [id, refreshKey])
    const save = useCallback(() => {
        CampWizServer.User.updateUser({ id, rights }).then((user) => {
            setUser(user);
            setRights(user.rights);
            setRefreshKey(refreshKey + 1);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        })
    }, [id, rights, refreshKey])
    if (!user)
        return <LinearProgress />
    if (CampWizServer.hasAccess(currentUser.rights, CampWizServer.RIGHTS.GRANT) === false)
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
                            <ListItemText primary="Campaign Rights" />
                            <CheckBox sx={{ cursor: 'pointer' }} checked={CampWizServer.hasAccess(rights, CampWizServer.RIGHTS.CAMPAIGN)} onClick={() => setRights(CampWizServer.toggleAccess(rights, CampWizServer.RIGHTS.CAMPAIGN))} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Stats Rights" />
                            <CheckBox sx={{ cursor: 'pointer' }} checked={CampWizServer.hasAccess(rights, CampWizServer.RIGHTS.STATS)} onClick={() => setRights(CampWizServer.toggleAccess(rights, CampWizServer.RIGHTS.STATS))} />
                        </ListItem>

                        <ListItem>
                            <ListItemText primary="Grant Rights" />
                            <CheckBox sx={{ cursor: 'pointer' }} checked={CampWizServer.hasAccess(rights, CampWizServer.RIGHTS.GRANT)} onClick={() => setRights(CampWizServer.toggleAccess(rights, CampWizServer.RIGHTS.GRANT))} />
                        </ListItem>
                    </List>
                    <Snackbar open={saved} autoHideDuration={6000} anchorOrigin={{vertical : 'bottom', horizontal : 'center'}}>
                        <Alert severity="success" sx={{ width: '100%' }}>
                            Saved Successfully
                        </Alert>
                    </Snackbar>
                    {/* <Footer /> */}
                </CardContent>
            </Card>
        </Box>
    )
}
export default EditUser