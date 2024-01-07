
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
import CampWizServer from "../../Server.ts";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import Footer from '../../../Layout/Footer.jsx';
const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 300 },
    
    { field: 'rights', headerName: 'Rights', flex : 1, renderCell: (params) => {
        const rights = params.value;
        const chips = [];
        if (CampWizServer.BaseServer.hasAccess(rights, CampWizServer.BaseServer.RIGHTS.GRANT))
            chips.push(<Chip label="G" color="error" key="grant" size='small' />);
        if (CampWizServer.BaseServer.hasAccess(rights, CampWizServer.BaseServer.RIGHTS.STATS))
            chips.push(<Chip label="S" color="success" key="stats" size='small'/>);
        if (CampWizServer.BaseServer.hasAccess(rights, CampWizServer.BaseServer.RIGHTS.CAMPAIGN))
            chips.push(<Chip label="C" color="success" key="topic" size='small'/>);
        return <div>{chips}</div>
    }, minWidth: 130},
    { field: 'action', headerName: 'Action', width: 130, renderCell: (params) => params.value },
    { field: 'campaign_count', headerName: 'Campaign Count', minWidth: 130, flex: 1 },
];
const ListUser = ({ user }) => {
    const [users, setUsers] = useState([]);
    const hasStatAccess = CampWizServer.hasAccess(user.rights, CampWizServer.RIGHTS.STATS);
    const hasGrantAccess = CampWizServer.hasAccess(user.rights, CampWizServer.RIGHTS.GRANT);
    const hasAccess = hasStatAccess || hasGrantAccess;
    useState(() => {
        CampWizServer.User.getUsers().then(users => {
            setUsers(users)
        })
    }, [])
    const rows = useMemo(() => {
        return users?.map(user => {
            return {
                ...user,
                id: user.id,
                username: user.username,
                rights: user.rights,
                action: <Link to={ hasGrantAccess ? `/campwiz/user/edit?id=${user.id}` : ''}>
                    <Button color="primary" variant="contained" disabled={!hasGrantAccess} size="small">
                        <EditIcon />
                    </Button>
                </Link>
            }
        })
    }, [users]);
    const download = useCallback(() => {
        const json = JSON.stringify(users);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.json';
        a.click();
    })
    if (hasAccess === false)
        return <h1>Access Denied</h1>;
    return (
        <Box>
            <Card>
                <CardHeader title="List Users" action={
                    <Button variant="contained" onClick={download} disabled={!hasStatAccess}>
                        <DownloadIcon /> Download Stats
                    </Button>
                } />
                <CardContent>
                    <Box sx={{ border : '1px solid gray', p: 2, width:'fit-content', mb: 5 }}>
                        <Chip label="G" color="error" key="grant" /> : This user can grant rights to other users.<br /><br/>
                        {/* <Chip label="T" color="success" key="task"/> : This user can create tasks.<br />
                        <Chip label="A" color="success" key="article"  /> : This user can create articles.<br />
                        <Chip label="C" color="success" key="category" /> : This user can create categories.<br /> */}
                        <Chip label="S" color="success" key="stats"  /> : This user can view stats.<br /><br/>
                        <Chip label="C" color="success" key="campaign"  /> : This user can approve campaigns.<br />
                    </Box>
                    <Divider />
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection={false}
                        disableSelectionOnClick
                        hideFooterSelectedRowCount
                        density='compact'
                    />
                    {/* <Footer /> */}
                </CardContent>
            </Card>
        </Box>
    )
}
export default ListUser