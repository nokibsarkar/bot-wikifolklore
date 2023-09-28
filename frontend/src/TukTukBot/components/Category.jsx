import Paper from "@mui/material/Paper";
import CircularProgress from '@mui/material/CircularProgress';
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
                <Button variant="outlined" color="error" onClick={e => onSubCategory(category?.name)}>
                    <DeleteIcon /> 
                </Button>
                <Button variant="outlined" color="error" onClick={e => onRemove(category?.name)}>
                    <DeleteIcon /> 
                </Button>
                </>
            }
        >
            <ListItemText primary={category?.name} />
        </ListItem>
    )
}
const CategoryList = ({ categories, onRemove, onAdd, onSubCategory }) => {
    const newCatRef = React.useRef(null)
    return (
        <Paper>
        <List>
            {categories?.map((category, index) => (
                <React.Fragment key={index}>
                    <Category key={index} category={category} onRemove={onRemove} onSubCategory={onSubCategory} />
                    <Divider key={"c" + index} />
                </React.Fragment>
            ))}
        </List><br/>
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
            id="combo-box-demo"
            options={[]}
            sx={{
                width: '100%',
                maxWidth: '300px',
                marginRight: '10px',
                marginLeft : '10px'
            }}
            size="small"
            renderInput={(params) => <TextField {...params} inputRef={newCatRef} label="Add Category" />}
        />
        <Button variant="contained" color="success" onClick={e => onAdd(newCatRef?.current?.value)} >
            <AddIcon /> &nbsp; Add
        </Button>
        </Box>
        </Paper>
    )
}
export default CategoryList