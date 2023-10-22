
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import React from "react";
import ArticleList from "../../components/Articles";
import Box from "@mui/material/Box"
import Collapse from "@mui/material/Collapse"
import AutoComplete from "@mui/material/Autocomplete"
import { useState, useEffect, useCallback } from "react";
import ExpandedIcon from '@mui/icons-material/ExpandMore';
import CollapseIcon from '@mui/icons-material/ExpandLess';
import { CardActions, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import GREEN from "@mui/material/colors/green";
import RED from "@mui/material/colors/red";
import Yellow from "@mui/material/colors/yellow";
import Server from "../../Server"
import DownloadIcon from '@mui/icons-material/Download';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import Footer from '../../../Layout/Footer';
const User = () => {
    const [username, setUsername] = useState(null);
    const [id, setID] = useState(0)
    const [taskCount, setTaskCount] = useState(0)
    const [articleCount, setArticleCount] = useState(0)
    const [fetching, setFetching] = useState(false)
    useEffect(() => {
        setFetching(true)
        Server.getMe().then(user => {
            setUsername(user.username)
            setTaskCount(user.task_count)
            setID(user.id)
            setArticleCount(user.article_count)
        }).finally(() => {
            setFetching(false)
        })
    }, [])
    return fetching ? <CircularProgress /> : (
        <Box>
            <h2>Welcome, {username}</h2>
            <h3>Task Count : {taskCount}</h3>
            <h3>Total Article Count : {articleCount}</h3>
        </Box>
    )
}

const DownloadButon = ({ id }) => {
    const download = async () => {
        const csv = await Server.exportResult(id, 'csv')
        const a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
        a.download = 'result.csv'
        a.click()
    }
    return <Button variant="contained" color="primary" onClick={download}>
        <DownloadIcon />
    </Button>
}
const headers = [
    { field: 'id', headerName: 'ID', maxWidth: 70, flex: 1 },
    { field: 'status', headerName: 'Status',maxWidth: 100, flex : 1 },
    // { field: 'topic_id', headerName: 'Topic',  flex : 1 },
    { field: 'country', headerName: 'Country',  flex : 1 },
    { field: 'targetwiki', headerName: 'Language', minWidth : 100, flex : 1},
    { field: 'download', headerName: 'Download', renderCell : (params) => params.value},
    { field: 'category_count', headerName: 'Category', maxWidth: 100, flex : 1 },
    {field : 'article_count', headerName : 'Article', maxWidth : 100, flex : 1},
]
const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [fetching, setFetching] = useState(false);
    const formatter = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
    });
    useEffect(() => {
        setFetching(true)
        Server.getTasks().then(tasks => {
            setTasks(tasks.map(v =>  ({
                ...v,
                country : Server.countries[v.country] || v.country,
                // created_at : formatter.format(new Date(v.created_at)),
                download : v.status == 'done' && <DownloadButon id={v.id} />,
                targetwiki : Server.languages[v.target_wiki] || v.target_wiki,
            })))
        }).finally(() => {
            setFetching(false)
        })
    }, [])
    return <DataGrid
        rows={tasks}
        columns={headers}
        initialState={{
            pagination: {
                paginationModel : {
                    pageSize: 10,
                }
            }
        }}
        sx={{
            '& .MuiDataGrid-row' : {
                cursor : 'pointer',
                color : 'white',
            },
            '& .Mui-hovered' : {
                color : 'black'
            },
            '& .Mui-selected' : {
                color : 'black'
            },
            '& .task-done' : {
                backgroundColor : GREEN[800],
                color : 'white',
            },
            '& .task-done:hover' : {
                backgroundColor : GREEN[600],
                color : 'white',
            },
            '& .task-pending' : {
                backgroundColor : Yellow[300],
                color : 'black'
            },
            '& .task-failed' : {
                backgroundColor : RED[300],
            },
        }}
        rowsPerPageOptions={[5]}
        checkboxSelection={false}
        disableSelectionOnClick={true}
        rowSelection={false}
        getRowClassName={(params) => `task-${params.row.status} .task`}
        loading={fetching}
    />

}
const ListTask = () => {
    const NewTaskButton = () => (
        <Link to="/tuktukbot/task/create">
           <Button variant="contained" color="success"><AddIcon /> New List</Button>
        </Link>
    )
    return (
        <Card>
            
            <CardHeader action={<NewTaskButton />}/>
            <CardContent>
            <User />
                <TaskList />
                <Footer />
            </CardContent>
        </Card>
    )
}
export default ListTask