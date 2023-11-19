import UserInput from "../../../Components/UserInput"
import GavelIcon from '@mui/icons-material/Gavel';
const JuryPage = ({ campaign, campaignDispatch }) => {
    return (
        <div>
        <UserInput
            users={campaign.jury}
            onChange={jury => campaignDispatch({ type: 'jury', payload: jury })}
            icon={<GavelIcon />}
            fieldName='Jury'
        />
        </div>
    )
}
export default JuryPage;