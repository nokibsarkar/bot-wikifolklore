import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import CampWizServer from "../../../Server";
import CampaignHeader from "../../../Components/CampaignHeader";
import { DataGrid } from "@mui/x-data-grid";
import JudgeIcon from '@mui/icons-material/HowToVote';
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { AllButton, DetailsButton, SubmitButton } from "../../../Components/CampaignButtons";
import LoadingPage from "../../../../Layout/Loader";
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Chip from "@mui/material/Chip"
const SubmissionList = () => {
    const { campaignID } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [campaign, setCampaign] = useState(null);
    const [judgedByMe, setJudgedByMe] = useState(0);
    const [openDeletConfirmation, setOpenDeleteConfirmation] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);

    const judgable = campaign?.am_i_judge && (campaign?.status == 'running' || campaign?.status == 'evaluating');
    useEffect(() => {
        (async () => {
            setLoading(true);
            const campaign = await CampWizServer.Campaign.getCampaign(campaignID, {
                check_judge: true
            })
            setCampaign(campaign);
            setLoading(false);
        })()
    }, [campaignID, judgedByMe]);
    useEffect(() => {
        setLoading(true);
        (async () => {
            const params = {}
            if (judgedByMe > 0)
                params['judged_by_me'] = judgedByMe == 2;
            const submissions = await CampWizServer.Campaign.getSubmissions(campaignID, params);
            setSubmissions(submissions);
            setLoading(false);
        })()
    }, [campaignID, judgedByMe]);
    const deleteSubmission = useCallback(async (submissionID) => {
        await CampWizServer.Campaign.deleteSubmission(submissionID);

        setSubmissions(submissions.filter(submission => submission.id != submissionID));
    }, [campaignID, submissions]);
    const columns = useMemo(() => {
        const columns = [
            { field: 'title', headerName: 'Title', flex: 1, minWidth: 200 },
            { field: 'submitted_by_username', headerName: 'Submitter', flex: 1, minWidth: 200 },
            {field: 'newly_created', headerName: 'Tag', flex: 0.5, minWidth: 130, renderCell: (params) => (
                <Chip label={params.value ? 'N' : 'E'} color="info" />
            
            )},
            {field: 'points', headerName: 'Points', flex: 0.5, renderCell: (params) => {
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
                    return params.value / 10;
                },
                minWidth: 130, disableColumnMenu: true
            },
        ];

        if(judgable){
            columns.push(
                {
                    field: 'action', headerName: 'Evaluate', renderCell: (params) => {
                        const url = `/campwiz/campaign/${campaignID}/submission/${params.row.id}`
                        return <span style={{
                            display: 'flex',
                            margin: '10px'
                        }}>
                        <Button variant="contained" color="primary" size="small"
                            component={Link}
                            to={url}
                            target="_self"
                            style={{ color: 'white' }}
                        >
                            <JudgeIcon fontSize='small' />
                        </Button>
                        <Button variant="contained" size="small" onClick={() => setSubmissionToDelete(params.row.id)}  style={{ color: 'white' }}>
                            <DeleteIcon color="error" fontSize='small' />
                        </Button>
                    </span>
                    }
                }
            )
        }
        return columns;
    }, [judgedByMe, campaign]);
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
                '& .MuiTabs-flexContainer': {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center'
                }
            }}>

                <Tab label="All" />
                {judgable && <Tab label="Not Evaluated" />}
                {judgable && <Tab label="Evaluated" />}
            </Tabs>
            <DataGrid
                rows={submissions}
                loading={loading}
                density="compact"
                // getRowId={(row) => row.submissionID}
                columns={columns}
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