import { Routes, Route } from "react-router-dom"
import React, { lazy } from "react"
import AddTask from "./Pages/Tasks/AddTask.jsx";
import ListTask from "./Pages/Tasks/ListTask.jsx"
import Setting from "./Pages/Settings.jsx";

import Server from "./Server.ts"
const AddTopic = lazy(() => import('./Pages/Topics/CreateTopic.jsx'))
const EditTopic = lazy(() => import('./Pages/Topics/EditTopic.jsx'))
const ListTopic = lazy(() => import('./Pages/Topics/ListTopics.jsx'))

const ListUser = lazy(() => import('./Pages/User/ListUser.jsx'));
const EditUser = lazy(() => import('./Pages/User/EditUser.jsx'));
Server.init()
const TukTukBot = ({ user }) => {
    const DashBoard = (
        Server.hasAccess(user.rights, Server.RIGHTS.TOPIC) && ListTopic
        || Server.hasAccess(user.rights, Server.RIGHTS.TASK) && ListTask
        || Setting
    )
    const TopicRoutes = (
        <Route path='topic/*'>
            <Route path="create" element={<AddTopic />} />
            <Route path="edit" element={<EditTopic />} />
            <Route path="*" element={<ListTopic />} />
        </Route>
    )
    const UserRoutes = (
        <Route path='user/*'>
            <Route path="edit" element={<EditUser user={user} />} />
            <Route path="*" element={<ListUser user={user} />} />
        </Route>
    )
    return (
        <Routes>
            {Server.hasAccess(user.rights, Server.RIGHTS.TOPIC) && TopicRoutes}
            {Server.hasAccess(user.rights, Server.RIGHTS.GRANT) && UserRoutes}
            <Route path="task/*" >
                <Route path="create" element={<AddTask />} />
                <Route path="*" element={<ListTask />} />
            </Route>
            <Route path="setting" element={<Setting />} />
            <Route path="*" element={<DashBoard />} />
        </Routes>
    )
}

export default TukTukBot