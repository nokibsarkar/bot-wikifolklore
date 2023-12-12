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
import { useState, useEffect, useCallback } from "react";
import ExpandedIcon from '@mui/icons-material/ExpandMore';
import CollapseIcon from '@mui/icons-material/ExpandLess';
import { Autocomplete, CircularProgress, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import Server from "../../Server";


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
    const [targetWikiError, setTargetWikiError] = useState(false);
    const [defaultCategories, setDefaultCategories] = useState([]);
    const [resultElement, setResultElement] = useState(null);
    const statusRef = React.useRef(false);
    const targetWikiRef = React.useRef(null);
    const wiki = Server.getWikiList(['en']);
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
                setDefaultCategories(categories.map(v => {
                    v.isDefault = true;
                    return v;
                }));
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
        if(!targetwiki){
            setTargetWikiError(true);
            targetWikiRef.current.focus();
            return;
        } else {
            setTargetWikiError(false);
        }
        if ( !country || !categoryList || !topicName)
            return;
        setDisabled(true);
        setResultElement(null);
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
            setResultElement(<ArticleList
                Server={Server}
                taskID={taskID}
                statusRef={statusRef}
                setDisabled={setDisabled}
                targetLanguage={targetwiki}
            />)
        })
    }, [targetwiki]);
    return (
        <Card>
            <CardHeader title="Add Task" action={
                <Button variant="contained" color="success" onClick={submitTask} disabled={disabled} size="small">
                    <ListIcon /> Generate
                </Button>
            } />
            <CardContent>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'left',
                    flexDirection: 'row',
                    // borderSpacing: 1
                }}>
                    <FormControl sx={{ width: 300 }} size="small">
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
                    <Autocomplete
                        sx={{ width: 300, ml: 0.5 }}
                        disablePortal
                        size="small"
                        options={wiki}
                        value={targetwiki}
                        isOptionEqualToValue={(option, value) =>option.id === value}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                setTargetwiki(newValue.id);
                            }
                        }}
                        renderInput={(params) => <TextField {...params} inputRef={targetWikiRef} label="Target Wiki" placeholder="Select Target Wiki" error={targetWikiError} />}
                    />
                    <Button
                        variant="contained"
                        disabled={disabled}
                        // color="secondary"
                        onClick={e => setCategoryExpanded(!categoryExpanded)}
                        size="small"
                        sx={{
                            padding : 1
                        }}
                        >
                        {categoryExpanded ? <CollapseIcon /> : <ExpandedIcon />}
                    </Button>
                </Box>

                <Collapse in={categoryExpanded}>
                    {categoryFetching ? <CircularProgress /> : (
                        <CategoryList
                            disabled={disabled}
                            categoryListRef={categoryListRef}
                            Server={Server}
                            initialCategories={defaultCategories}
                            preventDefaultRemoved
                        />
                    )}
                </Collapse>
                {resultElement}

            {/* <Footer /> */}
            </CardContent>
        </Card>
    );
}

export default AddTask