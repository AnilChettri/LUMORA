import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WaveformVisualizerProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
  variant?: "default" | "minimal" | "circular";
}

export function WaveformVisualizer({
  isActive = false,
  barCount = 12,
  className,
  variant = "default",
}: WaveformVisualizerProps) {
  const bars = [...Array(barCount)];

  if (variant === "circular") {
    return (
      <div className={cn("relative w-20 h-20", className)}>
        {bars.map((_, i) => {
          const angle = (i / barCount) * 360;
          const delay = i * 0.08;
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 bottom-1/2 w-1 origin-bottom bg-gradient-to-t from-purple-500 to-violet-400 rounded-full"
              style={{
                transform: `rotate(${angle}deg) translateX(-50%)`,
                height: "40%",
              }}
              animate={isActive ? {
                scaleY: [0.3, 0.5 + Math.random() * 0.5, 0.3],
              } : { scaleY: 0.3 }}
              transition={{
                duration: 0.5 + Math.random() * 0.3,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
              }}
            />
          );
        })}
        <div className="absolute inset-4 rounded-full bg-background" />
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center gap-0.5", className)}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="w-0.5 bg-purple-500 rounded-full"
            animate={isActive ? {
              height: [4, 12 + Math.random() * 8, 4],
            } : { height: 4 }}
            transition={{
              duration: 0.4 + Math.random() * 0.2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-end justify-center gap-1 h-16", className)}>
      {bars.map((_, i) => {
        const baseHeight = 20 + Math.sin(i * 0.5) * 15;
        const delay = i * 0.05;
        
        return (
          <motion.div
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-purple-600 via-violet-500 to-indigo-400"
            animate={isActive ? {
              height: [baseHeight, baseHeight + 20 + Math.random() * 20, baseHeight],
              opacity: [0.6, 1, 0.6],
            } : { height: 8, opacity: 0.4 }}
            transition={{
              duration: 0.3 + Math.random() * 0.4,
              repeat: Infinity,
              delay,
              ease: "easeInOut",
            }}
            style={{ height: isActive ? undefined : 8 }}
          />
        );
      })}
    </div>
  );
}
