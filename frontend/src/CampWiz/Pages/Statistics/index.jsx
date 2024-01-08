import React, { useEffect, useState } from 'react'

import LanguageStatistics from './LanguageStatistics';
import YearStatistics from './YearStatistics';
const CampWizStatistics = () => {
  const [campaignID, setCampaignID] = useState(2);
    return <div>
      {campaignID ? <LanguageStatistics campaignID={campaignID} /> : <YearStatistics />}

    </div>
}
export default CampWizStatistics