
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
import Chip from '@mui/material/Chip';
import { DataGrid } from '@mui/x-data-grid';
import { Link } from 'react-router-dom';
import Footer from '../../../Layout/Footer.jsx';
const columns = [
    { field: 'id', headerName: 'ID', minWidth: 100, flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1, minWidth: 300 },
    { field: 'rights', headerName: 'Rights', width: 130, renderCell: (params) => params.value },
    { field: 'action', headerName: 'Action', width: 130, renderCell: (params) => params.value },
    { field: 'task_count', headerName: 'Task Count', minWidth: 130, flex: 1 },
    { field: 'article_count', headerName: 'Article Count', minWidth: 130, flex: 1 },
    { field: 'category_count', headerName: 'Category Count', minWidth: 130, flex: 1 },
];
const ListUser = ({ user }) => {
    const [users, setUsers] = useState([]);
    useState(() => {
        Server.getUsers().then(users => {
            setUsers(users)
        })
    }, [])
    const rows = useMemo(() => {
        return users?.map(user => {
            return {
                id: user.id,
                username: user.username,
                rights: user.rights,
                action: <Link to={`/tuktukbot/user/edit?id=${user.id}`}>
                    <Button color="secondary" variant="contained">
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
    if (Server.hasAccess(user.rights, Server.RIGHTS.GRANT) === false)
        return <h1>Access Denied</h1>;

    return (
        <Box>
            <Card>
                <CardHeader title="List Users" action={
                    <Button variant="contained" onClick={download}>
                        <DownloadIcon /> Download Stats
                    </Button>
                } />
                <CardContent>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[5]}
                        checkboxSelection={false}
                        disableSelectionOnClick
                    />
                    <Footer />
                </CardContent>
            </Card>
        </Box>
    )
}
export default ListUser