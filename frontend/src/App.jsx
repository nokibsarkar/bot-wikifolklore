
import './App.css';
import React from "react";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import SettingIcon from '@mui/icons-material/Settings';
import AppBar from './Layout/AppBar.jsx';
import Loading from './Layout/LoadingPage.jsx';
import AppDrawer from './Layout/AppDrawer';
import Footer from './Layout/Footer';
import Server from './Server.ts';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Link,
  Routes,
  Router,
  BrowserRouter
} from "react-router-dom";
import theme from './Layout/theme';

const FnF = React.lazy(() => import('./FnF/FnF.jsx'));
function ToolSelector() {
  const url = new URL(window.location.href);
  const tool = url.searchParams.get('tool');
  switch (tool) {
    case 'fnf':
      return ['FnF', FnF]
    default:
      return ['FnF', () => <FnF /> || <div>Unknown tool: {tool}</div>];
  }
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
  icon: null,
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
const Tools = [

]
function App() {
  const [user, setUser] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  React.useEffect(() => {
    const decoded = Server.loginnedUser();
    if (decoded) {
      setUser(decoded);
      const FnFRoutes = {
        name: 'FnF',
        icon: null,
        path: '/fnf',
        children: [
        ]
      }
      if (Server.hasAccess(decoded.rights, Server.RIGHTS.TASK))
        FnFRoutes.children.push(FnFTaskRoutes);
      if (Server.hasAccess(decoded.rights, Server.RIGHTS.TOPIC))
        FnFRoutes.children.push(FnFTopicRoutes);
      if (Server.hasAccess(decoded.rights, Server.RIGHTS.GRANT))
        FnFRoutes.children.push(FnFUserRoutes);
      FnFRoutes.children.push(FnFSettingRoutes);
      Tools[0] = FnFRoutes;
    } else {
      console.log("Please login to continue")
    }
  }, [])
  const [toolName, Tool] = ToolSelector();
  const commonProps = {
    user,
    setUser,
    toolName,
    setOpen: setDrawerOpen,
    open: drawerOpen
  }
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppBar {...commonProps} />
        <AppDrawer {...commonProps} components={Tools} />
        <React.Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/fnf/*" element={<FnF {...commonProps} />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      <Footer />
    </ThemeProvider>
  );
}


export default App;
