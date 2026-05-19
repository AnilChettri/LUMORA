import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Brain, LogOut, Settings, User, Home, Mic, Users, BarChart3 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/dashboard/voice", icon: Mic, label: "Lumi" },
  { path: "/dashboard/community", icon: Users, label: "Community" },
  { path: "/dashboard/analysis", icon: BarChart3, label: "Analysis" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
  };

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex h-14 items-center justify-between gap-4 px-4">
        <Link href="/dashboard">
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-lg shadow-purple-500/50 ring-2 ring-purple-400/40"
              animate={{
                boxShadow: [
                  "0 0 12px rgba(99, 102, 241, 0.35)",
                  "0 0 22px rgba(192, 132, 252, 0.6)",
                  "0 0 12px rgba(99, 102, 241, 0.35)",
                ],
                rotate: [0, 2, 0],
                scale: [1, 1.04, 1],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="h-[150%] w-[150%] bg-[conic-gradient(at_top_left,_#f472b6,_#c084fc,_#818cf8,_#22d3ee,_#f472b6)]" />
            </motion.div>
            <span className="hidden text-lg font-semibold font-display sm:block">SoulSync</span>
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center gap-1 mx-6">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative h-9 px-4 py-2 rounded-full hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 group",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                    <span className={cn("text-sm font-medium", isActive && "text-primary")}>{item.label}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-full border border-primary/20 bg-primary/5 -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
