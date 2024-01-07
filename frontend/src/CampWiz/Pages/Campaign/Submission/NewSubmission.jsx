import { createRef, forwardRef, useCallback, useEffect, useRef, useState, useMemo } from "react";
import ArticleInput from "../../../Components/ArticleInput";
import CampWizServer from "../../../Server";
import Loader from "../../../../Layout/Loader";
import PageInfo from "../../../Components/PageInfo";
import CheckIcon from '@mui/icons-material/Check';
import { Button, CircularProgress, LinearProgress, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import CampaignHeader from "../../../Components/CampaignHeader";
import { AllButton, DetailsButton } from "../../../Components/CampaignButtons";
import LoadingPage from "../../../../Layout/Loader";
import { UserInput } from "../../../Components/UserInput";

const ArticleSubmissionSuccess = ({ campaignID, resetButton }) => {
    return <div style={{ textAlign: 'center' }}>
        <CheckIcon variant="contained" fontSize='large' color='success' />
        <Typography variant="h6" component="div" color="success.main" sx={{ mb: 3, flexGrow: 1, textAlign: 'center' }}>
            Article submitted successfully!
        </Typography>
        <Button variant="outlined" color="primary" size="small"
            sx={{ mr: 2 }}
            component={Link}
            to={`/campwiz/campaign/${campaignID}`}
        >
            Back to Campaign
        </Button>
        {resetButton}

    </div>
}
const SubmitterInput = ({ setSubmitter, submitter, language }) => {
    return <UserInput fieldName="Submit on Behalf of" onChange={setSubmitter} user={submitter} language={language} />
}
const ArticleSubmissionPage = () => {
    const { campaignID } = useParams();
    const [draftID, setDraftID] = useState(null); // [draftID, setDraftID
    const [draft, setDraft] = useState(null); // [draft, setDraft
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // [error, setError
    const [pageinfo, setPageInfo] = useState(null);
    const [article, setArticle] = useState(null);
    const [submitDisabled, setSubmitDisabled] = useState(false); // [allowSubmit, setAllowSubmit
    const [articleSubmitted, setArticleSubmitted] = useState(false);
    const [submitter, setSubmitter] = useState(CampWizServer.BaseServer.loginnedUser().username);
    useEffect(() => {
        CampWizServer.Campaign.getCampaign(campaignID, {
            check_judge : true
        }).then(setCampaign);
    }, [campaignID]);
    const reset = useCallback(() => {
        setError(null);
        setDraftID(null);
        setDraft(null);
        setPageInfo(null);
        setArticle(null);
        setArticleSubmitted(false);
    }, []);
    const resetButton = useMemo(() => (
        <Button variant="outlined" color="primary" size="small"
            onClick={reset}
            sx={{m : 1}}
        >
            Submit Another
        </Button>
    ), [reset]);
    const createDraft = useCallback(async (article) => {
        setLoading(true);
        setArticle(article);
        const draftRequest = {
            title: article,
            submitted_by_username: submitter,
            campaign_id: campaign.id.toString()
        }
        try {
            const draft = await CampWizServer.Page.createDraft(draftRequest);
            setDraft(draft);
            setDraftID(draft.id);
            setPageInfo(draft);
        } catch (e) {
            setError(e);
        }

        setLoading(false);
    }, [campaign, article, submitter]);
    const submit = useCallback(async () => {
        setLoading(true);
        const submissionRequest = {
            draft_id: draftID.toString(),
        }
        try{
            const submission = await CampWizServer.Campaign.submitArticle(submissionRequest)
            setPageInfo(null);
            setArticleSubmitted(true);
        } catch (e) {
            setError(e);
        }
        setLoading(false);
    }, [campaign, article, draftID]);
    if (!campaign) return <LoadingPage />
    if (error) return <div style={{ textAlign: 'center' }}>
        <Typography variant="h6" component="div" color="error.main" sx={{ mb: 3, flexGrow: 1, textAlign: 'center' }}>
            {error.message}
        </Typography>
        <Button variant="outlined" color="primary" size="small"
            sx={{ mr: 2 }}
            component={Link}
            to={`/campwiz/campaign/${campaignID}`}
        >
            Back to Campaign
        </Button>
        {resetButton}
    </div>

    return (
        <div>
            <CampaignHeader campaign={campaign} />
            <div style={{ textAlign: 'center' }}>
                <DetailsButton campaign={campaign} />
                <AllButton campaign={campaign} />
            </div>
            <Typography variant="h5" component="p" sx={{ flexGrow: 1, textAlign: 'center', m: 2, fontWeight: 'bold' }}>
                Article submission
            </Typography>

            {loading ? <Loader title="Loading Campaign" /> :
            (
                articleSubmitted ? <ArticleSubmissionSuccess campaignID={campaignID} resetButton={resetButton}/> :
                    <>
                        {(campaign.am_i_judge)  && <SubmitterInput setSubmitter={setSubmitter} submitter={submitter} language={campaign.language} />}
            
                        {!article && <ArticleInput language={campaign?.language} onNewArticle={createDraft} submitButtonLabel="Check" />}
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {draft && <PageInfo setPageInfo={setPageInfo} title={article} campaign={campaign} draftId={draftID} setRestricted={setSubmitDisabled} />}
                            
                            {pageinfo && resetButton}
                            {pageinfo && <Button variant="contained" onClick={submit} sx={{ m: 1 }} disabled={loading || submitDisabled}>Submit</Button>}
                        </div>
                    </>
            )}
        </div>
    );
}
export default ArticleSubmissionPage;
