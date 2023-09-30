import CategoryList from "../../components/Category";
import ListIcon from '@mui/icons-material/List';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import React from "react";
import ArticleList from "../../components/Articles";
import Box from "@mui/material/Box"
import Collapse from "@mui/material/Collapse"
import AutoComplete from "@mui/material/Autocomplete"

import ExpandedIcon from '@mui/icons-material/ExpandMore';
import CollapseIcon from '@mui/icons-material/ExpandLess';
import { TextField } from "@mui/material";
const countries = [
    {
        label: 'Bangladesh',
        id: 'BD'
    }
]
const wiki = [
    {
        label: 'Hindi Wikipedia',
        id: 'hi'
    },
    {
        label: 'Urdu Wikipedia',
        id: 'ur'
    }
]
function AddTask(props) {
    const [taskID, setTaskID] = useState(null);
    const [country, setCountry] = useState('IN');
    const [targetwiki, setTargetwiki] = useState('bn');
    const [categoryExpanded, setCategoryExpanded] = useState(true);
    const [defaultCategories, setDefaultCategories] = useState([
        {
            title: 'Hello',
            id: '90'
        }
    ]);
    React.useEffect(() => {
        setDefaultCategories([
            {
                title: 'Hello',
                id: '90'
            }
        ])
    }, [country, targetwiki])
    const submitTask = React.useCallback(() => {
        // submit task logic
    }, [])

    return (
        <Card>
            <CardHeader title="Add Task" action={
                <Button variant="contained" color="primary" onClick={submitTask}>
                    <ListIcon /> Generate List
                </Button>
            } />
            <CardContent>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'left',
                    flexDirection: 'row',
                    borderSpacing: 1
                }}>
                    <AutoComplete
                        label="Man"
                        sx={{ width: 300 }}
                        renderInput={props => <TextField {...props} label="Country" onChange={e => e.target.value && setCountry(e.target.value)} />}
                        options={countries}
                    />
                    <AutoComplete
                        sx={{ width: 300 }}
                        renderInput={props => <TextField {...props} label="Target Wiki" onChange={e => e.target.value && setTargetwiki(e.target.value)} />}
                        options={wiki}
                    />
                    <Button variant="contained" onClick={e => setCategoryExpanded(!categoryExpanded)}>
                        Advanced {categoryExpanded ? <CollapseIcon /> : <ExpandedIcon />}
                    </Button>
                </Box>

                <Collapse in={categoryExpanded}>
                    <CategoryList
                        categoryListRef={null}
                        Server={props.Server}
                        initialCategories={defaultCategories}
                    />
                </Collapse>
                <ArticleList
                    Server={props.Server}
                    taskID={taskID}
                />
            </CardContent>
        </Card>
    );
}

export default AddTask