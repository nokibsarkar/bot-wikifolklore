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
            <Typography variant='h5' sx={{ textAlign: 'center', m: 2 }}>Active Campaigns</Typography>
            <DataGrid
                loading={loading}
                rows={campaigns}
                columns={[
                    { field: 'name', headerName: 'Name', flex: 1 , renderCell: (params) => {
                        return <Link to={`/kitkat/campaign/${params.row.id}`} style={{textDecoration : 'none'}}>{params.value}</Link>
                    }},
                    { field: 'language', headerName: 'Language', flex: 1 },
                    { field: 'endedAt', headerName: 'Ends at', flex: 1 },
                    { field: 'status', headerName: 'Status', flex: 1 },
                    { field: 'actions', headerName: 'Actions', flex: 1, renderCell: (params) => {
                        return <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1px'
                        }}>
                           
                            <Button variant="contained" color="primary" size="small" sx={{
                                padding: 1,
                                m: 1
                            }}
                                component={Link}
                                to={`/kitkat/campaign/${params.row.id}/submission/new`}
                            >
                                <AddIcon />
                            </Button>
                            <Button variant="contained" color="primary" size="small" sx={{
                                padding: 1,
                                m: 1
                            }}
                                component={Link}
                                to={`/kitkat/campaign/${params.row.id}/submission`}
                            >
                                <GavelIcon />
                            </Button>
                            <Button  variant="contained" color="primary" size="small" sx={{
                                padding: 1,
                                m: 1
                            }}
                                component={Link}
                                to={`/kitkat/campaign/${params.row.id}`}
                            >
                                <CampaignIcon />
                            </Button>
                        </Box>
                    }}
                ]}
            />
        </div>
    )
}
export default CampaignList;