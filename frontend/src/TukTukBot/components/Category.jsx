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
import Server from "../Server2.ts";
const Category = ({ category, onRemove, onSubCategory }) => {
    return (
        <ListItem
            secondaryAction={
                <>
                    <Button size="small" variant="outlined" color="error" onClick={e => onSubCategory(category?.title)}>
                        <WaterfallChartIcon />
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={e => onRemove(category?.title)}>
                        <DeleteIcon />
                    </Button>
                </>
            }
        >
            <ListItemText sx={{
                padding: '5px'
            }} primary={category?.title} />
        </ListItem>
    )
}
const AddCategory = ({onAdd, disabled}) =>{
    const [newCat, setNewCat] = React.useState('');
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
                disablePortal
                id="new-category"
                options={[]}
                disabled={disabled}
                size="small"
                sx={{
                    width: '100%',
                    maxWidth: '300px',
                    marginRight: '10px',
                    marginLeft: '10px'
                }}
                renderInput={(params) => <TextField {...params} disabled={disabled} onChange={e => setNewCat(e.target.value)} label="Add Category" />}
            />
            <Button disabled={disabled} variant="contained" color="success" onClick={e => onAdd(newCat) || setNewCat('')} >
                <AddIcon /> &nbsp; Add
            </Button>
        </Box>
    )
}
const CategoryList = ({ categoryListRef, initialCategories, disabled = false }) => {
    const [categoryObject, setCategoryObject] = React.useState({});// {categoryName: {categoryObject}
    
    const categories = React.useMemo(() => {
        return Object.values(categoryObject);
    }, [categoryObject]);
    
    const [searching, setSearching] = React.useState(false);
    const onRemove = React.useCallback((category) => {
        if (!category)
            return
        if(!categoryObject[category])
            return
        delete categoryObject[category];
        setCategoryObject({...categoryObject});
    }, [categoryObject]);
    const onAdd = React.useCallback((catTitle) => {
        if (!catTitle)
            return
        if(categoryObject[catTitle])
            return
        const cat = {
            name: catTitle,
            title: catTitle,
            pageid: Math.round(Math.random() * 1e5),
            subcat: false
        };
        categoryObject[catTitle] = cat;
        setCategoryObject({...categoryObject});
    }, [categoryObject]);
    const onSubCategory = React.useCallback((category) => {
        const cat = categoryObject[category];
        if(!cat)
            return
        Server.addSubCategories([cat]).then(categories => {
            categories.forEach(cat => {
                categoryObject[cat.title] = cat;
            });
            setCategoryObject({...categoryObject});
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
        setCategoryObject(initialCategories?.reduce( (dict, v) => {dict[v.title] = v; return dict}, {}))
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