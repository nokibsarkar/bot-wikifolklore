import { createRef, useEffect, useState, useCallback } from "react";
import CategoryList from "../../components/Category";
import Server from "../../Server2.ts";
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import React from "react";
import ArticleList from "../../components/Articles";
import Box from "@mui/material/Box"
import Collapse from "@mui/material/Collapse"
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
const AddTopic = () => {
    const [availableCountries, setAvailableCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('folklore');
    const [countryerror, setCountryError] = useState(false);
    const [creating, setCreating] = useState(false);
    const categoryListRef = createRef(null);
    useEffect(() => {
        Server.fetchCountries(selectedTopic).then(alreadyAvailableCountries => {
            const allCountries = { ...Server.countries };
            alreadyAvailableCountries.forEach(country => {
                delete allCountries[country.id];
            });
            const result = Object.entries(allCountries).map(([id, name]) => ({ id, label: name }));
            result.sort((a, b) => a.label.localeCompare(b.label));
            setAvailableCountries(result);
        })
    }, [selectedTopic]);
    const createTopic = useCallback(() => {
        const categoryList = categoryListRef?.current;
        if (!categoryList?.length)
            return;
        if (!selectedCountry) {
            setCountryError(true);
            return;
        } else {
            setCountryError(false);
        }
        setCreating(true);
        Server.createTopic({
            country : selectedCountry,
            title : selectedTopic,
            categories : categoryList
        }).then(topic => {
            window.location.href = `/tuktukbot/topic/${topic.id}`;
        }).finally(() => {
            setCreating(false);
        })
    }, [categoryListRef]);
    return <Card>
        <CardHeader title="Add Topic" action={ <Button variant="contained" color="primary" onClick={createTopic}>Create</Button>} />
        <CardContent>
            <Box>
                <FormControl size="small" sx={{
                    minWidth: 250,
                    m: 1
                }} disabled={creating} >
                    <InputLabel id="topic">Topic</InputLabel>
                    <Select
                        labelId="topic"
                        id="topic"
                        value={selectedTopic}
                        onChange={e => setSelectedTopic(e.target.value)}
                        label="Topic"
                    >
                        <MenuItem value="folklore">Folklore</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{
                    minWidth: 250,
                    m: 1
                }} disabled={creating}>
                    <InputLabel id="country">Country</InputLabel>
                    <Select
                        labelId="country"
                        id="country"
                        error={countryerror}
                        value={selectedCountry}
                        onChange={e => setSelectedCountry(e.target.value)}
                        label="Country"
                    >
                        {availableCountries.map(country => <MenuItem key={country.id} value={country.id}>{country.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Box>
            <CategoryList categoryListRef={categoryListRef} disabled={creating} />
        </CardContent>
    </Card>
}
export default AddTopic