
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import KitKatServer from "../Server"
const CampaignHeader = ({ campaign }) => {
    const linkoptions = {};
    if(campaign.id){
        linkoptions.to = `/kitkat/campaign/${campaign.id}`;
        linkoptions.component = Link;
    }
    return (
        <Box sx={{
            display: 'flex',
            p: 1,
            m: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'list.light',
            borderRadius: 5,
            textAlign: 'center',
            textDecoration: 'none', color: 'inherit' 
        }}  {...linkoptions}>
            <Typography variant="h5"  sx={{ flexGrow: 1, textAlign: 'center', textDecoration: 'none', color: 'inherit'  }} >
                {campaign.name}
            </Typography>
            <Typography variant="body1" component="h5" sx={{ flexGrow: 1, textAlign: 'center' }}>
                {KitKatServer.BaseServer.languages[campaign.language]}
            </Typography>
            {campaign?.image && <figure>
                <img src={campaign.image} alt={campaign.name} style={{ width: '100%', maxHeight: '150px' }} />
                <figcaption>{campaign.imageCaption}</figcaption>
            </figure>}

        </Box>
    )
}
export default CampaignHeader