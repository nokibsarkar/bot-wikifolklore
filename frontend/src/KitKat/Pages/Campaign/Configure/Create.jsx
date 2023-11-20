import EditableCampaign from "./EditableCampaign"

const CampaignCreate = () => {
    return (
        <div>
            <h1>Create Campaign</h1>
            <EditableCampaign minimumStep={0} linear={true} />

        </div>
    )
}
export default CampaignCreate