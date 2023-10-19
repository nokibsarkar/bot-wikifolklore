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
import { CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import Server from "../../Server2.ts";
const wiki = []
for (const [key, value] of Object.entries(Server.languages)) {
    wiki.push({ id: key, label: value })
}
wiki.sort((a, b) => a.label.localeCompare(b.label));
console.log(wiki)
function AddTask() {
    const categoryListRef = React.useRef([]);
    const [countries, setCountries] = useState([]);
    const [taskID, setTaskID] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const [topicName, setTopicName] = useState('folklore');
    const [country, setCountry] = useState('BD');
    const [targetwiki, setTargetwiki] = useState('');
    const [categoryExpanded, setCategoryExpanded] = useState(true);
    const [categoryFetching, setCategoryFetching] = useState(false);
    const [defaultCategories, setDefaultCategories] = useState([]);
    const statusRef = React.useRef(false);
    useEffect(() => {
        Server.fetchCountries(topicName).then(countries => {
            setCountries([...countries]);
        })
    }, [topicName])
    useEffect(() => {
        if (!country)
            return;
        if (!topicName)
            return;
        setDisabled(true);
        setCategoryFetching(true);
        Server.getCategories({ country: country, topic: topicName })
            .then(categories => {
                setDisabled(false);
                setDefaultCategories(categories)
            }).finally(e => {
                // console.log(e)
                setDisabled(false);
                setCategoryFetching(false);
            })
    }, [country, topicName]);
    const submitTask = useCallback(() => {
        // submit task logic
        const categoryList = categoryListRef?.current;
        if (!categoryList?.length)
            return;
        
        console.log(targetwiki, country, categoryList, topicName)
        if (!targetwiki || !country || !categoryList || !topicName)
            return;
            setDisabled(true);
        Server.submitTask({
            target_wiki: targetwiki,
            country: country,
            categories: categoryList,
            topic_id: topicName,
            task_data: categoryList
        }).then(response => {
            const taskID = response?.id;
            setTaskID(taskID);
            // console.log(response)
            setDisabled(false);
            setCategoryExpanded(false);
        })
    }, [targetwiki]);
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
                    <FormControl sx={{ width: 300, m: 1 }}>
                        <InputLabel>Country</InputLabel>
                        <Select
                            fullWidth
                            disabled={disabled}
                            value={country}
                            label="Country"
                            onChange={e => e.target.value && setCountry(e.target.value)}
                        >
                            {countries.map(v => <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    {/* <AutoComplete
                        
                        renderInput={props => <TextField {...props} label="Target Wiki" onSelect={e => console.log(e) || e.target.value && setTargetwiki(e.target.value)} />}
                        options={wiki}
                    /> */}
                    <FormControl sx={{ width: 300, m: 1 }}>
                        <InputLabel>Target Wiki</InputLabel>
                        <Select
                            fullWidth
                            disabled={disabled}
                            // disablePortal
                            // sx={{ width: 300, m: 2 }}
                            value={targetwiki}
                            label="Target Wiki"
                            onChange={e => e.target.value && setTargetwiki(e.target.value)}
                        >
                            {wiki.map(v => <MenuItem key={v.id} value={v.id}>{v.label}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Button variant="contained" disabled={disabled} onClick={e => setCategoryExpanded(!categoryExpanded)} size="small">
                        Advanced {categoryExpanded ? <CollapseIcon /> : <ExpandedIcon />}
                    </Button>
                </Box>

                <Collapse in={categoryExpanded}>
                    {categoryFetching ? <CircularProgress />  : (
                        <CategoryList
                            disabled={disabled}
                            categoryListRef={categoryListRef}
                            Server={Server}
                            initialCategories={defaultCategories}
                        />
                    )}
                </Collapse>
                {taskID && <ArticleList
                    Server={Server}
                    taskID={taskID}
                    statusRef={statusRef}
                    setDisabled={setDisabled}
                />}
            </CardContent>
        </Card>
    );
}

export default AddTask