import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy, useState, useEffect, useCallback } from "react";

import Landing from "@/pages/Landing";
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
  const [, setLocation] = useLocation();
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

  useEffect(() => {
    const handleStorageChange = () => {
      if (appState === "landing") {
        const guestUser = localStorage.getItem("lumi_guest_user");
        const appStateSaved = localStorage.getItem("lumi_app_state");
        if (guestUser && appStateSaved !== "dashboard") {
          setAppState("onboarding");
          localStorage.setItem("lumi_app_state", "onboarding");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [appState]);

  const handleLogin = useCallback(() => {
    setAppState("onboarding");
    localStorage.setItem("lumi_app_state", "onboarding");
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setAppState("dashboard");
    localStorage.setItem("lumi_app_state", "dashboard");
    setLocation("/");
  }, [setLocation]);

  const handleLogout = useCallback(() => {
    setAppState("landing");
    localStorage.removeItem("lumi_app_state");
    localStorage.removeItem("lumi_guest_user");
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  if (appState === "onboarding") {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Onboarding onComplete={handleOnboardingComplete} />
      </Suspense>
    );
  }

  if (appState === "dashboard") {
    return (
      <ErrorBoundary fallbackMessage="Something went wrong. Please refresh the page." showHomeButton>
        <AppShell>
          <Suspense fallback={<LoadingScreen />}>
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

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/crisis" component={Crisis} />
        <Route>
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