import React, { useEffect, useState } from 'react'
import { BarChart } from '@mui/x-charts/BarChart';
import CampWizServer from '../../Server';
const TukTukStatistics = () => {
    const [entityCount, setEntityCount] = useState([]);
    const [taskStats, setTaskStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    useEffect(() => {
        // CampWizServer.
    }, []);
    return <div>
    <BarChart
    title='Overview'

        xAxis={[
            {
              id: 'barCategories',
              data: ['Users', 'Lists generated', 'ArticleCount on lists'],
              scaleType: 'band',
            },
          ]}
          series={[
            {
              data: [2, 5, 3],
            }
          ]}
          height={500}
        />

        </div>
}
const CampWizStatistics = () => {
    return <TukTukStatistics />
}
export default CampWizStatistics