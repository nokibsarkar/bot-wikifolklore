import { useEffect, useState } from "react";
import { useParams } from "react-router";
import KitKatServer from "../../../Server";
import CampaignHeader from "../../../Components/CampaignHeader";
import { DataGrid } from "@mui/x-data-grid";
import JudgeIcon from '@mui/icons-material/HowToVote';
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { AllButton, DetailsButton, SubmitButton } from "../../../Components/CampaignButtons";

const SubmissionList = () => {
    const { campaignID } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [campaign, setCampaign] = useState(null);
    useEffect(() => {
        (async () => {
            setLoading(true);
            const campaign = await KitKatServer.Campaign.getCampaign(campaignID);
            const submissions = await KitKatServer.Campaign.getSubmissions(campaignID);
            setCampaign(campaign);
            setSubmissions(submissions);
            setLoading(false);
        })()
    }, [campaignID]);
    if (!campaign) return <div>Loading Campaign</div>
    return (
        <div>
            <CampaignHeader campaign={campaign} />
            <div style={{ textAlign: 'center' }}>

                <SubmitButton campaign={campaign} />
                <DetailsButton campaign={campaign} />
                <AllButton campaign={campaign} />
            </div>
            <DataGrid
                rows={submissions}
                loading={loading}
                density="compact"
                getRowId={(row) => row.submissionID}
                columns={[
                    { field: 'title', headerName: 'Title', flex: 1 },
                    { field: 'submitter', headerName: 'Submitter', flex: 1 },
                    {
                        field: 'score', headerName: 'Score', flex: 0.5, renderCell: (params) => {
                            const scores = []
                            const positiveScore = 2;
                            const zeroScore = 1;
                            const negativeScore = 1;
                            scores.push(
                                <font color='green' key='pass'>
                                    {'❚'.repeat(positiveScore)}
                                </font>
                            )
                            scores.push(
                                <font color='gray' key='zero'>
                                    {'❚'.repeat(zeroScore)}
                                </font>
                            )
                            scores.push(
                                <font color='red' key='negative'>
                                    {'❚'.repeat(negativeScore)}
                                </font>
                            )
                            return <span style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                fontSize: '10px'
                            }}>
                                {scores}
                            </span>
                        }
                    },
                    {
                        field: 'action', headerName: 'Judge', renderCell: (params) => {
                            const url = `/kitkat/campaign/${campaignID}/submission/${params.row.submissionID}`
                            return <Button variant="contained" color="primary" size="small"
                                component={Link}
                                to={url}
                                target="_self"
                                style={{ color: 'white' }}
                            >
                                <JudgeIcon fontSize='small' />
                            </Button>
                        }
                    }
                ]}
                initialState={{
                    pagination: {
                        page: 1,
                        pageSize: 25
                    }
                }}
                autoHeight
                disableSelectionOnClick
                hideFooterSelectedRowCount
            />
        </div>
    )
};
export default SubmissionList;