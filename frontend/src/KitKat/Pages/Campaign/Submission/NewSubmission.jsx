import { createRef, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import ArticleInput from "../../../Components/ArticleInput";
import KitKatServer from "../../../Server";
import Loader from "../../../../Layout/Loader";
import PageInfo from "../../../Components/PageInfo";
import CheckIcon from '@mui/icons-material/Check';
import { Button, CircularProgress, LinearProgress, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import CampaignHeader from "../../../Components/CampaignHeader";
import { AllButton, DetailsButton } from "../../../Components/CampaignButtons";
import LoadingPage from "../../../../Layout/Loader";

const ArticleSubmissionSuccess = ({ campaignID }) => {
    return <div style={{ textAlign: 'center' }}>
        <CheckIcon variant="contained" fontSize='large' color='success' />
        <Typography variant="h6" component="div" color="success.main" sx={{ mb: 3, flexGrow: 1, textAlign: 'center' }}>
            Article submitted successfully!
        </Typography>
        <Button variant="outlined" color="primary" size="small"
            sx={{ mr: 2 }}
            component={Link}
            to={`/kitkat/campaign/${campaignID}`}
        >
            Back to Campaign
        </Button>
        <Button variant="contained" color="success" size="small"
            component={Link}
            to={`/kitkat/campaign/${campaignID}/submission/new`}
            target="_self"
            onClick={e => window.location.reload()}
        >
            Submit Another Article
        </Button>

    </div>
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
    const [articleSubmitted, setArticleSubmitted] = useState(false);
    useEffect(() => {
        KitKatServer.Campaign.getCampaign(campaignID).then(setCampaign);
    }, [campaignID]);
    const createDraft = useCallback(async (article) => {
        setLoading(true);
        setArticle(article);
        const draftRequest = {
            title: article,
            submitted_by_username: KitKatServer.BaseServer.loginnedUser().username,
            campaign_id: campaign.id.toString()
        }
        try {
            const draft = await KitKatServer.Page.createDraft(draftRequest);
            setDraft(draft);
            setDraftID(draft.id);
            setPageInfo(draft);
        } catch (e) {
            setError(e);
        }

        setLoading(false);
    }, [campaign, article]);
    const submit = useCallback(async () => {
        setLoading(true);
        const submissionRequest = {
            draft_id: draftID.toString(),
        }
        try{
            const submission = await KitKatServer.Campaign.submitArticle(submissionRequest)
            console.log(submission);
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
            to={`/kitkat/campaign/${campaignID}`}
        >
            Back to Campaign
        </Button>
        <Button variant="contained" color="error" size="small"
            component={Link}
            to={`/kitkat/campaign/${campaignID}/submission/new`}
            target="_self"
            onClick={e => window.location.reload()}
        >
            Try Again
        </Button>
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

            {loading ? <Loader title="Loading Campaign" />: (
                articleSubmitted ? <ArticleSubmissionSuccess campaignID={campaignID} /> :
                    <>
                        {!article && <ArticleInput language={campaign?.language} onNewArticle={createDraft} submitButtonLabel="Check" />}
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {draft && <PageInfo setPageInfo={setPageInfo} title={article} campaign={campaign} submission={draft} draftID={draftID} />}
                            {pageinfo && <Button variant="contained" onClick={submit}>Submit</Button>}
                        </div>
                    </>
            )}
        </div>
    );
}
export default ArticleSubmissionPage;