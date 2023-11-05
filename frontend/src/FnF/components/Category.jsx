import Paper from "@mui/material/Paper";
import LinearProgress from '@mui/material/LinearProgress';
import WaterfallChartIcon from '@mui/icons-material/WaterfallChart';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import React from "react";
import AutoComplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Server from "../Server.ts";
const Category = ({ category, onRemove, onSubCategory }) => {
    return (
        <ListItem>
            <ListItemText sx={{
                padding: '5px'
            }} primary={category?.title} />
            <Button size="small" variant="outlined" color="error" onClick={e => onSubCategory(category?.id)}>
                <WaterfallChartIcon />
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={e => onRemove(category?.id)}>
                <DeleteIcon />
            </Button>
        </ListItem>
    )
}
const AddCategory = ({ onAdd, disabled }) => {
    const [searching, setSearching] = React.useState(false);
    const [categorySuggestions, setCategorySuggestions] = React.useState([]); // [{title: 'cat1'}, {title: 'cat2'}
    const [newCat, setNewCat] = React.useState('');
    const onInput = React.useCallback(Server.searchCategory(setCategorySuggestions, setSearching), []);
    const _onAdd = React.useCallback((e) => {
        const category = categorySuggestions.find(cat => cat.title === newCat);
        if (!category)
            return;
        onAdd(category);
        setNewCat('');
    }, [categorySuggestions, newCat]);
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            // justifyContent: 'center',
            width: '100%',
            height: '100%',

        }}>
            <AutoComplete
                id="new-category"
                options={categorySuggestions}
                disabled={disabled}
                size="small"
                clearOnBlur
                clearOnEscape
                loading={searching}
                getOptionLabel={(option) => option?.title || ''}
                sx={{
                    width: '100%',
                    maxWidth: '400px',
                    marginRight: '10px',
                    marginLeft: '10px'
                }}
                renderInput={(params) => <TextField
                    {...params} disabled={disabled}
                    onInput={onInput}
                    onSelect={e => setNewCat(e.target.value)}
                    label="Add Additional Category"
                />}
            />
            <Button disabled={disabled} variant="contained" color="success" onClick={_onAdd} >
                <AddIcon />
            </Button>
        </Box>
    )
}
const CategoryList = ({ categoryListRef, initialCategories, disabled = false }) => {
    const [categoryObject, setCategoryObject] = React.useState({});// {categoryName: {categoryObject}
    const categories = React.useMemo(() => {
        return Object.values(categoryObject);
    }, [categoryObject]);
    const onRemove = React.useCallback((ccatID) => {
        if (!ccatID)
            return
        if (!categoryObject[ccatID])
            return
        delete categoryObject[ccatID];
        setCategoryObject({ ...categoryObject });
    }, [categoryObject]);
    const onAdd = React.useCallback((category) => {
        if (!category)
            return
        if (categoryObject[category.id])
            return
        categoryObject[category.id] = category;
        setCategoryObject({ ...categoryObject });
    }, [categoryObject]);
    const onSubCategory = React.useCallback((catID) => {
        console.log('onSubCategory', catID)
        const cat = categoryObject[catID];
        if (!cat)
            return
        Server.addSubCategories([cat]).then(categories => {
            categories.forEach(cat => {
                categoryObject[cat.id] = cat;
            });
            setCategoryObject({ ...categoryObject });
        });
    }, [categoryObject]);
    // Populate the categories
    React.useEffect(() => {
        if (categoryListRef)
            categoryListRef.current = categories;
    }, [categories, categoryListRef]);
    React.useEffect(() => {
        if (!initialCategories?.length)
            return;
        setCategoryObject(initialCategories?.reduce((dict, v) => { dict[v.id] = v; return dict }, {}))
    }, [initialCategories]);
    return (
        <Paper elevation={0}>
            <List dense={true}>
                {categories?.map((category, index) => (
                    <React.Fragment key={"cat" + index}>
                        <Category category={category} onRemove={onRemove} onSubCategory={onSubCategory} />
                        <Divider />
                    </React.Fragment>
                ))}
            </List><br />
            {/* // show button and the input in the same box */}
            <AddCategory onAdd={onAdd} disabled={disabled} />
        </Paper>
    )
}
export default CategoryList