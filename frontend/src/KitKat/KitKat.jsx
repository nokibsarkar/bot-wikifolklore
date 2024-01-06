import { Routes as _Routes, Route } from "react-router-dom"
import React, { lazy, useEffect } from "react"
import KitKatServer from "./Server.ts"
import CampaignIcon from '@mui/icons-material/Campaign';
import Dashboard from "./Pages/Dashboard.jsx"
import ArticleSubmissionPage from "./Pages/Campaign/Submission/NewSubmission.jsx"
import CampaignList from "./Pages/Campaign/index.jsx";
import {withSentryReactRouterV6Routing} from "@sentry/react";
import PeopleIcon from '@mui/icons-material/People';
const Routes = withSentryReactRouterV6Routing(_Routes);
const JudgeSubmission = lazy(() => import("./Pages/Campaign/Submission/JudgeSubmission.jsx"))
const SubmissionList = lazy(() => import("./Pages/Campaign/Submission/index.jsx"))
const Campaign = lazy(() => import("./Pages/Campaign/Campaign.jsx"));
const CampaignEdit = lazy(() => import("./Pages/Campaign/Configure/Edit.jsx"));
const CampaignCreate = lazy(() => import("./Pages/Campaign/Configure/Create.jsx"));
const ListUser = lazy(() => import("./Pages/User/ListUser.jsx"));
const EditUser = lazy(() => import("./Pages/User/EditUser.jsx"));
const Statistics = lazy(() => import("./Pages/Statistics/index.jsx"));
await KitKatServer.init();
const RedirectToLoginPage = ({returnTo}) => {
    return <meta http-equiv="refresh" content={`0; url=/login/?return=${returnTo}`} />
}
const KitKat = ({ user }) => {
    useEffect(() => {
        document.title = "KitKat"
    }, []);
    if(!user)
        return <RedirectToLoginPage returnTo={window.location.pathname} />
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
    );
    const UserRoutes = (
        <Route path='user/*'>
            <Route path="edit" element={<EditUser user={user} />} />
            <Route path="*" element={<ListUser user={user} />} />
        </Route>
    )
    return (
        <Routes>
            {CampaignRoutes}
            {UserRoutes}
            <Route path="statistics" element={<Statistics user={user} />} />
            <Route path="*" element={<Dashboard user={user} />} />
        </Routes>
    )
}
const KitKatUserRoutes = {
    name: 'Users',
    icon: <PeopleIcon />,
    path: '/kitkat/user',
    children: [
        {
            name: 'Edit',
            icon: null,
            path: '/kitkat/user/:id/edit'
        },
        {
            name: 'List',
            icon: null,
            path: '/kitkat/user'
        }
    ]
};
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
            },
            KitKatUserRoutes
        ]
    }
    return routes;
}
export default KitKat