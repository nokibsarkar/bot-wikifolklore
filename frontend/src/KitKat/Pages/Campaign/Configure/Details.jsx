import { Autocomplete, Box, CircularProgress, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";
import KitKatServer from "../../../Server";
import EditIcon from '@mui/icons-material/Edit';
import RightArrow from '@mui/icons-material/ArrowForward'
import ImageSearcher from "../../../Components/ImageInput";
import LoadingPage from "../../../../Layout/Loader";


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
            maxWidth: '100%',
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
const CampainEditableDetails = ({ campaign, campaignDispatch , setNextPermittable}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [targetWikiError, setTargetWikiError] = useState(false);
    const targetWikiRef = useRef(null);
    const wiki = [];
    for (const [key, value] of Object.entries(KitKatServer.BaseServer.languages)) {
        wiki.push({ id: key, label: `${value} (${key})` })
    };
    if (loading)
        return <LoadingPage />
    return (
        <Box component="div" sx={{
            // display: { sm: 'flex' },
            // flexDirection: 'column',
            // alignItems: 'center',
            // justifyContent: 'center',
        }}>
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
                        setNextPermittable(e.target.value !== "" && campaign.start_at !== "" && campaign.end_at !== "" && campaign.image !== "")
                        campaignDispatch({ type: 'name', payload: e.target.value })
                    }}
                />
            </Box>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <TextField
                    label="Start Date"
                    variant="outlined"
                    sx={{
                        m: 0.5

                    }}
                    size="small"
                    inputProps={{ type: 'date', min: new Date().toISOString().split('T')[0] }}
                    value={campaign.start_at}
                    onChange={(e) => {
                        campaignDispatch({ type: 'start_at', payload: e.target.value })
                    }}
                />
                <Typography sx={{
                    alignSelf: 'center'
                }} variant='h5'><RightArrow /></Typography>
                <TextField
                    sx={{
                        m: 0.5
                    }}
                    size="small"
                    label="End Date"
                    variant="outlined"
                    inputProps={{ type: 'date', min: campaign.start_at }}
                    value={campaign.end_at}
                    onChange={(e) => {
                        campaignDispatch({ type: 'end_at', payload: e.target.value })
                    }}
                />
            </div>
            <ImageSearcher
                fieldName="Campaign Banner"
                defaultImageURL={campaign.image}
                setImageURL={url => campaignDispatch({ type: 'image', payload: url })}
            />
            <Rules
                rules={campaign.rules}
                setRules={rules => campaignDispatch({ type: 'rules', payload: rules })}
            />
        </Box>
    )
};
export default CampainEditableDetails;