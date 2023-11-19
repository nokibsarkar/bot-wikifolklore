import { Route, Routes } from "react-router";
import { lazy, useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";
import KitKatServer from "../../Server";
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import GavelIcon from '@mui/icons-material/Gavel';
import { Link } from "react-router-dom";
import { CreateButton } from "../../Components/CampaignButtons";
const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('active');
    useEffect(() => {
        (async () => {
            setLoading(true);
            const campaigns = await KitKatServer.Campaign.getCampaigns({
                status: status
            });
            setCampaigns(campaigns);
            setLoading(false);
        })();
    }, []);
    return (
        <div>
            <div style={{ textAlign: 'center' }}>
                <CreateButton />
            </div>
            <Typography variant='h5' sx={{ textAlign: 'center', m: 2 }}>Active Campaigns</Typography>
            <DataGrid
                loading={loading}
                rows={campaigns}
                autoHeight
                disableColumnMenu
                columns={[
                    {
                        field: 'name', headerName: 'Name', flex: 1, minWidth : 300, renderCell: (params) => {
                            return <Link to={`/kitkat/campaign/${params.row.id}`} style={{ textDecoration: 'none' }}>{params.value}</Link>
                        }
                    },
                    { headerAlign : 'center' , field: 'language', headerName: 'Language', minWidth : 100, hideSortIcons : true , flex : 1},
                    { headerAlign : 'center' ,field: 'startedAt', headerName: 'Start Date', minWidth : 200, flex: 1 },
                    { headerAlign : 'center' ,field: 'endedAt', headerName: 'Finish Date', minWidth : 200,flex: 1 },
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
                    { field: 'status', headerName: 'Status', flex: 0.5 },
                    
                ]}
            />
        </div>
    )
}
export default CampaignList;