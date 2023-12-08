import { useCallback, useEffect, useState } from "react"
import EditableCampaign from "./EditableCampaign"
import { useParams } from "react-router";
import KitKatServer from "../../../Server";
import { CircularProgress } from "@mui/material";

const CampaignEdit = () => {
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // used to force rerender
    const { campaignID } = useParams();
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const campaign = await KitKatServer.Campaign.getCampaign(campaignID);
                const jury = await KitKatServer.Campaign.getJury(campaignID);
                campaign.jury = jury;
                setCampaign(campaign);
                setError(null);
            } catch (e) {
                console.error(e);
                setError(e.message);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [campaignID, refreshKey]);
    const handleSave = useCallback((campaign, setLoading) => {
        (async () => {
            setLoading(true);
            try {
                await KitKatServer.Campaign.updateCampaign(campaign);
                setError(null);
            } catch (e) {
                console.error(e);
                setError(e.message);
            } finally {
                setLoading(false);
                setRefreshKey(refreshKey + 1);
            }
        })();
    }, []);
    if (loading)
        return <div style={{ textAlign: 'center', height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
        </div>
    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Edit Campaign</h1>
            <EditableCampaign
                error={error}
                minimumStep={0}
                linear={false}
                showActions={true}
                defaultStep={3}
                onSave={handleSave}
                initialCampaign={campaign}
                showGotoDetailsButton
            />
        </div>
    )
}
export default CampaignEdit