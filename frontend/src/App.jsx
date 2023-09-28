
import './App.css';
import React from "react";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import AppBar from './AppBar.jsx';
import AppDrawer from './AppDrawer';
import { checkToken, AUTH_COOKIE_NAME } from './utils';

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
  const toolOptions = [
    {
      text : 'Topics',
      icon : null,
      component : null,
      active : true
    }
  ]
  const commonProps = {
    user,
    setUser,
    toolName,
    setOpen : setDrawerOpen,
    open: drawerOpen
  }
  return (
    <Paper sx={{
      height: "100%",
      width: "100%",
      m: 0,
      border: 0,
      outline: 0,
      position: 'absolute',
    }}>
      <AppBar {...commonProps} />
      <AppDrawer {...commonProps} components={toolOptions} />
      <React.Suspense fallback={<div>Loading...</div>}>
        <Tool />
      </React.Suspense>
    </Paper>
  )
}

export default App;
