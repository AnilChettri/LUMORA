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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated neural background */}
      {showBackground && (
        <NeuralBackground intensity="low" animated />
      )}

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.main
          className="relative z-10 pb-20 md:pb-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
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
