import { Box, Button, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import CampaignIcon from '@mui/icons-material/Campaign';
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
            // borderRadius: 5,
            // border: 1,
            // boxShadow: 1,
            textAlign: 'center'
        }}>
            <Typography variant="h5" component="h5" sx={{ flexGrow: 1, textAlign: 'center' }}>
                {campaign.name}
            </Typography>
            {campaign?.image && <figure>
                <img src={campaign.image} alt={campaign.name} style={{ width: '100%', maxHeight: '150px' }} />
                <figcaption>{campaign.imageCaption}</figcaption>
            </figure>}
            
        </Box>
    )
}
export default CampaignHeader