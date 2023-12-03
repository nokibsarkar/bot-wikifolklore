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
import useMediaQuery from '@mui/material/useMediaQuery';
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
const Preview = ({ title, language }) => {
    const [previewText, setPreviewText] = useState('<p style="text-align: center;">Loading the preview, please wait...</p>');
    const isMobile = useMediaQuery('(max-width:600px)');
    const wikipediaURL = `https://${language}.wikipedia.org`;
    const baseURL = `${wikipediaURL}/wiki/${title}`
    const styleSheet = `${wikipediaURL}/w/load.php?debug=false&lang=${language}&modules=ext.cite.styles|ext.echo.badgeicons|ext.echo.styles.badge|ext.flaggedRevs.basic|ext.gadget.logo|ext.math.scripts,styles|ext.tmh.thumbnail.styles|ext.uls.nojs|ext.wikimediaBadges|mediawiki.legacy.commonPrint,shared|mediawiki.page.gallery.styles|mediawiki.sectionAnchor|mediawiki.skinning.interface|site.styles|skins.vector.styles|wikibase.client.init|ext.kartographer.style&only=styles&skin=vector`;
    useEffect(() => {
        (async () => {
            const preview = await KitKatServer.Wiki.getParsedWikiText(language, title);
            setPreviewText(preview);
        })();
    }, [title, language]);
    return (
        <Paper
            component="iframe"
            elevation={3}
            sx={{
                position: 'relative',
                p: 0,
                m: 0,
                border: 0,
                my: 2,
                alignSelf: 'center',
                height: '80%',
                minHeight: '500px',
                overflowX: 'revert',
                width: '100%',
                overflowX: 'hidden',
            }}
            sandbox="allow-popups allow-scripts"
            srcDoc={`<!DOCTYPE html>
            <html style='padding: 10px' >
            <head>
               <base href='${baseURL}' target='_blank'>
               <link rel='stylesheet' href='${styleSheet}' />
            </head>
            <body class='mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject skin-vector' style='background: white; height: auto'>
            <div class="mw-indicators" style="z-index: 1; position: relative">
               
            </div>
            
               <div id='bodyContent' class='vector-body'>${previewText}</div>
               
               <script type='text/javascript'>
                  (function() {
                     var url = window.location.href;
                     function getAnchor(element) {
                        for (;;) {
                           if (!element) return null;
                           if (element.nodeName === 'A') return element;
                           element = element.parentElement;
                        }
                     }
                     document.body.addEventListener('click', function(e) {
                        var anchor = getAnchor(e.target);
                        if (!anchor) return;
                        var href = anchor.getAttribute('href');
                        if (!href || href[0] != '#') return;
                        // window.location.hash = href;
                        window.location.replace(url + href);
                        e.preventDefault();
                     }, true);
                  })();
               </script>
            </body>
            </html>
            `}
        />
    )
}
const JudgeSubmission = () => {
    console.log('rendering judge submission')
    const { campaignID, submissionID } = useParams();
    const [submission, setSubmission] = useState(null);
    const [campaign, setCampaign] = useState(null);
    const [title, setTitle] = useState('');
    const preview = useMemo(() => {
        if (!submission) return <div>Loading Preview</div>
        return <Preview title={title} language={submission.language} />
    }, [submissionID, submission]);
    const judge = useCallback((point) => {
        KitKatServer.Page.judgeSubmission(submission.id, point).then(
            () => console.log('judged')
        )
    }, [submission]);
    useEffect(() => {
        // KitKatServer.addWikiStyle();
        const newBase = document.createElement('base');
        // create a new base element and set it's href to the intended url
        (async () => {
            const [subm, camp] = await Promise.all([KitKatServer.Page.getSubmission(submissionID), KitKatServer.Campaign.getCampaign(campaignID)])
            setSubmission(subm);
            setTitle(subm.title);
            // setLanguage(subm.language);
            setCampaign(camp);

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
        <div style={{ textAlign: 'center', height: '8%', position: 'relative' }}>
            <PageInfo title={title} campaign={campaign} />
        </div>
        {preview}
        <JudgeMentBox judge={judge} campaignID={campaignID} submissionID={submissionID} />
    </div>
}
export default JudgeSubmission;