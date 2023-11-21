
import './App.css';
import React from "react";
import * as Sentry from "@sentry/react";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import AppBar from './Layout/AppBar.jsx';
import Loading from './Layout/LoadingPage.jsx';
import AppDrawer from './Layout/AppDrawer';
import Footer from './Layout/Footer';
import Server from './Server.ts';
import {
  Route,
  Routes as _Routes,
  BrowserRouter,
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes
} from "react-router-dom";
import theme from './Layout/theme';
import { FnFRoutes } from './FnF/FnF.jsx';
import { KitKatRoutes } from './KitKat/KitKat.jsx';
const FnF = React.lazy(() => import('./FnF/FnF.jsx'));
const KitKat = React.lazy(() => import('./KitKat/KitKat.jsx'));
Server.init();
console.log("Environment: ", process.env.NODE_ENV);
Sentry.init({
  dsn: "https://d5f72a7651486fb43aef6fded21f5385@o249367.ingest.sentry.io/4506264792727552",
  environment: process.env.NODE_ENV || 'development',
  beforeSend(event, hint) {
    //prevent reporting of errors from development
    if (process.env.NODE_ENV != 'production') {
      return null;
    }
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({ eventId: event.event_id });
      return null;
    }

  },
  integrations: [
    new Sentry.BrowserProfilingIntegration(),
    new Sentry.BrowserTracing({
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: ["localhost:3000", /^https:\/\/tools\.wikilovesfolklore\.org/],
    }),
    new Sentry.Replay(),
  ],
  routingInstrumentation: Sentry.reactRouterV6Instrumentation(
    React.useEffect,
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes
  ),
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
const Routes = Sentry.withSentryReactRouterV6Routing(_Routes);
function ToolSelector() {
  const url = new URL(window.location.href);
  const tool = url.searchParams.get('tool') || url.pathname.split('/')[1];
  switch (tool) {
    case 'fnf':
      return ['FnF', '/fnf', FnF]
    case 'kitkat':
      return ['KitKat (development)', '/kitkat', KitKat]
    default:
      return ['FnF', '', () => <FnF />];
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
  }, []);
  const [toolName, toolPath, Tool] = ToolSelector();
  const commonProps = {
    user,
    setUser,
    toolName,
    toolPath,
    setOpen: setDrawerOpen,
    open: drawerOpen
  }
  return (
    <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AppBar {...commonProps} />
          <AppDrawer {...commonProps} components={Tools} />
          <React.Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/fnf/*" element={<FnF {...commonProps} />} title="FnF" />
              <Route path="/kitkat/*" element={<KitKat {...commonProps} />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
        <Footer />
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}


export default App;
