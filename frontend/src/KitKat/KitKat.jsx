import { Routes, Route } from "react-router-dom"
import React, { lazy } from "react"
import KitKatServer from "./Server.ts"
import Dashboard from "./Dashboard.jsx"
const KitKat = ({ user }) => {
    return (
        <Routes>
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