import Paper from "@mui/material/Paper";
import AccountTreeIcon from '@mui/icons-material/AccountTree';
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
import { DataGrid } from "@mui/x-data-grid";
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
const _CategoryList = ({ categoryListRef, initialCategories, disabled = false }) => {
    const [categoryObject, setCategoryObject] = React.useState({});// {categoryName: {categoryObject}
    const [selectedIds, setSelectedIds] = React.useState([]);// [id1, id2
    const categories = React.useMemo(() => {
        return Object.values(categoryObject);
    }, [categoryObject]);
    const onRemove = React.useCallback((catIds) => {
        if (!catIds)
            return
        for(let catID of catIds)
            delete categoryObject[catID];
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
    const onSubCategory = React.useCallback((catIDs) => {
        const categories = catIDs.map(id => categoryObject[id]).filter(v => v && !v.subcat)
        Server.addSubCategories(categories).then(subCategories => {
            subCategories.forEach(cat => categoryObject[cat.id] = cat);
            setCategoryObject({ ...categoryObject });
            for (let catID of catIDs) {
                categoryObject[catID].subcat = true;
            }
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
            {selectedIds?.length > 0 && <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',

                    padding: 3
                }}
            >
                <Button size="small" variant="contained" color="success" onClick={e => onSubCategory(selectedIds)}>
                    <AccountTreeIcon /> &nbsp;Add Sub Categories
                </Button>
                <Button sx={{ ml: 3 }} size="small" variant="contained" color="error" onClick={e => onRemove(selectedIds)}>
                    <DeleteIcon /> Remove Categories
                </Button>
            </Box>
            }
            <DataGrid
                hideFooterSelectedRowCount
                disableColumnSelector
                disableColumnFilter
                disableColumnMenu
                disableRowSelectionOnClick
                onRowSelectionModelChange={(newRowSelectionModel, details) => setSelectedIds(newRowSelectionModel)}
                rows={categories}
                columns={[
                    { field: 'title', headerAlign: 'center', headerName: 'Title', flex: 1, sortable: false },
                    {
                        headerName: '',
                        field: 'actions',
                        headerAlign: 'center',
                        align: 'center',
                        sortable: false,
                        width: 140,
                        renderCell: (params) => (
                            <>
                                {
                                    !params.row?.subcat &&
                                    <Button size="small" variant="outlined" color="success" onClick={e => onSubCategory([params.row?.id])}>
                                        <AccountTreeIcon />
                                    </Button>
                                }
                                <Button size="small" variant="outlined" color="error" onClick={e => onRemove([params.row?.id])}>
                                    <DeleteIcon />
                                </Button>
                            </>
                        ),
                    },
                ]}
                pageSize={5}
                rowsPerPageOptions={[5]}
                checkboxSelection
                disableSelectionOnClick
            />
            <AddCategory onAdd={onAdd} disabled={disabled} />
        </Paper>
    )
}
export default _CategoryList