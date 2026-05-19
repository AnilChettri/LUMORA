import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy, useState, useEffect } from "react";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

const VoiceAgent = lazy(() => import("@/pages/VoiceAgent"));
const Exercises = lazy(() => import("@/pages/Exercises"));
const Community = lazy(() => import("@/pages/Community"));
const Journal = lazy(() => import("@/pages/Journal"));
const MusicSpace = lazy(() => import("@/pages/MusicSpace"));
const BooksSpace = lazy(() => import("@/pages/BooksSpace"));
const GamesSpace = lazy(() => import("@/pages/GamesSpace"));
const Crisis = lazy(() => import("@/pages/Crisis"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Analysis = lazy(() => import("@/pages/Analysis"));

type AppState = "landing" | "onboarding" | "dashboard";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner size="lg" variant="neural" />
        <p className="mt-4 text-muted-foreground">Loading Lumi...</p>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const [appState, setAppState] = useState<AppState>("landing");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lumi_app_state") as AppState;
    if (saved === "onboarding" || saved === "dashboard") {
      setAppState(saved);
    } else {
      const guestUser = localStorage.getItem("lumi_guest_user");
      if (guestUser) {
        setAppState("onboarding");
        localStorage.setItem("lumi_app_state", "onboarding");
      }
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (location === "/onboarding" || appState === "onboarding") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Onboarding onComplete={() => {
          setAppState("dashboard");
          localStorage.setItem("lumi_app_state", "dashboard");
          window.location.href = "/dashboard";
        }} />
      </Suspense>
    );
  }

  if (location.startsWith("/dashboard")) {
    if (appState !== "dashboard") {
      window.location.href = "/";
      return <LoadingScreen />;
    }
    return (
      <ErrorBoundary fallbackMessage="Something went wrong. Please refresh the page." showHomeButton>
        <AppShell>
          <Suspense fallback={<LoadingScreen />}>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/dashboard/voice" component={VoiceAgent} />
              <Route path="/dashboard/exercises" component={Exercises} />
              <Route path="/dashboard/community" component={Community} />
              <Route path="/dashboard/journal" component={Journal} />
              <Route path="/dashboard/music" component={MusicSpace} />
              <Route path="/dashboard/books" component={BooksSpace} />
              <Route path="/dashboard/games" component={GamesSpace} />
              <Route path="/dashboard/crisis" component={Crisis} />
              <Route path="/dashboard/analysis" component={Analysis} />
              <Route>
                <Dashboard />
              </Route>
            </Switch>
          </Suspense>
        </AppShell>
      </ErrorBoundary>
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/onboarding">
          <Onboarding onComplete={() => {
            setAppState("dashboard");
            localStorage.setItem("lumi_app_state", "dashboard");
            window.location.href = "/dashboard";
          }} />
        </Route>
        <Route path="/">
          <Landing />
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <ErrorBoundary
            fallbackMessage="Lumi encountered an unexpected error. Please refresh the page."
            showHomeButton
          >
            <Toaster />
            <Router />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;