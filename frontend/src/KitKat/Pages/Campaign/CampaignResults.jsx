import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import KitKatServer from "../../Server";
const columns = [
    { field: 'username', headerName: 'Username', minWidth: 100, flex: 1 },
    { field: 'total_submissions', headerName: 'Submissions', minWidth: 100, flex: 1 },
    // { field: 'total_votes', headerName: 'Votes', minWidth: 100, flex: 1 },
    // { field: 'total_positive_votes', headerName: 'Positive Votes', minWidth: 100, flex: 1 },
    // { field: 'total_negative_votes', headerName: 'Negative Votes', minWidth: 100, flex: 1 },
    { field: 'total_points', headerName: 'Points', minWidth: 100, flex: 1 },
];

const CampaignResults = ({ campaign }) => {
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    useEffect(() => {
        (async () => {
            setLoading(true);
            const results = await KitKatServer.Campaign.getResults(campaign.id);
            setResults(results);
            setLoading(false);
        })();
    }, [campaign]);
    return (
        <div>
            <Typography variant='h5' sx={{ textAlign: 'center', m: 2 }}>Results</Typography>
            <DataGrid
                loading={loading}
                rows={results}
                autoHeight
                disableColumnMenu
                columns={columns}
                getRowId={row => row.username}
            />
        </div>
    )
}
export default CampaignResults;