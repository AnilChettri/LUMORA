import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: Infinity,
    queryFn: async () => {
      // Check for guest user first
      const guestUser = localStorage.getItem("lumi_guest_user");
      if (guestUser) {
        return JSON.parse(guestUser) as User;
      }

      try {
        const response = await fetch("/api/auth/user", { credentials: "include" });

        if (response.status === 401) {
          return null;
        }

        if (!response.ok) {
          throw new Error("Backend unavailable");
        }

        return (await response.json()) as User;
      } catch (err) {
        console.warn("Backend auth failed, checking for guest session...");
        return null;
      }
    },
  });

  const loginAsGuest = async () => {
    const guestUser: User = {
      id: "guest-id",
      username: "Guest",
      firstName: "Guest",
      lastName: "Explorer",
      email: "guest@example.com",
      profileImageUrl: null,
      isGuest: true,
      hasCompletedTour: false,
      hasConsentedCamera: false,
      hasConsentedMic: false,
      hasConsentedData: false,
      currentMood: "neutral",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    localStorage.setItem("lumi_guest_user", JSON.stringify(guestUser));
    await refetch();
  };

  const logout = async () => {
    localStorage.removeItem("lumi_guest_user");
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (e) {
      console.error("Logout fetch failed", e);
    }
    await refetch();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginAsGuest,
    logout,
    error,
  };
}
