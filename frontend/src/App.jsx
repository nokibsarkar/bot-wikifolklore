
import './App.css';
import React from "react";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from '@mui/material/styles';

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
import { FnFRoutes } from './FnF/FnF.jsx';
import { KitKatRoutes } from './KitKat/KitKat.jsx';
const FnF = React.lazy(() => import('./FnF/FnF.jsx'));
const KitKat = React.lazy(() => import('./KitKat/KitKat.jsx'));
Server.init();
function ToolSelector() {
  const url = new URL(window.location.href);
  const tool = url.searchParams.get('tool') || url.pathname.split('/')[1]
  switch (tool) {
    case 'fnf':
      return ['FnF', '/fnf', FnF]
    case 'kitkat':
      return ['KitKat (development)', '/kitkat', KitKat]
    default:
      return ['FnF', '', () => <FnF /> || <div>Unknown tool: {tool}</div>];
  }
}

const Tools = []
function App() {
  const [user, setUser] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  React.useEffect(() => {
    const decoded = Server.loginnedUser();
    if (decoded) {
      setUser(decoded);
      Tools[0] = FnFRoutes(decoded);
      // Tools[1] = KitKatRoutes(decoded);
    } else {
      console.log("Please login to continue")
    }
  }, [])
  const [toolName,toolPath, Tool] = ToolSelector();
  const commonProps = {
    user,
    setUser,
    toolName,
    toolPath,
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
            <Route path="/kitkat/*" element={<KitKat {...commonProps} />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      <Footer />
    </ThemeProvider>
  );
}


export default App;
