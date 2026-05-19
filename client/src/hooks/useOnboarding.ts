import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface OnboardingActions {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export function useOnboarding(): OnboardingActions {
  const { user, isLoading: isUserLoading } = useAuth();
  const queryClient = useQueryClient();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      setHasCompletedOnboarding(true);
      setIsLoading(false);
      return;
    }
    setHasCompletedOnboarding(Boolean(user.hasCompletedTour));
    setIsLoading(false);
  }, [user, isUserLoading]);

  const syncUser = async (data: Partial<{ hasCompletedTour: boolean; currentMood: string | null }>) => {
    if (!user) return;
    await fetch("/api/auth/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
  };

  const completeOnboarding = async () => {
    setHasCompletedOnboarding(true);
    await syncUser({ hasCompletedTour: true });
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  const resetOnboarding = async () => {
    setHasCompletedOnboarding(false);
    await syncUser({ hasCompletedTour: false, currentMood: null });
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
  };

  return {
    hasCompletedOnboarding,
    isLoading: isLoading || isUserLoading,
    completeOnboarding,
    resetOnboarding,
  };
}
