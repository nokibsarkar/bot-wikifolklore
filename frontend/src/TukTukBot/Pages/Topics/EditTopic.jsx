import CategoryList from "../../components/Category.jsx";
import { createRef, useEffect, useState, useCallback } from "react";
import Server from "../../Server2.ts";
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import React from "react";
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Collapse from "@mui/material/Collapse"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
const EditTopic = () => {
    const [topicID, setTopicID] = useState('');
    const [country, setCountry] = useState('');
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const categoryListRef = createRef(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        console.log(id)
        if(!id)
            return;
        setTopicID(id);
        setSaving(true);
        Server.getTopic(id).then(topic => {
            setCountry(topic.country);
            setCategories(topic.categories);
        }).finally(() => {
            setSaving(false);
        })
    }, []);
    const save = useCallback(async () => {
        if(!topicID)
            return;
        if(!country)
            return;
        const categoryList = categoryListRef?.current;
        if (!categoryList?.length)
            return;
        console.log(categoryList)
        setSaving(true);
        // await Server.addTopic(topic, country);
        setSaving(false);
    }, [topicID, country]);
    return <Card>
        <CardHeader title="Edit Topic" action={<Button variant="contained" onClick={save} disabled={saving}>Save</Button>} />
        <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Typography variant="subtitle">Topic ID : {topicID}</Typography>
                <Typography variant="subtitle">Country : {country}</Typography>
            </Box>
            <CategoryList categoryListRef={categoryListRef} disabled={saving} initialCategories={categories} />
            
        </CardContent>
    </Card>
}
export default EditTopic