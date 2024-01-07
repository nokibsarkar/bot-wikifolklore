
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
import { CampWizRoutes } from './CampWiz/CampWiz.jsx';
import UserfeedBackForm from './UserfeedBackForm.jsx';
const FnF = React.lazy(() => import('./FnF/FnF.jsx'));
const CampWiz = React.lazy(() => import('./CampWiz/CampWiz.jsx'));
const dsn = "https://d5f72a7651486fb43aef6fded21f5385@o249367.ingest.sentry.io/4506264792727552";
Server.init();
Sentry.init({
  dsn: dsn,
  environment: process.env.NODE_ENV || 'development',
  beforeSend(event, hint) {
    //prevent reporting of errors from development
    if (process.env.NODE_ENV != 'production') {
      return null;
    }
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({ eventId: event.event_id, labelEmail: "Wikipedia Username", labelName: "Name", });
    }
    return event;

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
  tracesSampleRate: 0.8, // Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.005, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 0.005, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
const RedirectToLoginPage = () => {
  const callback = encodeURIComponent(window.location.href);
  return <meta http-equiv="refresh" content={`0; url=/login/?callback=${callback}`} />
}
const Routes = Sentry.withSentryReactRouterV6Routing(_Routes);
function ToolSelector() {
  const url = new URL(window.location.href);
  const tool = url.searchParams.get('tool') || url.pathname.split('/')[1];
  switch (tool) {
    case 'fnf':
      return ['FnF (beta)', '/fnf', FnFRoutes]
    case 'campwiz':
      return ['CampWiz (development)', '/campwiz', CampWizRoutes]
    default:
      return ['FnF (beta)', '', FnFRoutes];
  }
}

const Tools = []
function App() {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const [toolName, toolPath, getRoutes] = ToolSelector();
  const user = Server.loginnedUser();
  if (user) {
    // setUser(decoded);
    Tools[0] = getRoutes(user);
    // Tools[1] = CampWizRoutes(decoded);
  } else {
    console.log("Please login to continue");
    return <RedirectToLoginPage />
  }
  const commonProps = {
    user,
    toolName,
    toolPath,
    setOpen: setDrawerOpen,
    open: drawerOpen
  }
  return (
    <Sentry.ErrorBoundary fallback={<div>Something went wrong</div>} showDialog>
      {/* <UserfeedBackForm user={user}  projectId={Sentry.getCurrentHub().getClient().getDsn().projectId} /> */}
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AppBar {...commonProps} />
          <AppDrawer {...commonProps} components={Tools} />
          <React.Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/fnf/*" element={<FnF {...commonProps} />} title="FnF" />
              <Route path="/campwiz/*" element={<CampWiz {...commonProps} />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
        <Footer />
      </ThemeProvider>
    </Sentry.ErrorBoundary>
  );
}


export default App;
