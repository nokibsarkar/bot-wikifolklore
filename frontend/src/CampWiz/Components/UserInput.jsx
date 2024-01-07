import { Autocomplete, Box, Button, Chip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import CampWizServer from "../Server";
export const UserInput = ({ user, onChange, fieldName, icon, language = 'bn', color = 'black', backgroundColor = 'rules.main' }) => {
    const [value, setValue] = useState('');
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);
    useEffect(() => {
        if(!editing)
            return;
        (async () => {
            if (!value)
                return;
            setLoading(true);
            try {
                await CampWizServer.User.searchUsersByPrefix(language, value, users => {
                    const mappedUsers = users.map(u => ({
                        id: u.name,
                        label: u.name
                    }));
                    console.log(mappedUsers);
                    setSuggestedUsers(mappedUsers);
                    setLoading(false);
                })
            } catch (e) {
                setError(e.message);
            }
        })();
    }, [value, editing]);
    return editing ? (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
            p: 1,
            m: 1,
            border: 1,
            backgroundColor: backgroundColor,
            color: color,
            maxWidth : '99%'
        }}>
            <Typography variant='h6' sx={{ textAlign: 'center', m: 1, color: color }}>
                {icon} {fieldName}</Typography>
                <br/>
            <Autocomplete
                freeSolo={false}
                disablePortal
                options={suggestedUsers}
                loading={loading}
                sx={{
                    minWidth: {
                        xs: '100%', sm: 300
                    }, m: 0.5
                }}
                loadingText="Loading Users..."
                noOptionsText="No users found"
                renderInput={(params) => <TextField {...params} sx={{ ...params.sx, color: color }} error={!!error} label="User" variant="outlined" fullWidth size="small" />}
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
                    if (!value.id)
                        return setError('User is not available');
                    if (user === value.id)
                        return setError('User already added');
                    onChange(value.id);
                    setEditing(false);
                    setValue('');
                }}
            >
                <AddIcon />
            </Button>
            
        </Box>
    ) : (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
            p: 1,
            m: 1,
            border: 1,
            backgroundColor: backgroundColor,
            color: color
        }}>
            <Typography variant='h6' sx={{ textAlign: 'center', m: 1, color: color }}>
                {icon} {fieldName}</Typography>
            <Chip sx={{ color: color }} label={user} />
            <Button variant="contained" color="success" size="small" sx={{
                m: 1
            }}
                onClick={() => {
                    setEditing(true);
                }}
            >
                <EditIcon />
            </Button>
        </Box>
    )
}
const UserInputMultiple = ({ users, onChange, fieldName, icon, language = 'bn', color = 'black', backgroundColor = 'rules.main' }) => {
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
                await CampWizServer.User.searchUsersByPrefix(language, value, users => {
                    const mappedUsers = users.map(u => ({
                        id: u.name,
                        label: u.name
                    }));
                    console.log(mappedUsers);
                    setSuggestedUsers(mappedUsers);
                    setLoading(false);
                })
            } catch (e) {
                setError(e.message);
            }
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
            <Typography variant='h5' sx={{ textAlign: 'center', m: 1, color: color }}>
                {icon} {fieldName}</Typography>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '1px' }}>
                <Autocomplete
                    freeSolo={false}
                    disablePortal
                    options={suggestedUsers}
                    loading={loading}
                    sx={{
                        minWidth: {
                            xs: '100%', sm: 300
                        }, m: 0.5
                    }}
                    loadingText="Loading Users..."
                    noOptionsText="No users found"
                    renderInput={(params) => <TextField {...params} sx={{ ...params.sx, color: color }} error={!!error} label="User" variant="outlined" fullWidth size="small" />}
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
                        if (!value.id)
                            return setError('User is not available');
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
                    <Chip sx={{ color: color }} key={index} label={judge} onDelete={() => {
                        onChange(users.filter(j => j !== judge));
                    }} />
                ))}
            </ul>
        </Box>
    )

}
export default UserInputMultiple;