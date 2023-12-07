import { createRef, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import ArticleInput from "../../../Components/ArticleInput";
import KitKatServer from "../../../Server";
import PageInfo from "../../../Components/PageInfo";
import CheckIcon from '@mui/icons-material/Check';
import { Button, CircularProgress, LinearProgress, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import CampaignHeader from "../../../Components/CampaignHeader";
import { AllButton, DetailsButton } from "../../../Components/CampaignButtons";

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
    const { campaignID } = useParams()
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageinfo, setPageInfo] = useState(null);
    const [article, setArticle] = useState(null);
    const [articleSubmitted, setArticleSubmitted] = useState(false);
    useEffect(() => {
        KitKatServer.Campaign.getCampaign(campaignID).then(setCampaign);
    }, [campaignID]);
    const submit = useCallback(() => {
        setLoading(true);
        const submissionRequest = {
            language: campaign.language,
            title: article,
            submitted_by_username: KitKatServer.BaseServer.loginnedUser().username,
            campaign_id: campaign.id.toString()
        }
        KitKatServer.Campaign.submitArticle(submissionRequest).then(submission => {
            console.log(submission);
            setLoading(false);
            setPageInfo(null);
            setArticleSubmitted(true);
        })
    }, [campaign, article]);
    if (!campaign) return <div style={{ textAlign: 'center' }}>
        <CircularProgress />
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

            {loading ? <div style={{ textAlign: 'center' }}><CircularProgress /></div> : (
                articleSubmitted ? <ArticleSubmissionSuccess campaignID={campaignID} /> :
                    <>
                        {!article && <ArticleInput language={campaign?.language} onNewArticle={setArticle} submitButtonLabel="Check" />}
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {article && <PageInfo setPageInfo={setPageInfo} title={article} campaign={campaign} submitter={null} />}
                            {pageinfo &&
                                <Button variant="contained" onClick={submit}>Submit</Button>
                            }
                        </div>
                    </>
            )}
        </div>
    );
}
export default ArticleSubmissionPage;