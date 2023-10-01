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
import { useState, useEffect, useCallback } from "react";
import ExpandedIcon from '@mui/icons-material/ExpandMore';
import CollapseIcon from '@mui/icons-material/ExpandLess';
import { TextField } from "@mui/material";
import Server from "../../Server.ts";
const countries = [
    {
        label: 'Bangladesh',
        id: 'BD'
    },
    {
        label: 'India',
        id: 'IN'
    },
    {
        label: 'Pakistan',
        id: 'PK'
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
function AddTask() {
    const categoryListRef = React.useRef([]);
    const [taskID, setTaskID] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const [topic, setTopic] = useState('folklore');
    const [country, setCountry] = useState('IN');
    const [targetwiki, setTargetwiki] = useState('bn');
    const [categoryExpanded, setCategoryExpanded] = useState(true);
    const [defaultCategories, setDefaultCategories] = useState([]);
    useEffect(() => {
        const countryFound = countries.find(v => v.label == country);
        // const wikiFound = wiki.find(v => v.label == targetwiki);
        if (!countryFound)
            return;
        setDisabled(true);
        Server.getCategories({country : countryFound.id, topic})
        .then(categories => {
            setDisabled(false);
            setDefaultCategories(categories)
        })
    }, [country, topic])
    const submitTask = useCallback(() => {
        // submit task logic
        const categoryList = categoryListRef?.current;
        if (!categoryList?.length)
            return;
        setDisabled(true);
        Server.submitTask({
            homewiki: targetwiki,
            country : country,
            categories: categoryList,
            topic: topic
        }).then(response => {
            const taskID = response?.id;
            setTaskID(taskID);
            console.log(response)
            setDisabled(false);
        })
    }, [])

    return (
        <Card>
            <CardHeader title="Add Task" action={
                <Button variant="contained" color="primary" onClick={submitTask} disabled={disabled}>
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
                        disabled={disabled}
                        sx={{ width: 300 }}
                        renderInput={props => <TextField {...props} label="Country" onSelect={e => e.target.value && setCountry(e.target.value)} />}
                        options={countries}
                    />
                    <AutoComplete
                        disabled={disabled}
                        sx={{ width: 300 }}
                        renderInput={props => <TextField {...props} label="Target Wiki" onSelect={e => e.target.value && setTargetwiki(e.target.value)} />}
                        options={wiki}
                    />
                    <Button variant="contained" disabled={disabled} onClick={e => setCategoryExpanded(!categoryExpanded)}>
                        Advanced {categoryExpanded ? <CollapseIcon /> : <ExpandedIcon />}
                    </Button>
                </Box>

                <Collapse in={categoryExpanded}>
                    <CategoryList
                        disabled={disabled}
                        categoryListRef={categoryListRef}
                        Server={Server}
                        initialCategories={defaultCategories}
                    />
                </Collapse>
                {taskID && <ArticleList
                    Server={Server}
                    taskID={taskID}
                />}
            </CardContent>
        </Card>
    );
}

export default AddTask