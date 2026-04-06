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
  Brain
} from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/voice", icon: Mic, label: "Lumi" },
  { path: "/mood", icon: Brain, label: "Mood" },
  { path: "/community", icon: Users, label: "Community" },
];

export function MobileNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <motion.div
                className={cn(
                  "flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-colors touch-target",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                whileTap={{ scale: 0.95 }}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full bg-primary"
                      layoutId="navIndicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
