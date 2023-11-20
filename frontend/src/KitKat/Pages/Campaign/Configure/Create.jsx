import { useCallback } from "react"
import EditableCampaign from "./EditableCampaign"
import KitKatServer from "../../../Server";

const CampaignCreate = () => {
    const handleSave = useCallback((campaign, setLoading) => {
        (async () => {
            setLoading(true);
            const newCampaign = await KitKatServer.Campaign.createCampaign(campaign);
            setLoading(false);
            const url = new URL("/kitkat/campaign/" + newCampaign.id, window.location.origin);
            document.location.href = url;
        })();
    }, [])
    return (
        <div>
            <h1>Create Campaign</h1>
            <EditableCampaign minimumStep={0} linear={true} defaultStep={0} showActions={false} onSave={handleSave} />

        </div>
    )
}
export default CampaignCreate