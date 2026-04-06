import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: Infinity,
    queryFn: async () => {
      const response = await fetch("/api/auth/user", { credentials: "include" });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        const message = (await response.text()) || response.statusText;
        throw new Error(message);
      }

      return (await response.json()) as User;
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
