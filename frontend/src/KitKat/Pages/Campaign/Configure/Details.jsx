import { Autocomplete, Box, Button, Chip, CircularProgress, Step, StepLabel, TextField, Typography } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import KitKatServer from "../../../Server";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RightArrow from '@mui/icons-material/ArrowForward'
import GavelIcon from '@mui/icons-material/Gavel';
import AddIcon from '@mui/icons-material/Add';
import UserInput from "../../../Components/UserInput";

// const Jury = ({ jury, onChange }) => {
//     const [value, setValue] = useState('');
//     return (
//         <Box sx={{
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: '1px',
//             p: 1,
//             m: 1,
//             border: 1,
//             backgroundColor: 'rules.main',
//             // color : 'black'
//         }}>
//             <Typography variant='h5' sx={{ textAlign: 'center', m: 1 }}>
//                 <GavelIcon />
//                 Jury</Typography>
//             <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '1px' }}>
//                 <TextField
//                     label="Jury"
//                     variant="outlined"
//                     fullWidth
//                     size="small"
//                     value={value}
//                     onChange={(e) => {
//                         setValue(e.target.value)
//                     }}
//                 />
//                 <Button variant="contained" color="success" size="small" sx={{
//                     m: 1
//                 }}
//                     onClick={() => {
//                         if (!value)
//                             return;
//                         if (jury.includes(value))
//                             return;
//                         const values = [...jury, value];
//                         onChange(values);
//                         setValue('');
//                     }}
//                 >
//                     <AddIcon />
//                 </Button>
//             </div>
//             <ul style={{ textAlign: 'left' }}>
//                 {jury?.map((judge, index) => (
//                     <Chip key={index} label={judge} onDelete={() => {
//                         onChange(jury.filter(j => j !== judge));
//                     }} />
//                 ))}
//             </ul>
//         </Box>
//     )

// }
const Rules = ({ rules, setRules }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(rules?.join("\n"));
    return (
        <Box sx={{
            // display: 'flex',
            // flexDirection: 'column',
            // alignItems: 'center',
            // justifyContent: 'center',
            gap: '1px',
            p: 1,
            pr: 3,
            m: 1,
            border: 1,
            backgroundColor: 'rules.main',
            // width: 'max-content',
            minWidth: '300px',
            // color : 'black'
        }}><Typography variant='h5' sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 1 }}>
                <font>Rules</font> {!editing && <EditIcon sx={{ cursor: 'pointer', m: 1 }} color="primary" onClick={() => setEditing(true)} />}
            </Typography>
            {editing ? <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'center' }}>
                <TextField
                    label="Add Rule"
                    variant="outlined"
                    fullWidth
                    value={value}
                    multiline
                    onChange={(e) => {
                        setValue(e.target.value)
                    }}
                    onBlur={() => {
                        const values = value.split(/\n+/g).filter(value => value);
                        setRules(values);
                        setEditing(false);
                    }}
                />
                {/* <Button variant="contained" color="success" size="small" sx={{
                    padding: 1,
                    m: 1,
                    width: '33%'
                }}
                    onClick={() => {
                        const values = value.split(/\n+/g).filter(value => value);
                        setRules(values);
                        setEditing(false);
                    }}
                >
                    <SaveIcon /> Save
                </Button> */}
            </div> :
                <ol style={{ textAlign: 'left' }}>
                    {rules?.map((rule, index) => (
                        <Typography variant='body1' key={index} component='li'>
                            {rule}
                        </Typography>
                    ))}

                </ol>
            }
        </Box>

    )

}
const CampainEditableDetails = ({ campaign, campaignDispatch }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [targetWikiError, setTargetWikiError] = useState(false);
    const targetWikiRef = useRef(null);
    const wiki = [];
    for (const [key, value] of Object.entries(KitKatServer.BaseServer.languages)) {
        wiki.push({ id: key, label: `${value} (${key})` })
    };
    if (loading)
        return <CircularProgress />;
    return (
        <div>
            <Box sx={{
                display: 'flex',
                m: 1,
                flexDirection: { xs: 'column', sm: 'row' },
            }}>
                <Autocomplete
                    sx={{
                        m: 1,
                        width: { xs: '100%', sm: '400px' },
                    }}
                    disablePortal
                    size="small"
                    options={wiki}
                    value={campaign.language}
                    isOptionEqualToValue={(option, value) => option.id === value}
                    onChange={(event, newValue) => {
                        if (newValue) {
                            campaignDispatch({ type: 'language', payload: newValue.id })
                        }
                    }}
                    renderInput={(params) => <TextField {...params} inputRef={targetWikiRef} label="Target Wiki" placeholder="Select Target Wiki" error={targetWikiError} />}
                />
                <TextField
                    label="Campaign Name"
                    size="small"
                    sx={{ m: 1 }}
                    fullWidth
                    variant="outlined"
                    value={campaign.name}
                    onChange={(e) => {
                        campaignDispatch({ type: 'name', payload: e.target.value })
                    }}
                />
            </Box>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <TextField
                    label="Start Date"
                    variant="outlined"
                    sx={{
                        m: 1,

                    }}
                    inputProps={{ type: 'date' }}
                    value={campaign.startDate}
                    onChange={(e) => {
                        campaignDispatch({ type: 'startDate', payload: e.target.value })
                    }}
                />
                <Typography sx={{
                    m: 1,
                    alignSelf: 'center'
                }} variant='h5'><RightArrow /></Typography>
                <TextField
                    sx={{
                        m: 1,
                    }}
                    label="End Date"
                    variant="outlined"
                    inputProps={{ type: 'date' }}
                    value={campaign.endDate}
                    onChange={(e) => {
                        campaignDispatch({ type: 'endDate', payload: e.target.value })
                    }}
                />

            </div>
            <Rules
                rules={campaign.rules}
                setRules={rules => campaignDispatch({ type: 'rules', payload: rules })}
            />
            

        </div>
    )
};
export default CampainEditableDetails;