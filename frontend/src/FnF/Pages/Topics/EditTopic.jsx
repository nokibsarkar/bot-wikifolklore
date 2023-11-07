import CategoryList from "../../components/Category.jsx";
import { createRef, useEffect, useState, useCallback } from "react";
import Server from "../../Server.ts";
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import React from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
const DeleTePrompt = ({ open, onClose, onConfirm }) => {
    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>Delete Topic</DialogTitle>
        <DialogContent>Are you sure you want to delete this topic?
            This action cannot be undone.

        </DialogContent>
        <DialogActions>
            <Button color="success" variant="outlined" onClick={onClose}>Cancel</Button>
            <Button color="error" variant="contained" onClick={onConfirm}>Confirm</Button>
        </DialogActions>
    </Dialog>
}
const EditTopic = () => {
    const [topicID, setTopicID] = useState('');
    const [country, setCountry] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deletePromptOpen, setDeletePromptOpen] = useState(false);
    const categoryListRef = createRef(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if(!id)
            return;
        setTopicID(id);
        Server.getTopic(id).then(topic => {
            setCountry(Server.countries[topic.country]);
            setCategories(topic.categories);
        })
    }, [refreshKey]);
    const save = useCallback(async () => {
        if(!topicID)
            return;
        if(!country)
            return;
        const categoryList = categoryListRef?.current;
        if (!categoryList?.length)
            return;
        setSaving(true);
        const updated = await Server.updateTopic({
            id: topicID,
            country: country,
            categories: categoryList
        });
        if (!updated)
            return;
        setRefreshKey(refreshKey + 1);
        setSaving(false);
    }, [topicID, country, categoryListRef]);
    const deleteTopic = useCallback(async () => {
        if(!topicID)
            return;
        const deleted = await Server.deleteTopic(topicID);
        if(!deleted)
            return;
        window.location.href = "/fnf/topic";
    }, [topicID]);
    return <Card>
        <CardHeader title="Edit Topic" action={<Button variant="contained" color="error" onClick={e => setDeletePromptOpen(true)} disabled={saving}><DeleteIcon /> Delete</Button>} />
        <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Typography variant="subtitle">Topic ID : {topicID}</Typography>
                <Typography variant="subtitle">Country : {country}</Typography>
            </Box>
            <CategoryList categoryListRef={categoryListRef} disabled={saving} initialCategories={categories} />
            <Box sx={{ mt : 5, maxWidth : 300,display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Button variant="contained" onClick={save} disabled={saving}>Save</Button>
            </Box>
            <DeleTePrompt open={deletePromptOpen} onClose={e => setDeletePromptOpen(false)} onConfirm={deleteTopic} />
            {/* <Footer /> */}
        </CardContent>
    </Card>
}
export default EditTopic