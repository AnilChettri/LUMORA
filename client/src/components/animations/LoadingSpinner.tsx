import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "neural" | "dots" | "ring";
}

const sizeMap = {
  sm: "w-6 h-6",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

export function LoadingSpinner({
  size = "md",
  className,
  variant = "neural",
}: LoadingSpinnerProps) {
  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-1.5", className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              y: [0, -8, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "ring") {
    return (
      <div className={cn("relative", sizeMap[size], className)}>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  // Neural variant - brain-like loading
  return (
    <div className={cn("relative", sizeMap[size], className)}>
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-purple-300/40 dark:border-purple-400/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner elements */}
      <motion.div
        className="absolute inset-1 rounded-full border border-purple-400/50 dark:border-purple-300/40"
        animate={{ rotate: -360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Center pulse */}
      <motion.div
        className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-500 to-violet-600"
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Orbiting dots */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
          style={{
            top: "50%",
            left: "50%",
          }}
          animate={{
            x: [0, 12, 0, -12, 0],
            y: [-12, 0, 12, 0, -12],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.66,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("rounded-lg bg-muted shimmer", className)}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}
