import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Music, 
  BookOpen, 
  Heart, 
  Gamepad2, 
  Users, 
  Mic, 
  PenLine,
  Brain,
  BarChart3
} from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/voice", icon: Mic, label: "Lumi" },
  { path: "/analysis", icon: BarChart3, label: "Analysis" },
  { path: "/community", icon: Users, label: "Community" },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md md:hidden">
      <div className="super-glass rounded-[2rem] px-4 py-2 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <motion.div
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 py-2 rounded-2xl transition-all duration-300 touch-target",
                  isActive ? "text-primary scale-110" : "text-muted-foreground/70 hover:text-muted-foreground"
                )}
                whileTap={{ scale: 0.9 }}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navBackground"
                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10">
                  <Icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-primary"
                      layoutId="navIndicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-bold mt-1 z-10">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
