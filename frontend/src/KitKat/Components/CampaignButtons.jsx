import Button from '@mui/material/Button';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import SettingsIcon from '@mui/icons-material/Settings';
import GavelIcon from '@mui/icons-material/Gavel';
import { Link } from 'react-router-dom';
export const DetailsButton = ({ campaign }) => (
    <Button variant="contained" color="primary" size="small" sx={{
        p: 1,
        pr: 2,
        m: 1
    }}
        component={Link}
        to={`/kitkat/campaign/${campaign.id}`}
    >
        <CampaignIcon />&nbsp; See Details
    </Button>
)
export const SubmitButton = ({ campaign }) => (
    <Button variant="contained" color="success" size="small" sx={{
        p: 1,
        pr: 2,
        m: 1
    }}
        component={Link}
        to={`/kitkat/campaign/${campaign.id}/submission/new`}
    >
        <AddIcon /> &nbsp; Submit new Article
    </Button>
)
export const AllButton = () => (
    <Button variant="contained" color="primary" size="small" sx={{
        padding: 1,
        m: 1
    }}
        component={Link}
        to={`/kitkat/campaign`}
    >
        <ListIcon /> &nbsp; All Campaigns
    </Button>
)
export const SettingsButton = ({ campaign }) => (
    <Button variant="contained" color="primary" size="small" sx={{
        padding: 1,
        m: 1
    }}
        component={Link}
        to={`/kitkat/campaign/${campaign.id}/edit`}
    >
        <SettingsIcon /> &nbsp; Settings
    </Button>
)
export const JudgeButton = ({ campaign }) => (
    <Button variant="contained" color="primary" size="small" sx={{
        padding: 1,
        m: 1
    }}
        component={Link}
        to={`/kitkat/campaign/${campaign.id}/submission`}
    >
        <GavelIcon /> &nbsp; Judge
    </Button>
)
export const CreateButton = () => (
    <Button variant="contained" color="primary" size="small" sx={{
        padding: 1,
        m: 1
    }}
        component={Link}
        to={`/kitkat/campaign/new`}
    >
        <AddIcon /> &nbsp; Create New Campaign
    </Button>
)