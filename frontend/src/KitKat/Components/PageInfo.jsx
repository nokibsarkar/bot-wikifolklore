import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import CrossIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import KitKatServer from '../Server';
import { useCallback, useEffect, useState } from 'react';
import { Typography } from '@mui/material';
const StatementWithStatus = ({ statement, status }) => {
    switch (status) {
        case 'success':
            return <Typography variant="body2" color="success.main">
                <CheckIcon fontSize='small' color='success' /> {statement}
            </Typography>
        case 'warning':
            return <Typography variant="body2" color="warning.main">
                <WarningIcon color="warning" /> {statement}
            </Typography>
        case 'error':
            return <Typography variant="body2" color="error">
                <CrossIcon fontSize='small' /> {statement}
            </Typography>
        case 'loading':
            return <Typography variant="body2" color="text.secondary">
                <CircularProgress size={10} /> {statement}
            </Typography>
        default:
            return <Typography variant="body2" color="text.secondary">
                {statement}
            </Typography>
    }
}
const calculateRestriction = (draft, campaign, previousRestrictions, setRestricted) => {
    if(draft === null) return previousRestrictions;
    const newRestrictions = {...previousRestrictions};
    const creationDate = new Date(draft.created_at);
    const submittedAfter = new Date(campaign.start_at) <= creationDate;
    const submittedBefore = new Date(campaign.end_at) >= creationDate;
    const newlyCreated = draft.newly_created;
    newRestrictions.newlyCreated = newlyCreated === 1;
    if(campaign.allowExpansions){
        newRestrictions.totalBytes = 'success'; // Can be any amount
        newRestrictions.totalWords = 'success'; // Can be any amount
        if(draft.calculated){
            newRestrictions.addedBytes = draft.added_bytes >= campaign.minimumAddedBytes ? 'success' : 'error';
            newRestrictions.addedWords = draft.added_words >= campaign.minimumAddedWords ? 'success' : 'error';
        }
        newRestrictions.createdBy = 'success'; // Can be anyone 
        newRestrictions.createdAt = 'success'; // Can be anytime
    } else {
        newRestrictions.addedBytes = 'success'; // Can be any amount
        newRestrictions.addedWords = 'success'; // Can be any amount
        newRestrictions.totalBytes = draft.total_bytes >= campaign.minimumTotalBytes ? 'success' : 'error';
        newRestrictions.totalWords = draft.total_words >= campaign.minimumTotalWords ? 'success' : 'error';
        newRestrictions.createdBy = draft.submitted_by_id === draft.created_by_id ? 'success' : 'error';
        
        newRestrictions.createdAt = submittedAfter && submittedBefore ? 'success' : 'error';
        
    }
    const allowSubmission = (
        newRestrictions.addedBytes === 'success' &&
        newRestrictions.addedWords === 'success' &&
        newRestrictions.totalBytes === 'success' &&
        newRestrictions.totalWords === 'success' &&
        newRestrictions.createdAt === 'success' &&
        newRestrictions.createdBy === 'success'
    )
    if(setRestricted) setRestricted(!allowSubmission);
    return newRestrictions;
}
const PageInfo = ({ title, campaign, submitter, setPageInfo, submissionId = null, submission = null, draftId = null, setRestricted }) => {
    const [addedBytes, setAddedBytes] = useState(0);
    const [addedWords, setAddedWords] = useState(0);
    const [totalBytes, setTotalBytes] = useState(0);
    const [totalWords, setTotalWords] = useState(0);
    const [createdAt, setCreatedAt] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [restrictions, setRestrictions] = useState({
        addedBytes: 'loading',
        addedWords: 'loading',
        totalBytes: 'loading',
        totalWords: 'loading',
        createdAt: 'loading',
        createdBy: 'loading',
        newlyCreated : false
    });
    
    const setInfo = useCallback(draft => {
        if (setPageInfo) setPageInfo(draft);
            setAddedBytes(draft.added_bytes);
            setAddedWords(draft.added_words);
            setTotalBytes(draft.total_bytes);
            setTotalWords(draft.total_words);
            setCreatedAt(draft.created_at);
            setCreatedBy(draft.created_by_username);
            setRestrictions(calculateRestriction(draft, campaign, restrictions, setRestricted));
    }, []);
    const fetchDraft = useCallback(async (draftId) => {
        const draft = await KitKatServer.Page.getDraft(draftId);
        if(!draft.calculated){
            setTimeout(() => fetchDraft(draftId), 1000);
        } else {
            setInfo(draft);
        }
    });
    const fetchSubmission = useCallback(async (submissionId) => {
        const submission = await KitKatServer.Campaign.getSubmission(submissionId);
        submission.calculated = true;
        setInfo(submission);
    }, []);
    useEffect(() => {
        if (!submission) {
            if(draftId){
                fetchDraft(draftId);
            } else if(submissionId){
                fetchSubmission(submissionId);
            }
        } else {
            setInfo(submission);
        }

        
    }, [title]);
    return (
        <Box sx={{
            display: 'inline-block',
            p: 1,
            m: 1,
            bgcolor: 'background.paper',
            borderRadius: 5,
            border: 1,
            boxShadow: 1,
        }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                {title}
            </Typography>
            <Chip label={restrictions?.newlyCreated ? 'Newly Created' : 'Expanded'} color="info" />
            <StatementWithStatus statement={`Total ${totalBytes} bytes`} status={restrictions?.totalBytes} />
            <StatementWithStatus statement={`Total ${totalWords} words`} status={restrictions?.totalWords} />
            <StatementWithStatus statement={`Created at ${createdAt}`} status={restrictions?.createdAt} />
            <StatementWithStatus statement={`Created by ${createdBy}`} status={restrictions?.createdBy} />
            <StatementWithStatus statement={`Added ${addedBytes} bytes`} status={restrictions?.addedBytes} />
            <StatementWithStatus statement={`Added ${addedWords} words`} status={restrictions?.addedWords} />
        </Box>
    );
}
export default PageInfo;