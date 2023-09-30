import Paper from "@mui/material/Paper";
import CircularProgress from '@mui/material/CircularProgress';
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
const CategoryList = ({ categoryListRef, Server, initialCategories }) => {
    const [newCat, setNewCat] = React.useState('');
    const [categories, setCategories] = React.useState(initialCategories);
    const [searching, setSearching] = React.useState(false);
    const onRemove = React.useCallback((category) => {
        if (!category)
            return
        setCategories(categories.filter(c => c.title !== category));
    }, [categories]);
    const onAdd = React.useCallback((category) => {
        if (!category)
            return
        setCategories([...categories, {
            name: category,
            title: category,
            pageid: categories.length + 1,
            subcat: true
        }]);
    }, [categories]);
    const onSubCategory = React.useCallback((category) => {
        console.log('Fetch subcategory of ', category);
    }, [categories]);
    // Populate the categories
    React.useEffect(() => {
        if (categoryListRef)
            categoryListRef.current = categories;
    }, [categories, categoryListRef]);
    return (
        <Paper elevation={0}>
            <List dense={true}>
                {categories?.map((category, index) => console.log(category) || (
                    <React.Fragment key={"cat" + index}>
                        <Category category={category} onRemove={onRemove} onSubCategory={onSubCategory} />
                        <Divider />
                    </React.Fragment>
                ))}
            </List><br />
            {/* // show button and the input in the same box */}
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
                    size="small"
                    sx={{
                        width: '100%',
                        maxWidth: '300px',
                        marginRight: '10px',
                        marginLeft: '10px'
                    }}
                    renderInput={(params) => <TextField {...params} onChange={e => setNewCat(e.target.value)} label="Add Category" />}
                />
                <Button variant="contained" color="success" onClick={e => onAdd(newCat) || setNewCat('')} >
                    <AddIcon /> &nbsp; Add
                </Button>
            </Box>
        </Paper>
    )
}
export default CategoryList