import { useCallback, useEffect, useMemo, useState } from "react"
import KitKatServer from "../../Server";
import PageInfo from "../../Components/PageInfo";
import CheckIcon from '@mui/icons-material/Check';
import CrossIcon from '@mui/icons-material/Close';
import { Button, Paper, TextField } from "@mui/material";
const JudgeMentBox = ({ judge }) => {
    const [note, setNote] = useState(''); // [ { id, name }
    return (
        <div style={{ textAlign: 'center', height: '10%', position: 'relative' }}>
            <TextField
                id="note"
                label="Note (Optional)"
                multiline
                rows={4}
                defaultValue=""
                variant="outlined"
                placeholder="Add a note to the submitter (optional)"
                onChange={e => setNote(e.target.value)}
                fullWidth
                sx={{
                    mt: 2
                }}

            />
            <Button variant="contained" color="error" size="small"
                sx={{
                    m: 2,
                    p: 1
                }}
                onClick={e => judge(0, note)}
            >
                <CrossIcon fontSize='small' />
                Reject
            </Button>
            <Button variant="contained" color="success" size="small"
                sx={{
                    m: 2,
                    p: 1
                }}
                onClick={e => judge(1, note)}
            >
                <CheckIcon fontSize='small' />
                Approve
            </Button>
        </div>
    )
}
const JudgeSubmission = () => {
    const [submission, setSubmission] = useState(null);
    const [campaign, setCampaign] = useState(null);
    const [title, setTitle] = useState('');
    const [language, setLanguage] = useState('');

    const [previewText, setPreviewText] = useState('<p style="text-align: center;">Loading the preview, please wait...</p>');
    const judge = useCallback((point) => {
        KitKatServer.Page.judgeSubmission(submission.id, point).then(
            () => console.log('judged')
        )
    }, [submission]);
    useEffect(() => {
        console.log('judge submission');
        KitKatServer.addWikiStyle();
        const newBase = document.createElement('base');
        const currentBase = window.location.origin;
        // create a new base element and set it's href to the intended url
        (async () => {
            const subm = await KitKatServer.Page.getSubmission();
            setSubmission(subm);
            setTitle(subm.title);
            setLanguage(subm.language);
            const camp = await KitKatServer.Campaign.getCampaign(subm.campaignID);
            setCampaign(camp);
            // newBase.setAttribute('href', `https://${subm.language}.wikipedia.org`);
            // // get the head element (we'll append the base to this)
            // document.head.appendChild(newBase);
            const preview = await KitKatServer.Wiki.getParsedWikiText(subm.language, subm.title);
            setPreviewText(preview);
        })();
        return () => newBase.remove();
    }, []);
    return <div>
        <div style={{ textAlign: 'center', height: '10%', position: 'relative' }}>
            {campaign && <PageInfo title={title} campaign={campaign} />}
        </div>
        <Paper
            dangerouslySetInnerHTML={{ __html: previewText }}
            elevation={3}
            sx={{
                position: 'relative',
                padding: '15px',
                margin: 2,
                alignSelf: 'center',
                height: '80%'
            }}
        ></Paper>
        <JudgeMentBox judge={judge} />
    </div>
}
export default JudgeSubmission;