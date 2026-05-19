import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy, useState, useEffect } from "react";

// Eagerly loaded pages
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

// Lazy loaded pages
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

function Router() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [pendingMood, setPendingMood] = useState<string>("neutral");

  useEffect(() => {
    const savedState = localStorage.getItem("lumi_app_state") as AppState;
    if (savedState && savedState !== "landing") {
      setAppState(savedState);
    }
  }, []);

  const handleLogin = () => {
    setAppState("onboarding");
    localStorage.setItem("lumi_app_state", "onboarding");
  };

  const handleOnboardingComplete = (mood: string) => {
    setPendingMood(mood);
    setAppState("dashboard");
    localStorage.setItem("lumi_app_state", "dashboard");
  };

  const handleLogout = () => {
    setAppState("landing");
    localStorage.removeItem("lumi_app_state");
    localStorage.removeItem("lumi_guest_user");
  };

  if (appState === "onboarding") {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (appState === "dashboard") {
    return (
      <ErrorBoundary fallbackMessage="Something went wrong. Please try refreshing." showHomeButton>
        <AppShell onLogout={handleLogout}>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" variant="neural" />
            </div>
          }>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/voice" component={VoiceAgent} />
              <Route path="/exercises" component={Exercises} />
              <Route path="/community" component={Community} />
              <Route path="/journal" component={Journal} />
              <Route path="/music" component={MusicSpace} />
              <Route path="/books" component={BooksSpace} />
              <Route path="/games" component={GamesSpace} />
              <Route path="/crisis" component={Crisis} />
              <Route path="/analysis" component={Analysis} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </AppShell>
      </ErrorBoundary>
    );
  }

  // Landing state
  return (
    <Switch>
      <Route path="/crisis" component={Crisis} />
      <Route path="/login">
        {() => {
          handleLogin();
          return null;
        }}
      </Route>
      <Route>
        {() => <Landing onLogin={handleLogin} />}
      </Route>
    </Switch>
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