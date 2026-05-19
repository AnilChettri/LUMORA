import { useQuery, useMutation } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0,
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/user", { credentials: "include" });

        if (response.status === 401) {
          return null;
        }

        if (!response.ok) {
          return null;
        }

        return (await response.json()) as User;
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
    await refetch();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginAsGuest,
    loginAsDemo,
    logout,
    error,
  };
}