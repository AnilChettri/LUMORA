import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export function useAuth() {
  const [, setLocation] = useLocation();
  const isGuest = localStorage.getItem("lumi_guest_user") === "true";
  const appState = localStorage.getItem("lumi_app_state");
  
  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0,
    queryFn: async () => {
      if (isGuest) return null;
      try {
        const response = await fetch("/api/auth/user", { credentials: "include" });
        if (response.status === 401) return null;
        if (!response.ok) return null;
        return await response.json() as User;
      } catch {
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const loginAsGuest = async () => {
    await loginMutation.mutateAsync("guest");
    localStorage.setItem("lumi_guest_user", "true");
    localStorage.setItem("lumi_app_state", "onboarding");
    setLocation("/onboarding");
  };

  const loginAsDemo = async (userId: string) => {
    await loginMutation.mutateAsync(userId);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout fetch failed", e);
    }
    localStorage.removeItem("lumi_guest_user");
    localStorage.removeItem("lumi_app_state");
    setLocation("/");
    await refetch();
  };

  const isAuthenticated = !isGuest && !!user && appState === "dashboard";

  return {
    user,
    isLoading,
    isAuthenticated,
    isGuest,
    loginAsGuest,
    loginAsDemo,
    logout,
    error,
  };
}