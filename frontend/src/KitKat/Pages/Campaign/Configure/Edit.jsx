import EditableCampaign from "./EditableCampaign"

const CampaignEdit = () => {
    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Edit Campaign</h1>
            <EditableCampaign minimumStep={0} linear={false} showActions={true} defaultStep={3} />
        </div>
    )
}
export default CampaignEdit