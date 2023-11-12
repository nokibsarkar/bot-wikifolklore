
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
import { FnFRoutes as FnFRoutes } from './FnF/FnF.jsx';
const FnF = React.lazy(() => import('./FnF/FnF.jsx'));
const KitKat = React.lazy(() => import('./KitKat/KitKat.jsx'));
function ToolSelector() {
  const url = new URL(window.location.href);
  const tool = url.searchParams.get('tool');
  switch (tool) {
    case 'fnf':
      return ['FnF', FnF]
    case 'kitkat':
      return ['KitKat', KitKat]
    default:
      return ['FnF', () => <FnF /> || <div>Unknown tool: {tool}</div>];
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
