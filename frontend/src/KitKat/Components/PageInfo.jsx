import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import CrossIcon from '@mui/icons-material/Close';
import KitKatServer from '../Server';
import { useEffect, useState } from 'react';
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
        default:
            return <Typography variant="body2" color="text.secondary">
                {statement}
            </Typography>
    }
}
const PageInfo = ({ title, campaign, submitter, setPageInfo, submissionId = null}) => {
    const [addedBytes, setAddedBytes] = useState(0);
    const [addedWords, setAddedWords] = useState(0);
    const [totalBytes, setTotalBytes] = useState(0);
    const [totalWords, setTotalWords] = useState(0);
    const [createdAt, setCreatedAt] = useState('');
    const [updatedAt, setUpdatedAt] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    useEffect(() => {
        const infoRequest = {
            language: campaign.language,
            title: title,
            submitter: submitter,
            campaignID: campaign.id,
            submissionID: submissionId
        }
        KitKatServer.Page.getPageInfo(infoRequest).then(pageinfo => {
            if (setPageInfo) setPageInfo(pageinfo);
            setAddedBytes(pageinfo.addedBytes);
            setAddedWords(pageinfo.addedWords);
            setTotalBytes(pageinfo.totalBytes);
            setTotalWords(pageinfo.totalWords);
            setCreatedAt(pageinfo.createdAt);
            setCreatedBy(pageinfo.createdBy);
        });
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
            <StatementWithStatus statement={`Total ${totalBytes} bytes`} status="warning" />
            <StatementWithStatus statement={`Total ${totalWords} words`} status="success" />
            <StatementWithStatus statement={`Created at ${createdAt}`} status="error" />
            <StatementWithStatus statement={`Added ${addedBytes} bytes`} status="success" />
            <StatementWithStatus statement={`Added ${addedWords} words`} status="success" />
        </Box>
    );
}
export default PageInfo;