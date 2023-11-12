import { createRef, forwardRef, useCallback, useEffect, useRef, useState } from "react";
import ArticleInput from "../../Components/ArticleInput";
import KitKatServer from "../../Server";
import PageInfo from "../../Components/PageInfo";
import CheckIcon from '@mui/icons-material/Check';
import { Button, CircularProgress, LinearProgress, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const ArticleSubmissionSuccess = ({ campaign }) => {
    return <div style={{ textAlign: 'center' }}>
        <CheckIcon variant="contained" fontSize='large' color='success' />
        <Typography variant="h6" component="div" color="success.main" sx={{ mb:3, flexGrow: 1, textAlign: 'center' }}>
            Article submitted successfully!
        </Typography>
        <Button variant="outlined" color="primary" size="small"
        sx={{mr: 2}}
            component={Link}
            to="/kitkat/campaign"
        >
            Back to Campaign
        </Button>
        <Button variant="contained" color="success" size="small"
            component={Link}
            to="/kitkat/campaign/submit"
            target="_self"
        >
            Submit Another Article
        </Button>

    </div>
}
const ArticleSubmissionPage = () => {
    const campaignID = KitKatServer.getParameter('campaignID');
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
            submitter: null,
            campaignID: campaign.id
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
            <Typography variant="h5" component="p" sx={{ flexGrow: 1, textAlign: 'center', m:2, fontWeight:'bold' }}>
                Submit Article for {campaign.name}
            </Typography>
            {loading ? <div style={{ textAlign: 'center' }}><CircularProgress /></div> : (
                articleSubmitted ? <ArticleSubmissionSuccess campaign={campaign} /> :
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