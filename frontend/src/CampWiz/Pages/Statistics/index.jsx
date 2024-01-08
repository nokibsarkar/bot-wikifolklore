import React, { useEffect, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart';
import CampWizServer from '../../Server';
// const TukTukStatistics = () => {
//     const [entityCount, setEntityCount] = useState([]);
//     const [taskStats, setTaskStats] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(false);
//     useEffect(() => {
//         // CampWizServer.
//     }, []);
//     return <div>
//     <BarChart
//     title='Overview'

//         xAxis={[
//             {
//               id: 'barCategories',
//               data: ['Users', 'Lists generated', 'ArticleCount on lists'],
//               scaleType: 'band',
//             },
//           ]}
//           series={[
//             {
//               data: [2, 5, 3],
              
//             }
//           ]}
//           height={500}
//         />

//         </div>
// }







const worldElectricityProduction = [
  {
    country: 'World',
    year: 1985,
    other: 0,
    bio: 0,
    solar: 0.011747475,
    wind: 0.064220205,
    hydro: 1979.2446,
    nuclear: 1488.9216,
    oil: 1110.7847,
    gas: 1426.3086,
    coal: 3748.3848,
  },
  {
    country: 'World',
    year: 1986,
    other: 0,
    bio: 0,
    solar: 0.015183838,
    wind: 0.13883132,
    hydro: 2006.0651,
    nuclear: 1594.7357,
    oil: 1168.3097,
    gas: 1432.6683,
    coal: 3839.0095,
  }
];

const keyToLabel = {
  coal: 'Electricity from coal (TWh)',
  gas: 'Electricity from gas (TWh)',
  oil: 'Electricity from oil (TWh)',
  nuclear: 'Electricity from nuclear (TWh)',
  hydro: 'Electricity from hydro (TWh)',
  wind: 'Electricity from wind (TWh)',
  solar: 'Electricity from solar (TWh)',
  bio: 'Electricity from bioenergy (TWh)',

  other: 'Other renewables excluding bioenergy (TWh)',
};

const colors = {
  other: 'lightgray',
  bio: 'lightgreen',
  solar: 'yellow',
  wind: 'lightblue',
  hydro: 'blue',
  nuclear: 'orange',
  oil: 'darkgrey',
  gas: 'gray',
  coal: 'black',
};



const customize = {
  height: 300,
  legend: { hidden: true },
  margin: { top: 5 },
  stackingOrder: 'descending',
};



const LanguageStatistics = ({campaign}) => {
      const [submissions, setSubmissions] = useState([]);
      const [series, setSeries] = useState(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(false);
      const axis = [
        {
          dataKey: 'date',
          valueFormatter: (v) => new Date(v).toDateString(),
        },
      ];
      useEffect(() => {
          setLoading(true);
          CampWizServer.Campaign.getTimeline('user', campaign.id).then((submissions) => {
            const users = {}
            const dates = {};
            const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'grey', 'black']
            for(const submission of submissions){
             const date = new Date(submission.date).getTime();
              if(!dates[date]) dates[date] = {'date': date};
              dates[date][submission.color] = submission.count;
              users[submission.color] = colors.pop();
            }
            const dataset = [];
            for(const date in dates){
              dataset.push(dates[date]);
            }
            
            const series = [];
            for(const user in users){
              series.push({
                dataKey: user,
                label : user,
                stroke: users[user],
                // color : users[user],
              })
            }
            setSubmissions(dataset);
            setSeries(series);
              setLoading(false);
            //   console.log(submissions)
            //   console.log(series)
          }).catch((e) => {
              setError(e.message);
              setLoading(false);
          })
      }, []);
      return series && <LineChart
      xAxis={axis}
      series={series}
      dataset={submissions}
      {...customize}
    />
  }
const YearStatistics = () => {
      
  }
const CampWizStatistics = () => {
    return <div>
      <LanguageStatistics campaign={{id: 2}} />
      <YearStatistics />
    </div>
}
export default CampWizStatistics