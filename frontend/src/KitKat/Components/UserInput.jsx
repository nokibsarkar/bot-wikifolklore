import { Autocomplete, Box, Button, Chip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import GavelIcon from '@mui/icons-material/Gavel';
import TextField from '@mui/material/TextField';
import KitKatServer from "../Server";
const UserInput = ({ users, onChange, fieldName, icon, language = 'bn', color='black', backgroundColor = 'rules.main' }) => {
    const [value, setValue] = useState('');
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        (async () => {
            if (!value)
                return;
            setLoading(true);
            try {
                const users = await KitKatServer.User.searchUsersByPrefix(language, value, suggestedUsers);
                const mappedUsers = users.map(u => ({
                    id: u.name,
                    label: u.name
                }));
                setSuggestedUsers(mappedUsers);
            } catch (e) {
                setError(e.message);
            }
            setLoading(false);
        })();
    }, [value]);
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
            p: 1,
            m: 1,
            border: 1,
            backgroundColor: backgroundColor,
            color: color
        }}>
            <Typography variant='h5' sx={{ textAlign: 'center', m: 1, color : color }}>
                {icon} {fieldName}</Typography>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '1px' }}>
                <Autocomplete
                    disablePortal
                    options={suggestedUsers}
                    loading={loading}
                    sx={{ minWidth: {
                        xs : '100%', sm : 300}, m: 0.5 }}
                    loadingText="Loading Users..."
                    noOptionsText="No users found"
                    renderInput={(params) => <TextField {...params} sx={{...params.sx, color : color}}  error={!!error} label="User" variant="outlined" fullWidth size="small" />}
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                    onInputChange={(event, newInputValue) => {
                        setValue(newInputValue);
                    }}
                />
                <Button variant="contained" color="success" size="small" sx={{
                    m: 1
                }}
                    onClick={() => {
                        if (!value)
                            return;
                        if (users.includes(value.id))
                            return setError('User already added');
                        const values = [...users, value.id];
                        onChange(values);
                        setValue('');
                        setError('');

                    }}
                >
                    <AddIcon />
                </Button>
            </div>
            <ul style={{ textAlign: 'left' }}>
                {users?.map((judge, index) => (
                    <Chip sx={{color : color}} key={index} label={judge} onDelete={() => {
                        onChange(users.filter(j => j !== judge));
                    }} />
                ))}
            </ul>
        </Box>
    )

}
export default UserInput;