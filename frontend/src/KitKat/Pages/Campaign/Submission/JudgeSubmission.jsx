import { useCallback, useEffect, useMemo, useState } from "react"
import KitKatServer from "../../../Server";
import PageInfo from "../../../Components/PageInfo";
import CheckIcon from '@mui/icons-material/Check';
import CrossIcon from '@mui/icons-material/Close';
import ListIcon from '@mui/icons-material/List';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fab, LinearProgress, Paper, TextField } from "@mui/material";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import GavelIcon from '@mui/icons-material/Gavel';
import CampaignHeader from "../../../Components/CampaignHeader";
import { AllButton, DetailsButton, JudgeButton } from "../../../Components/CampaignButtons";
const JudgeMentBox = ({ judge, campaignID, submissionID }) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [point, setPoint] = useState(0);
    const [submiting, setSubmiting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const judgeWrapper = useCallback(async (point, note) => {
        setSubmiting(true);
        await judge(point, note);
        setSubmiting(false);
        setSubmitted(true);
        setDialogOpen(false);
    }, [judge]);
    const close = useCallback(() => {
        if (submiting) return;
        setDialogOpen(false);
        setPoint(0);
    }, []);
    const [note, setNote] = useState('');
    return (
        <div style={{ textAlign: 'center', height: '10%', position: 'relative' }}>
            <Fab variant="extended" color="primary" size="small"
                disabled={dialogOpen}
                sx={{
                    position: "fixed",
                    bottom: (theme) => theme.spacing(3),
                    right: (theme) => theme.spacing(2)
                }}
                onClick={e => setDialogOpen(true)}
            >
                <GavelIcon fontSize='small' /> Judgement
            </Fab>
            <Button variant="contained" color="primary" size="small"
                sx={{
                    m: 2,
                    p: 1
                }}
                onClick={e => setDialogOpen(true)}
                disabled={dialogOpen}
            >
                <GavelIcon fontSize='small' />
                Add Judgement
            </Button>
            {submitted && <Dialog
                open={submitted}
                onClose={close}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: 4
                }}>
                    <CheckIcon variant="contained" fontSize='large' color='success' />
                    <p style={{ textAlign: 'center', color: 'green', fontWeight: 'bolder' }}>Judgement submitted successfully!</p>

                </DialogContent>
                <DialogActions sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // mb : 1
                }}>
                    <Button variant="contained" color="success" size="small"
                        sx={{
                            m: 2,
                            p: 1,

                        }}
                        style={{
                            textDecoration: 'none',
                            color: 'white'
                        }}
                        component={Link}
                        to={`/kitkat/campaign/${campaignID}/submission`}
                    >
                        <ListIcon fontSize='small' />
                        Judge Another Submission
                    </Button>
                </DialogActions>
            </Dialog>
            }
            {dialogOpen &&
                <Dialog
                    open={dialogOpen}
                    onClose={close}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle sx={{ textAlign: 'center' }}>Add your judgement</DialogTitle>
                    <DialogContent>
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
                            disabled={submiting}
                            sx={{
                                mt: 2
                            }}

                        />

                        {submiting && <LinearProgress color="success" />}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" color="error" size="small"
                            sx={{
                                m: 2,
                                p: 1
                            }}
                            onClick={close}
                            disabled={submiting}
                        ><LinearProgress />
                            Cancel
                        </Button>
                        <Button variant="contained" color="error" size="small"
                            sx={{
                                m: 2,
                                p: 1
                            }}
                            onClick={e => judgeWrapper(0, note)}
                            disabled={submiting}
                        >
                            <CrossIcon fontSize='small' />
                            Reject
                        </Button>
                        <Button variant="contained" color="success" size="small"
                            sx={{
                                m: 2,
                                p: 1
                            }}
                            disabled={submiting}
                            onClick={e => judgeWrapper(1, note)}
                        >
                            <CheckIcon fontSize='small' />
                            Approve
                        </Button>
                    </DialogActions>
                </Dialog>}

        </div>
    )
}
const JudgeSubmission = () => {
    const { campaignID, submissionID } = useParams();
    const [submission, setSubmission] = useState(null);
    const [campaign, setCampaign] = useState(null);
    const [title, setTitle] = useState('');
    // const [language, setLanguage] = useState('');

    const [previewText, setPreviewText] = useState('<p style="text-align: center;">Loading the preview, please wait...</p>');
    const judge = useCallback((point) => {
        KitKatServer.Page.judgeSubmission(submission.id, point).then(
            () => console.log('judged')
        )
    }, [submission]);
    useEffect(() => {
        KitKatServer.addWikiStyle();
        const newBase = document.createElement('base');
        const currentBase = window.location.origin;
        // create a new base element and set it's href to the intended url
        (async () => {
            const [subm, camp] = await Promise.all([KitKatServer.Page.getSubmission(submissionID), KitKatServer.Campaign.getCampaign(campaignID)])
            setSubmission(subm);
            setTitle(subm.title);
            // setLanguage(subm.language);
            setCampaign(camp);
            // newBase.setAttribute('href', `https://${subm.language}.wikipedia.org`);
            // // get the head element (we'll append the base to this)
            // document.head.appendChild(newBase);
            const preview = await KitKatServer.Wiki.getParsedWikiText(subm.language, subm.title);
            setPreviewText(preview);
        })();
        return () => newBase.remove();
    }, []);
    if (!submission || !campaign) return <div>Loading Submission</div>
    return <div>
        {/* <CampaignHeader campaign={campaign} /> */}
        <div style={{ textAlign: 'center' }}>
            <DetailsButton campaign={campaign} />
            <AllButton campaign={campaign} />
        </div>
        <div style={{ textAlign: 'center', height: '10%', position: 'relative' }}>
            <PageInfo title={title} campaign={campaign} />
        </div>
        <Paper
            dangerouslySetInnerHTML={{ __html: previewText }}
            elevation={3}
            sx={{
                position: 'relative',
                padding: '15px',
                margin: 2,
                alignSelf: 'center',
                height: '80%',
                overflowX: 'revert'
            }}
        />
        <JudgeMentBox judge={judge} campaignID={campaignID} submissionID={submissionID} />
    </div>
}
export default JudgeSubmission;