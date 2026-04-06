import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MoodType } from "@shared/schema";

interface BrainVisualizationProps {
  mood?: MoodType;
  isScanning?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-24 h-24",
  md: "w-40 h-40",
  lg: "w-64 h-64",
};

const moodColors: Record<MoodType, { primary: string; secondary: string; glow: string }> = {
  happy: {
    primary: "stroke-yellow-400",
    secondary: "stroke-amber-300",
    glow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
  },
  sad: {
    primary: "stroke-blue-400",
    secondary: "stroke-indigo-300",
    glow: "drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]",
  },
  anxious: {
    primary: "stroke-orange-400",
    secondary: "stroke-amber-400",
    glow: "drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]",
  },
  tired: {
    primary: "stroke-purple-400",
    secondary: "stroke-violet-300",
    glow: "drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]",
  },
  stressed: {
    primary: "stroke-red-400",
    secondary: "stroke-rose-300",
    glow: "drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]",
  },
  neutral: {
    primary: "stroke-teal-400",
    secondary: "stroke-cyan-300",
    glow: "drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]",
  },
};

export function BrainVisualization({
  mood = "neutral",
  isScanning = false,
  className,
  size = "md",
}: BrainVisualizationProps) {
  const colors = moodColors[mood];

  return (
    <div className={cn("relative", sizeMap[size], className)}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, hsl(var(--neural-glow) / 0.3) 0%, transparent 70%)`,
        }}
        animate={isScanning ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        } : undefined}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Brain SVG */}
      <svg
        viewBox="0 0 100 100"
        className={cn("w-full h-full", colors.glow)}
        fill="none"
      >
        {/* Left hemisphere */}
        <motion.path
          d="M50 20 C30 20, 15 35, 15 55 C15 75, 30 85, 45 85 C45 85, 48 75, 50 75"
          className={colors.primary}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Right hemisphere */}
        <motion.path
          d="M50 20 C70 20, 85 35, 85 55 C85 75, 70 85, 55 85 C55 85, 52 75, 50 75"
          className={colors.primary}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />

        {/* Neural connections - left side */}
        <motion.path
          d="M25 45 Q35 40, 40 50 Q45 60, 35 65"
          className={colors.secondary}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        
        <motion.path
          d="M30 55 Q40 50, 45 58 Q50 66, 42 72"
          className={colors.secondary}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        />

        {/* Neural connections - right side */}
        <motion.path
          d="M75 45 Q65 40, 60 50 Q55 60, 65 65"
          className={colors.secondary}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
        
        <motion.path
          d="M70 55 Q60 50, 55 58 Q50 66, 58 72"
          className={colors.secondary}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />

        {/* Brain stem */}
        <motion.path
          d="M50 75 L50 90"
          className={colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />

        {/* Synapse nodes */}
        {[
          { cx: 30, cy: 40 },
          { cx: 25, cy: 55 },
          { cx: 35, cy: 70 },
          { cx: 70, cy: 40 },
          { cx: 75, cy: 55 },
          { cx: 65, cy: 70 },
          { cx: 50, cy: 30 },
          { cx: 45, cy: 55 },
          { cx: 55, cy: 55 },
        ].map((node, i) => (
          <motion.circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r="3"
            className={cn("fill-current", colors.primary.replace("stroke", "text"))}
            initial={{ scale: 0, opacity: 0 }}
            animate={isScanning ? {
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            } : {
              scale: 1,
              opacity: 0.8,
            }}
            transition={{
              duration: 1.5,
              repeat: isScanning ? Infinity : 0,
              delay: i * 0.15,
            }}
          />
        ))}

        {/* Scanning beam effect */}
        {isScanning && (
          <motion.rect
            x="10"
            y="0"
            width="80"
            height="4"
            rx="2"
            fill="url(#scanGradient)"
            initial={{ y: 15 }}
            animate={{ y: 90 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}

        {/* Gradients */}
        <defs>
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="hsl(var(--neural-primary) / 0.6)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Activity indicator */}
      {isScanning && (
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Analyzing...
        </motion.div>
      )}
    </div>
  );
}
