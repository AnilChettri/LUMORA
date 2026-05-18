import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy, useState, useEffect } from "react";

// Eagerly loaded pages (small, frequently accessed)
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

// Lazy loaded pages (heavy or less frequently accessed)
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

function AuthenticatedRoutes() {
  return (
    <ErrorBoundary fallbackMessage="Something went wrong with the app. Please try refreshing." showHomeButton>
      <AppShell>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" variant="neural" />
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        }>
          <Switch>
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/" component={Dashboard} />

            {/* Voice Agent */}
            <Route path="/voice">
              {() => (
                <ErrorBoundary
                  fallbackMessage="We couldn't load the voice agent. Please try again."
                  onReset={() => window.location.reload()}
                >
                  <VoiceAgent />
                </ErrorBoundary>
              )}
            </Route>

            <Route path="/exercises" component={Exercises} />
            <Route path="/community" component={Community} />
            <Route path="/journal" component={Journal} />
            <Route path="/music" component={MusicSpace} />
            <Route path="/books" component={BooksSpace} />
            <Route path="/games" component={GamesSpace} />
            <Route path="/crisis" component={Crisis} />
            <Route path="/analysis" component={Analysis} />
            
            {/* Redirect /login to / for authenticated users */}
            <Route path="/login">
              {() => {
                window.location.href = "/";
                return null;
              }}
            </Route>

            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  );
}

function Router() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { hasCompletedOnboarding, isLoading: isOnboardingLoading } = useOnboarding();
  const [showFallback, setShowFallback] = useState(false);

  const isLoading = isAuthLoading || isOnboardingLoading;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth check timed out, falling back to unauthenticated view.");
        setShowFallback(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !showFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" variant="neural" />
          <p className="mt-4 text-muted-foreground">Loading Lumi...</p>
        </div>
      </div>
    );
  }

  // User is not authenticated - show Landing/Login
  if (!isAuthenticated || (isLoading && showFallback)) {
    return (
      <Switch>
        <Route path="/crisis" component={Crisis} />
        <Route path="/login" component={Login} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Authenticated but hasn't completed onboarding - redirect to onboarding
  if (!hasCompletedOnboarding) {
    return (
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/crisis" component={Crisis} />
        <Route>
          {() => {
            window.location.href = "/onboarding";
            return null;
          }}
        </Route>
      </Switch>
    );
  }

  // Authenticated and onboarded - show main app
  return <AuthenticatedRoutes />;
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
