import { TextField } from "@mui/material";
import UserInput from "../../../Components/UserInput";
import BlackListIcon from '@mui/icons-material/Block';
const CampaignRestrictions = ({campaign, campaignDispatch}) => {
    return (
        <>
            <TextField
                label="Maximum Submission of Same Article"
                variant="outlined"
                fullWidth
                value={campaign.maximumSubmissionOfSameArticle}
                onChange={(e) => {
                    campaignDispatch({ type: 'maximumSubmissionOfSameArticle', payload: e.target.value })
                }}
            />
            <UserInput
                users={campaign.blackListedUsers}
                onChange={blackListedUsers => campaignDispatch({ type: 'blackListedUsers', payload: blackListedUsers })}
                icon={<BlackListIcon />}
                fieldName='Black Listed Users'
            />
        </>
    )
}
export default CampaignRestrictions;