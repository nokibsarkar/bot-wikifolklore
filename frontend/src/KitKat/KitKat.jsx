import { Routes, Route } from "react-router-dom"
import React, { lazy } from "react"
import KitKatServer from "./Server.ts"
const KitKat = ({ user }) => {
    return (
        <Routes>
            <Route path="*" element={<h1>KitKat</h1>} />
        </Routes>
    )
}
export const KitKatRoutes = (user) => {
    
}
export default KitKat