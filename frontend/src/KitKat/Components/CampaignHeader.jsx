import { Box, Typography } from "@mui/material"
import KitKatServer from "../Server"
const CampaignHeader = ({ campaign }) => {
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
            textAlign: 'center'
        }}>
            <Typography variant="h5" component="h5" sx={{ flexGrow: 1, textAlign: 'center' }}>
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