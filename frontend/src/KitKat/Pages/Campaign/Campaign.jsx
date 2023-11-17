import { useEffect, useState } from "react";
import { useParams } from "react-router"
import CampaignHeader from "../../Components/CampaignHeader";
import KitKatServer from "../../Server";
import RuleIcon from '@mui/icons-material/Rule';
import GavelIcon from '@mui/icons-material/Gavel';
import { Box, Chip, List, Typography } from "@mui/material";
import { AllButton, JudgeButton, SettingsButton, SubmitButton } from "../../Components/CampaignButtons";
const Rules = ({ rules }) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
            p: 1,
            m: 1,
            border: 1,
            backgroundColor: 'rules.main',
            // color : 'black'
        }}>
            <Typography variant='h5' sx={{ textAlign: 'center', m: 1 }}>
                <RuleIcon /> &nbsp;
                Rules</Typography>
            <ol>
                {rules?.map((rule, index) => (
                    <Typography variant='body1' key={index} component='li'>
                        {rule}
                    </Typography>
                ))}
            </ol>
        </Box>

    )
}
const Jury = ({ jury }) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
            p: 1,
            m: 1,
            border: 1,
            backgroundColor: 'rules.main',
            // color : 'black'
        }}>
            <Typography variant='h5' sx={{ textAlign: 'center', m: 1 }}>
                <GavelIcon />
                Jury</Typography>
            <List sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1px',
                p: 1,
                m: 1,
                flexWrap: 'wrap'
            }}>
                {jury?.map((judge, index) => <Chip key={index} label={judge} />)}
            </List>
        </Box>
    )
}
const Campaign = () => {
    const { campaignID } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [jury, setJury] = useState(null);
    useEffect(() => {
        (async () => {
            const campaign = await KitKatServer.Campaign.getCampaign(campaignID);
            setCampaign(campaign);
            const jury = await KitKatServer.Campaign.getJury(campaignID);
            setJury(jury);
        })()
    }, [campaignID]);
    if (!campaign) return <div>Loading Campaign</div>
    return (
        <Box sx={{
            backgroundColor: 'list.light'
        }}>
            <CampaignHeader campaign={campaign} />
            <div style={{ textAlign: 'center' }}>

                <SubmitButton campaign={campaign} />
                <JudgeButton campaign={campaign} />
                <SettingsButton campaign={campaign} />
                <AllButton campaign={campaign} />
            </div>
            <Rules rules={campaign.rules} />
            {jury && <Jury jury={jury} />}
        </Box>
    )
}
export default Campaign;