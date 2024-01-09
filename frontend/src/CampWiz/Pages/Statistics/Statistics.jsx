import React, { useEffect, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart';
import CampWizServer from '../../Server';
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import { DataGrid } from '@mui/x-data-grid';
export const generateRandomColor = () => '#' + Math.floor(Math.random()*16777200 + 200).toString(16);


const axis = [
  {
    dataKey: 'date',
    valueFormatter: (v) => new Date(v).toLocaleDateString(),
    type: 'category',
    scaleType : 'time',
  },
];
const Statistics = ({campaignID, columns, groupBy = 'language', title = 'User Submissions'}) => {
      const [series, setSeries] = useState([]);
      const [rows, setRows] = useState([]);
      const [dataset, setDataset] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(false);
      const [overview, setOverview] = useState({
        total_submissions : 0,
        total_newly_created : 0,
        total_expanded : 0,
      });
      
      useEffect(() => {
          setLoading(true);
          CampWizServer.Campaign.getTimeline(groupBy, campaignID).then((statistics) => {
            const {entities, timeline} = statistics;
            const overview = {
              total_submissions : statistics.total_submissions,
              total_newly_created : statistics.total_newly_created,
              total_expanded : statistics.total_expanded,
            };
            const series = [];
            for(const entityID in entities){
              const entity = entities[entityID];
              series.push({
                dataKey: entityID,
                label : entity.name,
                valueFormatter : v => (v || 0),
                showMark : false,
                type : 'line',
                color : entity.color
              });
            }
            setDataset(timeline);
            setSeries(series);
            setRows(Object.values(entities));
            setLoading(false);
            setOverview(overview);
            setError(null)
          }).catch((e) => {
              setError(e.message);
              setLoading(false);
          })
      }, []);
      return !loading && 
      <Card sx={{p : 2}}>
        <CardHeader title={title} />
        <CardContent sx={{
          display : 'flex',
          flexDirection : 'column',
          alignItems : 'center',
          justifyContent : 'center',
          p : 2,
          mb : 2,
        }}>
         <Card component='fieldset' sx={{
            display : 'flex',
            flexDirection : 'column',
            alignItems : 'flex-start',
            justifyContent : 'center',
            p : 2,
            mb : 2,
            width : 'max-content',
            height : 'max-content',
         }}>
            <CardHeader title="Overview" component='legend' />
            <Typography variant='body1' component='label'>
              Total Submissions : {overview.total_submissions}
            </Typography>
            <Typography variant='body1' component='label'>
              Total Newly Created : {overview.total_newly_created}
            </Typography>
            <Typography variant='body1' component='label'>
              Total Expanded : {overview.total_expanded}
            </Typography>
         </Card>
        <LineChart
          xAxis={axis}
          series={series}
          dataset={dataset}
          height={400}
        
        
        margin={{
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        
        }}
        slotProps={{
          legend: {
            hidden: true,
          },
          lineHighlight: {
            
          },

        }}
        
    />
    <DataGrid
        loading={loading}
        rows={rows}
        autoHeight
        disableColumnMenu
        columns={columns}
        checkboxSelection={false}
        disableSelectionOnClick
        density="compact"
        hideFooterSelectedRowCount
        />
        </CardContent>
    </Card>
  }


export default Statistics
