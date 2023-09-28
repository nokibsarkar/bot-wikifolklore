import { Routes, Route } from "react-router-dom"
import React from "react"
import AddTask from "./Pages/Tasks/AddTask.jsx";
import ListTask from "./Pages/Tasks/ListTask.jsx"
import Setting from "./Pages/Settings.jsx";
import DashBoard from "./Pages/Dashboard.jsx";
import AddTopic from "./Pages/Topics/CreateTopic.jsx";
import EditTopic from "./Pages/Topics/EditTopic.jsx";
const TukTukBot = () => {
    return (
        <Routes>
            <Route path='/topic/*'>
                <Route path="create" element={<AddTopic />} />
                <Route path=":id/edit" element={<Setting />} />
                <Route path=":id" element={<Setting />} />
                <Route path="*" element={<Setting />} />
            </Route>
            <Route path="task/*" >
                <Route path="create" element={<AddTask />} />
                <Route path=":id/edit" element={<EditTopic />} />
                <Route path=":id" element={<Setting />} />
                <Route path="*" element={<ListTask />} />
            </Route>
            <Route path="/setting" element={<Setting />} />
            <Route path="*" element={<DashBoard />} />
        </Routes>
    )
}

export default TukTukBot