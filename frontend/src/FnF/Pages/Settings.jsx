import SelectInput from "@mui/material/Select/SelectInput";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import AutoComplete from "@mui/material/Autocomplete"
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import HideIcon from '@mui/icons-material/VisibilityOff';
import DeleteIcon from '@mui/icons-material/Delete';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Collapse from "@mui/material/Collapse"
import Server from "../Server.ts";
import { useCallback, useState } from "react";
import Footer from "../../Layout/Footer.jsx";
const Settings = () => {
    const [users, setUsers] = useState([])
    const hideUsername = useCallback((e) => {
        const message = `
        Are you want to hide your username from all the records?
        This action is irreversible and it would:
        - Hide your username from all the records
        - Keep your central ID intact
        - log you out from now. You need to login again to continue
        `
        if (window.confirm(message))
            Server.updateMe({ username: "Hidden" }).then(user => {
                fetch('/user/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                }).then(res => {
                    window.location.href = '/'
                })
            })
    }, []);
    return (
        <Paper sx={{
            height: "100%",
            width: "100%",
            m: 0,
            border: 0,
            outline: 0,
            position: 'absolute',
        }}>
            {/* <Collapse in={true}>
                <AutoComplete
                options={users}
                sx={{m : 1}}
                renderInput={props => <TextField {...props} label="Username" />}
                />
            </Collapse> */}

            <Button variant="contained" color="error" size="small" sx={{
                padding: 1,
                m: 1
            }}
                onClick={hideUsername}
            >
                <HideIcon /> &nbsp; Hide my username
            </Button>

            <Footer />
        </Paper>
    )
}
export default Settings