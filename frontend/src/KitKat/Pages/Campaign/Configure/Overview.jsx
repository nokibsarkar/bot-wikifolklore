import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react";
import CampaignHeader from "../../../Components/CampaignHeader";
import RightArrow from '@mui/icons-material/ArrowForward'
const ApproveButton = ({ onApprove, disabled }) => (
    <Button variant="contained" color="success" size="small" sx={{
        m: 1
    }}
        disabled={disabled}
        onClick={onApprove}
    >
        <CheckIcon />  Approve
    </Button>

)
const RejectButton = ({ onReject, disabled }) => (
    <Button variant="contained" color="error" size="small" sx={{
        m: 1
    }}
        onClick={onReject}
        disabled={disabled}
    >
        <CloseIcon />  Reject
    </Button>

)
const ApprovalPrompt = ({ onApprove, onReject }) => {
    const [openPrompt, setOpenPrompt] = useState(false);
    const approvalWrapper = (func) => {
        setOpenPrompt(false);
        func();
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant='body2' component='h6' sx={{ m: 1 }}>
                This Campaign is pending Approval
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: '1px' }}>
                <ApproveButton onApprove={e => setOpenPrompt(true)} disabled={openPrompt} />
                <RejectButton onReject={e => setOpenPrompt(true)} disabled={openPrompt} />
            </Box>
            <Dialog
                open={openPrompt}
                onClose={() => setOpenPrompt(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Campaign Approval</DialogTitle>
                <DialogContent id="alert-dialog-description">
                    Are you sure you want to approve this Campaign?
                </DialogContent>
                <DialogActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <Button onClick={() => setOpenPrompt(false)} variant="outlined" color="error">Cancel</Button>
                    <RejectButton onReject={e => approvalWrapper(onReject)} />
                    <ApproveButton onApprove={e => approvalWrapper(onApprove)} />

                </DialogActions>
            </Dialog>
        </div>
    )
}
const CancelButton = ({ onCancel }) => {
    const [reviewPeriod, setReviewPeriod] = useState(5);
    useEffect(() => {
        const interval = setInterval(() => setReviewPeriod(reviewPeriod => {
            if (reviewPeriod <= 0 || reviewPeriod === NaN)
                clearInterval(interval);
            else
                return reviewPeriod - 1;
        }), 1000);
        return () => clearInterval(interval);
    }, []);
    return <Button variant="contained" color="error" disabled={reviewPeriod > 0} onClick={onCancel}>Cancel the Campaign {reviewPeriod > 0 && `(${reviewPeriod})`}</Button>
}
const CancelPrompt = ({ onCancel }) => {
    const [openPrompt, setOpenPrompt] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <Button variant="contained" color="error" size="small" sx={{ m: 1 }}
                disabled={openPrompt}
                onClick={e => setOpenPrompt(true)}
            >
                <CloseIcon />  Cancel Campaign
            </Button>
            <Dialog
                open={openPrompt}
                onClose={() => setOpenPrompt(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Campaign Cancel</DialogTitle>
                <DialogContent id="alert-dialog-description">
                    Are you sure you want to cancel this Campaign? This action cannot be undone.
                </DialogContent>
                <DialogActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <Button onClick={() => setOpenPrompt(false)} variant="outlined" color="success">Close</Button>
                    <CancelButton onCancel={() => setOpenPrompt(false) || onCancel()} />

                </DialogActions>
            </Dialog>
        </div>
    )

}
const Buttons = ({ campaign, campaignDispatch }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
            <ApprovalPrompt />
            <CancelPrompt />
        </div>
    )
}
const CampaignOverview = ({ campaign, campaignDispatch, showActions = false }) => {
    return (
        <Box component='div' sx={{ backgroundColor : 'rules.light', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant='h4' sx={{ m: 1 }}>
                Overview
            </Typography>
            <CampaignHeader campaign={campaign} />
            {showActions && (
                <Typography variant='body1' sx={{ m: 1, display: 'flex', flexDirection: 'row', }} component='fieldset'>
                    <legend>Actions</legend>
                    <Buttons campaign={campaign} campaignDispatch={campaignDispatch} />
                </Typography>
            )}
            <Typography variant='body1' sx={{ m: 1, display: 'flex', flexDirection: 'row', width: 'max-content' }} component='fieldset'>
                <legend>Duration</legend>
                <Typography variant='body1' sx={{ m: 1, textAlign: 'left', width: 'max-content' }} component='fieldset'>
                    <legend>Start Date</legend>
                    {campaign.startDate}
                </Typography>
                <RightArrow sx={{
                    m: 1,
                    alignSelf: 'center'
                }} />
                <Typography variant='body1' sx={{ m: 1, textAlign: 'left', width: 'max-content' }} component='fieldset'>
                    <legend>End Date</legend>
                    {campaign.endDate}
                </Typography>
            </Typography>
            <Typography variant='body1' sx={{ m: 1, }} component='fieldset'>
                <legend>Jury</legend>
                {campaign.jury?.map((judge, index) => <Chip key={index} label={judge} />)}
            </Typography>
            {/* <Typography variant='body1' sx={{ m: 1, backgroundColor: 'pink' }} component='fieldset'>
                <legend>Blacklist</legend>
                {campaign.blackListedUsers?.map((judge, index) => <Chip key={index} label={judge} />)}
            </Typography> */}
            <Typography variant='body1' sx={{ m: 1, textAlign: 'left', width: 'max-content' }} component='fieldset'>
                <legend>Rules</legend>
                <ol style={{ textAlign: 'left' }}>
                    {campaign.rules?.map((rule, index) => (
                        <li key={index}>{rule}</li>
                    ))}
                </ol>
            </Typography>

        </Box>
    )
}
export default CampaignOverview;