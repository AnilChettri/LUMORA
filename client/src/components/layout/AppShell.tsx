import { motion, AnimatePresence } from "framer-motion";
import { MobileNav } from "./MobileNav";
import { CrisisButton } from "./CrisisButton";
import { NeuralBackground } from "@/components/animations/NeuralBackground";
import { useAuth } from "@/hooks/useAuth";

interface AppShellProps {
  children: React.ReactNode;
  showNav?: boolean;
  showCrisisButton?: boolean;
  showBackground?: boolean;
}

export function AppShell({
  children,
  showNav = true,
  showCrisisButton = true,
  showBackground = true,
}: AppShellProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Immersive Background Layers */}
      {showBackground && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <NeuralBackground intensity="low" animated />
          <div className="absolute inset-0 aurora-bg opacity-30 dark:opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.05),transparent_40%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.05),transparent_40%)]" />
        </div>
      )}

      {/* Main content with refined transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={window.location.pathname}
          className="relative z-10 pb-32 md:pb-8"
          initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1] 
          }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Mobile navigation */}
      {showNav && isAuthenticated && <MobileNav />}

      {/* Crisis help button */}
      {showCrisisButton && isAuthenticated && <CrisisButton />}
    </div>
  );
}
