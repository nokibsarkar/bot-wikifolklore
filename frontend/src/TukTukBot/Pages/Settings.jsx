import SelectInput from "@mui/material/Select/SelectInput";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import DeleteIcon from '@mui/icons-material/Delete';
const Settings = () => {
    return (
        <Paper sx={{
            height: "100%",
            width: "100%",
            m: 0,
            border: 0,
            outline: 0,
            position: 'absolute',
        }}>
            <TextField
                id="outlined-basic"
                label="Outlined"
                variant="outlined"
            />
            <br/>
            <Button variant="contained" color="error">
                <DeleteIcon /> &nbsp; Delete Personal Account
                </Button>
        </Paper>
    )
}
export default Settings