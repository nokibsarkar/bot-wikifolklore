import { TextField } from "@mui/material";
import UserInputMultiple from "../../../Components/UserInput";
import BlackListIcon from '@mui/icons-material/Block';
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
const CampaignRestrictions = ({ campaign, campaignDispatch }) => {
    return (
        <FormGroup>
            <FormControlLabel
                sx={{ m: 1 }}
                control={
                    <Checkbox
                        checked={campaign.allowExpansions}
                        onChange={(e) => {
                            campaignDispatch({ type: 'allowExpansions', payload: e.target.checked })
                        }}
                    />
                }
                label="Allow users to submit articles that were not created rather expanded"
            />
            {campaign.allowExpansions ? <FormGroup sx={{
                my: 1, display: 'flex', flexDirection: {
                    xs: 'column',
                    sm: 'row'

                }, justifyContent: 'space-evenly'
            }}>

                <TextField
                    label="Minimum Added Bytes"
                    variant="outlined"
                    sx={{
                        my: 1, width: {
                            xs: '100%',
                            sm: '40%'
                        }
                    }}
                    fullWidth
                    inputMode="numeric"
                    size="small"
                    helperText="The number of bytes the participant must add on the submitted article since the beginning of the campaign"
                    value={campaign.minimumAddedBytes}
                    onChange={(e) => {
                        campaignDispatch({ type: 'minimumAddedBytes', payload: e.target.value })
                    }}
                />
                <TextField
                    label="Minimum Added Words"
                    variant="outlined"
                    sx={{
                        my: 1, width: {
                            xs: '100%',
                            sm: '40%'
                        }
                    }}
                    fullWidth
                    inputMode="numeric"
                    size="small"

                    helperText="The number of words the participant must add on the submitted article since the beginning of the campaign"
                    value={campaign.minimumAddedWords}
                    onChange={(e) => {
                        campaignDispatch({ type: 'minimumAddedWords', payload: e.target.value })
                    }}
                />
            </FormGroup> :
                <FormGroup sx={{
                    my: 1, display: 'flex', flexDirection: {
                        xs: 'column',
                        sm: 'row'

                    }, justifyContent: 'space-evenly'
                }}>
                    <TextField
                        label="Minimum Total Bytes"
                        variant="outlined"
                        sx={{
                            my: 1, width: {
                                xs: '100%',
                                sm: '40%'
                            }
                        }}
                        fullWidth
                        inputMode="numeric"
                        size="small"
                        helperText="The number of bytes of the submitted article"
                        value={campaign.minimumTotalBytes}
                        onChange={(e) => {
                            campaignDispatch({ type: 'minimumTotalBytes', payload: e.target.value })
                        }}
                    />
                    <TextField
                        label="Minimum Total Words"
                        variant="outlined"
                        sx={{
                            my: 1, width: {
                                xs: '100%',
                                sm: '40%'
                            }
                        }}
                        fullWidth
                        inputMode="numeric"
                        size="small"
                        helperText="The number of words of the submitted article"
                        value={campaign.minimumTotalWords}
                        onChange={(e) => {
                            campaignDispatch({ type: 'minimumTotalWords', payload: e.target.value })
                        }}
                    />

                </FormGroup>
            }


            {/* <FormControlLabel
            sx = {{m : 1}}
                control={
                    <Checkbox
                        checked={campaign.allowSubmission}
                        onChange={(e) => {
                            campaignDispatch({ type: 'allowSubmission', payload: e.target.checked })
                        }}
                    />
                }
                label="Can the same article be submitted multiple times?"
            /> */}

            {/* <UserInput
            backgroundColor="pink"
            // color="white"
                users={campaign.blackListedUsers}
                onChange={blackListedUsers => campaignDispatch({ type: 'blackListedUsers', payload: blackListedUsers })}
                icon={<BlackListIcon />}
                fieldName='Block the follwoing users from participating in the campaign (optional)'
            /> */}
        </FormGroup>
    )
}
export default CampaignRestrictions;