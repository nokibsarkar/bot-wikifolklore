import { useParams } from "react-router";
import Statistics, {generateRandomColor} from "./Statistics";

const column = [
    {field : 'color', headerName : 'Color', align : 'center', headerAlign : 'center', minWidth : 50, sortable : false, flex : 0.2, renderCell : (params) => <span style={{backgroundColor : params.value, width : '100%', height : '100%'}}></span>},
    { align : 'center', headerAlign : 'center',field: 'id', headerName: 'Username', sortable : false, minWidth: 100, flex: 1 },
    {align : 'center', headerAlign : 'center', field: 'count', headerName: 'Submissions', sortable : false, minWidth: 100, flex: 1 },
  ]

const LanguageStatistics = () => {
    const {campaignID} = useParams();
    return <Statistics
      campaignID={campaignID}
      columns={column}
      groupBy='user'
      title='User Submissions'
    />
  
}
export default LanguageStatistics;