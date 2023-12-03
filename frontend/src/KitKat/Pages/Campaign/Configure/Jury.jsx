
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import UserInput from "../../../Components/UserInput"
import GavelIcon from '@mui/icons-material/Gavel';
const JuryPage = ({ campaign, campaignDispatch }) => {
    return (
        <FormGroup>
            <FormControlLabel
                sx={{ m: 1 }}
                control={
                    <Checkbox
                        checked={campaign.allowJuryToParticipate}
                        onChange={(e) => {
                            campaignDispatch({ type: 'allowJuryToParticipate', payload: e.target.checked })
                        }}
                    />
                }
                label="Allow jury members to participate in the campaign"
            />
            <FormControlLabel
                sx={{ m: 1 }}
                control={
                    <Checkbox
                        checked={campaign.secretBallot}
                        onChange={(e) => {
                            campaignDispatch({ type: 'secretBallot', payload: e.target.checked })
                        }}
                    />
                }
                label="Prevent jury members from seeing each other's votes"
            />
            <FormControlLabel
                sx={{ m: 1 }}
                disabled
                control={
                    <Checkbox
                        checked={campaign.allowMultipleJudgement}
                        onChange={(e) => {
                            campaignDispatch({ type: 'allowMultipleJudgement', payload: e.target.checked })
                        }}
                    />
                }
                label="Allow multiple jury members to judge the same article"
            />
            <UserInput
                users={campaign.jury}
                onChange={jury => campaignDispatch({ type: 'jury', payload: jury })}
                icon={<GavelIcon />}
                fieldName='Jury'
                language={campaign.language}
            />
        </FormGroup>
    )
}
export default JuryPage;