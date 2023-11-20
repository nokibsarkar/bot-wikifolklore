import { useCallback, useEffect, useState } from "react"
import EditableCampaign from "./EditableCampaign"
import { useParams } from "react-router";
import KitKatServer from "../../../Server";
import { CircularProgress } from "@mui/material";

const CampaignEdit = () => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0); // used to force rerender
    const { id } = useParams();
    useEffect(() => {
        (async () => {
            setLoading(true);
            const campaign = await KitKatServer.Campaign.getCampaign(id);
            const jury = await KitKatServer.Campaign.getJury(id);
            campaign.jury = jury;
            setCampaign(campaign);
            setLoading(false);
        })();
    }, [id, refreshKey]);
    const handleSave = useCallback((campaign, setLoading) => {
        (async () => {
            setLoading(true);
            await KitKatServer.Campaign.updateCampaign(campaign);
            setLoading(false);
            setRefreshKey(refreshKey + 1);
        })();
        
    }, []);
    if (loading || !campaign)
        return <div style={{ textAlign: 'center', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </div>
    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Edit Campaign</h1>
            <EditableCampaign
                minimumStep={0}
                linear={false}
                showActions={true}
                defaultStep={3}
                onSave={handleSave}
                initialCampaign={campaign}
            />
        </div>
    )
}
export default CampaignEdit