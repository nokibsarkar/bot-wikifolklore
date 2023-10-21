
import './App.css';
import React from "react";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import SettingIcon from '@mui/icons-material/Settings';
import AppBar from './Layout/AppBar.jsx';
import Loading from './Layout/LoadingPage.jsx';
import AppDrawer from './Layout/AppDrawer';
import { checkToken, AUTH_COOKIE_NAME } from './utils';
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

const TukTukBot = React.lazy(() => import('./TukTukBot/TukTukBot.jsx'));
function ToolSelector() {
  const url = new URL(window.location.href);
  const tool = url.searchParams.get('tool');
  switch (tool) {
    case 'tuktukbot':
      return ['TukTukBot', TukTukBot]
    default:
      return ['TukTukBot', () => <TukTukBot /> || <div>Unknown tool: {tool}</div>];
  }
}
const Tools = [
  {
    name : 'TukTukBot',
    icon : null,
    path : '/tuktukbot',
    children : [
      {
        name : 'Topics',
        icon : null,
        path : '/tuktukbot/topic',
        children : [
          {
            name : 'Create',
            icon : null,
            path : '/tuktukbot/topic/create'
          },
          {
            name : 'Edit',
            icon : null,
            path : '/tuktukbot/topic/:id/edit'
          },
          {
            name : 'View',
            icon : null,
            path : '/tuktukbot/topic/:id'
          },
          {
            name : 'List',
            icon : null,
            path : '/tuktukbot/topic'
          }
        ]
      },
      {
        name : 'Users',
        icon : null,
        path : '/tuktukbot/user',
        children : [
          {
            name : 'Edit',
            icon : null,
            path : '/tuktukbot/user/:id/edit'
          },
          {
            name : 'List',
            icon : null,
            path : '/tuktukbot/user'
          }
        ]
      },
      {
        name : 'Tasks',
        icon : null,
        path : '/tuktukbot/task',
        children : [
          {
            name : 'Create',
            icon : null,
            path : '/tuktukbot/task/create'
          },
          {
            name : 'Edit',
            icon : null,
            path : '/tuktukbot/task/:id/edit'
          },
          {
            name : 'View',
            icon : null,
            path : '/tuktukbot/task/:id'
          },
          {
            name : 'List',
            icon : null,
            path : '/tuktukbot/task'
          }
        ]
      },
      {
        name : 'Settings',
        icon : <SettingIcon />,
        path : '/tuktukbot/setting'
      }
    ]
  }
]
function App() {
  const [user, setUser] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  React.useEffect(() => {
    const authCookie = document.cookie.split('; ').find(row => row.startsWith(AUTH_COOKIE_NAME));
    if (authCookie) {
      const token = authCookie.split('=')[1];
      const decoded = checkToken(token);
      setUser(decoded);
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
            <Route path="/tuktukbot/*" element={<TukTukBot {...commonProps} />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}


export default App;
