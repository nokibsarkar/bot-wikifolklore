import { Box, Button, Chip, Typography } from "@mui/material";
import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import GavelIcon from '@mui/icons-material/Gavel';
import TextField from '@mui/material/TextField';
const UserInput = ({ users, onChange, fieldName, icon }) => {
    const [value, setValue] = useState('');
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
            backgroundColor: 'rules.main',
            // color : 'black'
        }}>
            <Typography variant='h5' sx={{ textAlign: 'center', m: 1 }}>
                {icon} {fieldName}</Typography>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '1px' }}>
                <TextField
                    label="Add user"
                    variant="outlined"
                    fullWidth
                    size="small"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                    }}
                />
                <Button variant="contained" color="success" size="small" sx={{
                    m: 1
                }}
                    onClick={() => {
                        if (!value)
                            return;
                        if (users.includes(value))
                            return;
                        const values = [...users, value];
                        onChange(values);
                        setValue('');
                    }}
                >
                    <AddIcon />
                </Button>
            </div>
            <ul style={{ textAlign: 'left' }}>
                {users?.map((judge, index) => (
                    <Chip key={index} label={judge} onDelete={() => {
                        onChange(users.filter(j => j !== judge));
                    }} />
                ))}
            </ul>
        </Box>
    )

}
export default UserInput;