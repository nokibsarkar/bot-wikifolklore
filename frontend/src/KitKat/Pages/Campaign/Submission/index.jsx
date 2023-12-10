import { useEffect, useState } from "react";
import { useParams } from "react-router";
import KitKatServer from "../../../Server";
import CampaignHeader from "../../../Components/CampaignHeader";
import { DataGrid } from "@mui/x-data-grid";
import JudgeIcon from '@mui/icons-material/HowToVote';
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { AllButton, DetailsButton, SubmitButton } from "../../../Components/CampaignButtons";
import LoadingPage from "../../../../Layout/Loader";
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"

const SubmissionList = () => {
    const { campaignID } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [campaign, setCampaign] = useState(null);
    const [judgedByMe, setJudgedByMe] = useState(0);
    useEffect(() => {
        (async () => {
            setLoading(true);
            const campaign = await KitKatServer.Campaign.getCampaign(campaignID);
            setCampaign(campaign);
            setLoading(false);
        })()
    }, [campaignID, judgedByMe]);
    useEffect(() => {
        setLoading(true);
        (async () => {
            const params = {}
            if (judgedByMe < 2)
                params['judged_by_me'] = judgedByMe == 1;
            const submissions = await KitKatServer.Campaign.getSubmissions(campaignID, params);
            setSubmissions(submissions);
            setLoading(false);
        })()
    }, [campaignID, judgedByMe])
    if (!campaign) return <LoadingPage />
    return (
        <div>
            <CampaignHeader campaign={campaign} />
            <div style={{ textAlign: 'center' }}>

                <SubmitButton campaign={campaign} />
                <DetailsButton campaign={campaign} />
                <AllButton campaign={campaign} />
            </div>
            <Tabs value={judgedByMe} onChange={(e, val) => setJudgedByMe(val)} aria-label="Judged By Me" sx={{
                '& .MuiTabs-flexContainer' : {
                    display: 'flex',
                flexDirection : 'row',
                justifyContent: 'center'
            }
            }}>
                <Tab label="Not judged Yet" />
                <Tab label="Judge By me" />
                <Tab label="All" />
            </Tabs>
            <DataGrid
                rows={submissions}
                loading={loading}
                density="compact"
                // getRowId={(row) => row.submissionID}
                columns={[
                    { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
                    { field: 'submitted_by_username', headerName: 'Submitter', flex: 1, minWidth: 200 },
                    {
                        field: 'points', headerName: 'Points', flex: 0.5, renderCell: (params) => {
                            // const scores = []
                            // const positiveScore = params.row.positive_votes;
                            // const zeroScore = 0;
                            // const negativeScore = params.row.negative_votes;
                            // scores.push(
                            //     <font color='green' key='pass'>
                            //         {'❚'.repeat(positiveScore)}
                            //     </font>
                            // )
                            // scores.push(
                            //     <font color='gray' key='zero'>
                            //         {'❚'.repeat(zeroScore)}
                            //     </font>
                            // )
                            // scores.push(
                            //     <font color='red' key='negative'>
                            //         {'❚'.repeat(negativeScore)}
                            //     </font>
                            // )
                            // return params.row.total_votes && <span style={{
                            //     display: 'flex',
                            //     flexDirection: 'row',
                            //     justifyContent: 'center',
                            //     alignItems: 'center',
                            //     flexWrap: 'wrap',
                            //     fontSize: '10px'
                            // }}> {params.value}
                            //     ({scores})
                            // </span>
                            return params.value
                        },
                        minWidth: 130, disableColumnMenu: true
                    },
                    {
                        field: 'action', headerName: 'Judge', renderCell: (params) => {
                            const url = `/kitkat/campaign/${campaignID}/submission/${params.row.id}`
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