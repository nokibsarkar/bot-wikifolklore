import { Routes, Route } from "react-router-dom"
import React, { lazy } from "react"
import KitKatServer from "./Server.ts"
import Dashboard from "./Dashboard.jsx"
import ArticleSubmissionPage from "./Pages/Campaign/ArticleSubmission.jsx"

const KitKat = ({ user }) => {
    const CampaignRoutes = (
        <Route path='campaign/*'>
            <Route path="submit" element={<ArticleSubmissionPage />} />
            <Route path="*" element={<div>Unknown Campaign Page</div>} />
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
        ]
    }
    return routes;
}
export default KitKat