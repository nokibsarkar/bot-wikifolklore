import { Routes as _Routes, Route } from "react-router-dom"
import React, { lazy, useEffect } from "react"
import AddTask from "./Pages/Tasks/AddTask.jsx";
import ListTask from "./Pages/Tasks/ListTask.jsx"
import Setting from "./Pages/Settings.jsx";
import DashBoard from "./Dashboard.jsx";
import Server from "./Server.ts"
import PeopleIcon from '@mui/icons-material/People';
import SettingIcon from '@mui/icons-material/Settings';
import {withSentryReactRouterV6Routing} from "@sentry/react";
const Routes = withSentryReactRouterV6Routing(_Routes);
const AddTopic = lazy(() => import('./Pages/Topics/CreateTopic.jsx'))
const EditTopic = lazy(() => import('./Pages/Topics/EditTopic.jsx'))
const ListTopic = lazy(() => import('./Pages/Topics/ListTopics.jsx'))
const ListUser = lazy(() => import('./Pages/User/ListUser.jsx'));
const EditUser = lazy(() => import('./Pages/User/EditUser.jsx'));
Server.init();
const FnF = ({ user }) => {
    useEffect(() => {
        document.title = "FnF"
    }, []);
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
            <Route path="*" element={<DashBoard user={user} />} />
        </Routes>
    )
}
const FnFTopicRoutes = {
    name: 'Topics',
    icon: null,
    path: '/fnf/topic',
    children: [
        {
            name: 'Create',
            icon: null,
            path: '/fnf/topic/create'
        },
        {
            name: 'Edit',
            icon: null,
            path: '/fnf/topic/:id/edit'
        },
        {
            name: 'View',
            icon: null,
            path: '/fnf/topic/:id'
        },
        {
            name: 'List',
            icon: null,
            path: '/fnf/topic'
        }
    ]
};
const FnFUserRoutes = {
    name: 'Users',
    icon: <PeopleIcon />,
    path: '/fnf/user',
    children: [
        {
            name: 'Edit',
            icon: null,
            path: '/fnf/user/:id/edit'
        },
        {
            name: 'List',
            icon: null,
            path: '/fnf/user'
        }
    ]
};
const FnFSettingRoutes = {
    name: 'Settings',
    icon: <SettingIcon />,
    path: '/fnf/setting'
};
const FnFTaskRoutes = {
    name: 'Tasks',
    icon: null,
    path: '/fnf/task',
    children: [
        {
            name: 'Create',
            icon: null,
            path: '/fnf/task/create'
        },
        {
            name: 'Edit',
            icon: null,
            path: '/fnf/task/:id/edit'
        },
        {
            name: 'View',
            icon: null,
            path: '/fnf/task/:id'
        },
        {
            name: 'List',
            icon: null,
            path: '/fnf/task'
        }
    ]
};
export const FnFRoutes = (user) => {
    const routes = {
        name: 'FnF',
        icon: null,
        path: '/fnf',
        children: [
        ]
    }
    if (Server.hasAccess(user.rights, Server.RIGHTS.TASK))
        routes.children.push(FnFTaskRoutes);
    if (Server.hasAccess(user.rights, Server.RIGHTS.TOPIC))
        routes.children.push(FnFTopicRoutes);
    if (Server.hasAccess(user.rights, Server.RIGHTS.GRANT))
        routes.children.push(FnFUserRoutes);
    routes.children.push(FnFSettingRoutes);
    return routes
}
export default FnF