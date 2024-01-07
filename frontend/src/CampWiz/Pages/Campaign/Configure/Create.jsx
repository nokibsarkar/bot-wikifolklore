import { useCallback, useState } from "react"
import EditableCampaign from "./EditableCampaign"
import CampWizServer from "../../../Server";
import ErrorPage from "../../../Components/ErrorPage";

const CampaignCreate = () => {
    const [error, setError] = useState(null);
    const handleSave = useCallback((campaign, setLoading) => {
        (async () => {
            setLoading(true);
            try {
                const newCampaign = await CampWizServer.Campaign.createCampaign(campaign);
                const url = new URL("/campwiz/campaign/" + newCampaign.id, window.location.origin);
                setLoading(false);
                document.location.href = url;
                setError(null);
            } catch (e) {
                console.error(e);
                setError(e.message);
                setLoading(false);
            }
        })();
    }, [])
    return (
        <div>
            <h1>Create Campaign</h1>
            <EditableCampaign error={error} minimumStep={0} linear={true} defaultStep={0} showActions={false} onSave={handleSave} />

        </div>
    )
}
export default CampaignCreate