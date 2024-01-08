import React, { useEffect, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart';
import CampWizServer from '../../Server';
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import { DataGrid } from '@mui/x-data-grid';
export const generateRandomColor = () => '#' + Math.floor(Math.random()*16777200 + 200).toString(16);
const processUserTimeline = (submissions) => {
  const users = {}
  const dates = {};
  for(const submission of submissions){
  const date = new Date(submission.date).getTime();
    if(!dates[date]) dates[date] = {'date': date};
    dates[date][submission.color] = submission.count;
    if(!users[submission.color]) users[submission.color] = { id : submission.color};
    users[submission.color].color = generateRandomColor();
    users[submission.color].count = (users[submission.color].count || 0) + submission.count;
  }
  const series = [];
  for(const user in users){
    series.push({
      dataKey: user,
      label : user,
      valueFormatter : v => (v || 0),
      showMark : false,
      color : users[user].color
    });
  }
  return {users, dates : Object.values(dates), series};
}
const Statistics = ({campaignID, columns, groupBy = 'language', title = 'User Submissions', processTimeline}) => {
      const [submissions, setSubmissions] = useState([]);
      const [series, setSeries] = useState([]);
      const [colors, setColors] = useState({});
      const [dataset, setDataset] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(false);
      const axis = [
        {
          dataKey: 'date',
          valueFormatter: (v) => new Date(v).toDateString(),
          scaleType : 'time',
        },
      ];
      useEffect(() => {
          setLoading(true);
          CampWizServer.Campaign.getTimeline(groupBy, campaignID).then((submissions) => {
            const {users, dates, series} = processUserTimeline(submissions);
            setSubmissions(dates);
            setSeries(series);
            setColors(users);
            setLoading(false);
          }).catch((e) => {
              setError(e.message);
              setLoading(false);
          })
      }, []);
      return !loading && 
      <Card sx={{p : 2}}>
        <CardHeader title={title} />
        <CardContent>
         
        <LineChart
        xAxis={axis}
        series={series}
        dataset={submissions}
        height={400}
        
        
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        
        }}
        slotProps={{
          legend: {
            hidden: true,

          },
        }}
        
    />
    <DataGrid
        loading={loading}
        rows={Object.values(colors)}
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