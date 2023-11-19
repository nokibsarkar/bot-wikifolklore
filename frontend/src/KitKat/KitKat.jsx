import { Routes, Route } from "react-router-dom"
import React, { lazy } from "react"
import KitKatServer from "./Server.ts"
import CampaignIcon from '@mui/icons-material/Campaign';
import Dashboard from "./Dashboard.jsx"
import ArticleSubmissionPage from "./Pages/Campaign/Submission/NewSubmission.jsx"
const JudgeSubmission = lazy(() => import("./Pages/Campaign/Submission/JudgeSubmission.jsx"))
const SubmissionList = lazy(() => import("./Pages/Campaign/Submission/index.jsx"))
const CampaignList = lazy(() => import("./Pages/Campaign/index.jsx"))
const Campaign = lazy(() => import("./Pages/Campaign/Campaign.jsx"));
const CampaignEdit = lazy(() => import("./Pages/Campaign/Configure/Edit.jsx"));
const CampaignCreate = lazy(() => import("./Pages/Campaign/Configure/Create.jsx"));
const KitKat = ({ user }) => {
    const CampaignRoutes = (
        <Route path='campaign'>
            <Route path=":campaignID">
                <Route path="submission" >
                    <Route path="new" element={<ArticleSubmissionPage />} />
                    <Route path=":submissionID" element={<JudgeSubmission />} />
                    <Route path="" element={<SubmissionList />} />
                </Route>
                <Route path="edit" element={<CampaignEdit />} />
                <Route path="" element={<Campaign />} />
            </Route>
            <Route path="new" element={<CampaignCreate />} />
            <Route path="" element={<CampaignList />} />
        </Route>
    )
    return (
        <Routes>
            {CampaignRoutes}
            <Route path="*" element={<Dashboard user={user} />} />
        </Routes>
    )
}
export const KitKatRoutes = (user) => {
    const routes = {
        name: 'KitKat (development)',
        icon: null,
        path: '/kitkat',
        children: [
            {
                name: 'Campaign',
                icon: <CampaignIcon />,
                path: '/kitkat/campaign',
                children: []
            }
        ]
    }
    return routes;
}
export default KitKat