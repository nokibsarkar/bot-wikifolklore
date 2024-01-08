import Statistics, {generateRandomColor} from "./Statistics";
import { Link } from "react-router-dom";
const column2 = [
    {field : 'color', headerName : 'Color', align : 'center', headerAlign : 'center', minWidth : 50, sortable : false, flex : 0.2, renderCell : (params) => <span style={{backgroundColor : params.value, width : '100%', height : '100%'}}></span>},
    { align : 'center', headerAlign : 'center',field: 'name', headerName: 'Language', sortable : false, minWidth: 100, flex: 1, renderCell : (params) => {
        const [campaignID, campaignName] = params.row.id.split('|');
        return <Link to={`/campwiz/statistics/${campaignID}`} component='a'>{campaignName}</Link>
    } },
    {align : 'center', headerAlign : 'center', field: 'count', headerName: 'Submissions', sortable : false, minWidth: 100, flex: 1 },
  ]

  const YearStatistics = () => {
    return <Statistics
      columns={column2}
      groupBy='language'
      title={'User Submissions by Language'}
    />
  }
  export default YearStatistics;