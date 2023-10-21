import { Routes, Route } from "react-router-dom"
import React, {lazy} from "react"
import AddTask from "./Pages/Tasks/AddTask.jsx";
import ListTask from "./Pages/Tasks/ListTask.jsx"
import Setting from "./Pages/Settings.jsx";

import Server from "./Server.ts"
const AddTopic = lazy(() => import('./Pages/Topics/CreateTopic.jsx'))
const EditTopic = lazy(() => import('./Pages/Topics/EditTopic.jsx'))
const ListTopic = lazy(() => import('./Pages/Topics/ListTopics.jsx'))
Server.init()
const TukTukBot = () => {
    const isPrevilleged = true
    const DashBoard = isPrevilleged ? ListTopic : ListTask
    const PrevillegedRoutes = (
        <Route path='/topic/*'>
            <Route path="create" element={<AddTopic />} />
            <Route path="edit" element={<EditTopic />} />
            <Route path="*" element={<ListTopic />} />
        </Route>
    )
    return (
        <Routes>
            {isPrevilleged && PrevillegedRoutes}
            <Route path="task/*" >
                <Route path="create" element={<AddTask />} />
                {/* <Route path=":id" element={<Setting />} /> */}
                <Route path="*" element={<ListTask />} />
            </Route>
            <Route path="/setting" element={<Setting />} />
            <Route path="*" element={<DashBoard />} />
        </Routes>
    )
}

export default TukTukBot