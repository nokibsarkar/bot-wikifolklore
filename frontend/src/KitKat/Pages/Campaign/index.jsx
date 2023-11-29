import { Route, Routes } from "react-router";
import { lazy, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Autocomplete, Box, Button, TextField, Typography } from "@mui/material";
import KitKatServer from "../../Server";
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import { CreateButton } from "../../Components/CampaignButtons";
const wiki = []
for (const [key, value] of Object.entries(KitKatServer.languages)) {
    wiki.push({ id: key, label: `${value} (${key})` })
}
wiki.sort((a, b) => a.label.localeCompare(b.label));
const CampaignFilter = ({ filter, setFilter }) => {
    const [language, setLanguage] = useState(filter.language)
    const [status, setStatus] = useState(filter.status)
    return (
        <Box 
        component="div"
        sx={{
            display: 'flex',
            flexDirection: {
                xs: 'column',
                sm: 'row'
            },
            width: '90%',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Autocomplete
                disablePortal
                id="article-name"
                options={wiki}
                size="small"
                loading={false}
                value={language}
                onChange={(e, v) => setLanguage(v?.id || '')}
                sx={{
                    minWidth: 100,
                    m : 1,
                    width : {
                        xs: '80%',
                        sm: 'auto'
                    }
                }}
                renderInput={(params) => <TextField {...params} label="Language" />}
            />
            <Autocomplete
                disablePortal
                id="article-name"
                options={['running', 'pending', 'cancelled']}
                size="small"
                multiple
                loading={false}
                value={status}
                onChange={(e, v) => setStatus(v)}
                onChangeCapture={e => setStatus(e.target.value)}
                sx={{
                    minWidth: 150,
                    m : 1,
                    width : {
                        xs: '80%',
                        sm: 'auto'
                    }
                }}
                renderInput={(params) => <TextField {...params} label="Status" />}
            />
            <Button variant="contained" color="primary" size="small" sx={{
                padding: 1,
                m: 1,
                width : {
                    xs: '80%',
                    sm: 'auto'
                }
            }}
                onClick={() => setFilter({ language, status })}
            >
                <SearchIcon /> Filter
            </Button>
        </Box>
    )

}
const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        language: '',
        status: ['running']
    })
    useEffect(() => {
        (async () => {
            setLoading(true);
            const campaigns = await KitKatServer.Campaign.getCampaigns(filter);
            setCampaigns(campaigns);
            setLoading(false);
        })();
    }, [filter]);
    return (
        <div>
            <div style={{ textAlign: 'center' }}>
                <CreateButton />
            </div>
            <Typography variant='h5' sx={{ textAlign: 'center', m: 2 }}>Active Campaigns</Typography>
            <CampaignFilter filter={filter} setFilter={setFilter} />
            <DataGrid
                loading={loading}
                rows={campaigns}
                autoHeight
                disableColumnMenu
                columns={[
                    {
                        field: 'name', headerName: 'Name', flex: 1, minWidth: 300, renderCell: (params) => {
                            return <Link to={`/kitkat/campaign/${params.row.id}`} style={{ textDecoration: 'none' }}>{params.value}</Link>
                        }
                    },
                    { headerAlign: 'center', field: 'language', headerName: 'Language', minWidth: 100, hideSortIcons: true, flex: 1 },
                    { headerAlign: 'center', field: 'start_at', headerName: 'Start Date', minWidth: 200, flex: 1 },
                    { headerAlign: 'center', field: 'end_at', headerName: 'Finish Date', minWidth: 200, flex: 1 },
                    // {
                    //     field: 'actions', headerName: 'Actions', flex: 1, renderCell: (params) => {
                    //         return <Box sx={{
                    //             display: 'block',
                    //             // flexDirection: 'row',
                    //             // justifyContent: 'center',
                    //             // alignItems: 'center',
                    //             // gap: '1px'
                    //         }}>

                    //             <Button variant="contained" color="primary" size="small" sx={{
                    //                 padding: 1,
                    //                 m: 1
                    //             }}
                    //                 component={Link}
                    //                 to={`/kitkat/campaign/${params.row.id}/submission/new`}
                    //             >
                    //                 <AddIcon />
                    //             </Button>
                    //             <Button variant="contained" color="primary" size="small" sx={{
                    //                 padding: 1,
                    //                 m: 1
                    //             }}
                    //                 component={Link}
                    //                 to={`/kitkat/campaign/${params.row.id}/submission`}
                    //             >
                    //                 <GavelIcon />
                    //             </Button>
                    //             <Button variant="contained" color="primary" size="small" sx={{
                    //                 padding: 1,
                    //                 m: 1
                    //             }}
                    //                 component={Link}
                    //                 to={`/kitkat/campaign/${params.row.id}`}
                    //             >
                    //                 <CampaignIcon />
                    //             </Button>
                    //         </Box>
                    //     }
                    // },
                    { headerAlign: 'center', field: 'status', headerName: 'Status', flex: 0.5, minWidth: 150 },


                ]}
            />
        </div>
    )
}
export default CampaignList;