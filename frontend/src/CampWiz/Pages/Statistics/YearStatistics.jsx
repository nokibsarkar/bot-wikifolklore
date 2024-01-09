import Statistics from "./Statistics";
import { Link } from "react-router-dom";
const column2 = [
    {field : 'color', headerName : 'Color', align : 'center', headerAlign : 'center', minWidth : 70, sortable : false, flex : 0.2, renderCell : (params) => <span style={{backgroundColor : params.value, width : '100%', height : '100%'}}></span>},
    { align : 'center', headerAlign : 'center',field: 'name', headerName: 'Name', sortable : false, minWidth: 100, flex: 1, renderCell : (params) => {
        const campaignID = params.row.id;
        const campaignName = params.value;
        return <Link to={`/campwiz/statistics/${campaignID}`} component='a'>{campaignName}</Link>
    } },
    {align : 'center', headerAlign : 'center', field: 'start_at', headerName: 'Start', sortable : false, minWidth: 100, flex: 1 },
    {align : 'center', headerAlign : 'center', field: 'end_at', headerName: 'End', sortable : false, minWidth: 100, flex: 1 },
    {align : 'center', headerAlign : 'center', field: 'status', headerName: 'Status', sortable : false, minWidth: 100, flex: 1 },
    {align : 'center', headerAlign : 'center', field: 'total_submissions', headerName: 'Submissions', sortable : false, minWidth: 100, flex: 1 },
    {align : 'center', headerAlign : 'center', field: 'total_newly_created', headerName: 'Created', sortable : false, minWidth: 100, flex: 1 },
    {align : 'center', headerAlign : 'center', field: 'total_expanded', headerName: 'Expanded', sortable : false, minWidth: 100, flex: 1 },
    {align : 'center', headerAlign : 'center', field: 'total_points', headerName: 'Accepted', sortable : false, minWidth: 100, flex: 1 , renderCell : (params) => params.value / 10},
  ]

  const YearStatistics = () => {
    return <Statistics
      columns={column2}
      groupBy='language'
      title={'User Submissions by Language'}
    />
  }
  export default YearStatistics;