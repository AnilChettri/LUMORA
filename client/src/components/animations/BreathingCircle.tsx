import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";

interface BreathingCircleProps {
  pattern?: "478" | "box" | "relaxing";
  isActive?: boolean;
  onCycleComplete?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const patterns = {
  "478": { inhale: 4, hold: 7, exhale: 8, name: "4-7-8 Breathing" },
  box: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4, name: "Box Breathing" },
  relaxing: { inhale: 4, hold: 2, exhale: 6, name: "Relaxing Breath" },
};

const sizeMap = {
  sm: { container: "w-32 h-32", text: "text-sm" },
  md: { container: "w-48 h-48", text: "text-base" },
  lg: { container: "w-64 h-64", text: "text-lg" },
};

type Phase = "inhale" | "hold" | "exhale" | "holdAfter" | "idle";

export function BreathingCircle({
  pattern = "478",
  isActive = false,
  onCycleComplete,
  className,
  size = "md",
}: BreathingCircleProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(0);
  const patternConfig = patterns[pattern];

  const runPhase = useCallback((currentPhase: Phase, duration: number, nextPhase: Phase) => {
    setPhase(currentPhase);
    setCountdown(duration);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (nextPhase === "idle") {
        onCycleComplete?.();
        if (isActive) {
          runPhase("inhale", patternConfig.inhale, "hold");
        } else {
          setPhase("idle");
        }
      } else if (nextPhase === "hold") {
        runPhase("hold", patternConfig.hold, "exhale");
      } else if (nextPhase === "exhale") {
        runPhase("exhale", patternConfig.exhale, pattern === "box" ? "holdAfter" : "idle");
      } else if (nextPhase === "holdAfter" && pattern === "box") {
        runPhase("holdAfter", (patternConfig as any).holdAfter, "idle");
      }
    }, duration * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, onCycleComplete, pattern, patternConfig]);

  useEffect(() => {
    if (isActive && phase === "idle") {
      const cleanup = runPhase("inhale", patternConfig.inhale, "hold");
      return cleanup;
    }
    if (!isActive) {
      setPhase("idle");
      setCountdown(0);
    }
  }, [isActive]);

  const circleVariants = {
    idle: { scale: 0.6, opacity: 0.5 },
    inhale: { scale: 1, opacity: 1 },
    hold: { scale: 1, opacity: 1 },
    exhale: { scale: 0.6, opacity: 0.7 },
    holdAfter: { scale: 0.6, opacity: 0.7 },
  };

  const getPhaseLabel = (p: Phase) => {
    switch (p) {
      case "inhale": return "Breathe In";
      case "hold": return "Hold";
      case "exhale": return "Breathe Out";
      case "holdAfter": return "Hold";
      case "idle": return "Ready";
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeMap[size].container, className)}>
      {/* Outer ripple rings */}
      {isActive && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-300/30 dark:border-purple-400/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-purple-300/20 dark:border-purple-400/15"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0, 0.2],
            }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}

      {/* Main breathing circle */}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400 via-violet-500 to-indigo-600 shadow-lg"
        variants={circleVariants}
        animate={phase}
        transition={{
          duration: phase === "inhale" ? patternConfig.inhale :
                   phase === "exhale" ? patternConfig.exhale : 0.3,
          ease: "easeInOut",
        }}
      >
        {/* Inner gradient overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/10 to-white/20" />
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: phase === "hold" || phase === "holdAfter"
              ? "0 0 40px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)"
              : "0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.05)",
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <p className={cn("font-semibold drop-shadow-lg", sizeMap[size].text)}>
              {getPhaseLabel(phase)}
            </p>
            {isActive && phase !== "idle" && (
              <motion.p
                className="text-2xl font-bold mt-1 drop-shadow-lg"
                key={countdown}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {countdown}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
