import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeuralBackgroundProps {
  className?: string;
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

interface Connection {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  duration: number;
  delay: number;
}

export function NeuralBackground({
  className,
  intensity = "medium",
  animated = true,
}: NeuralBackgroundProps) {
  const particleCounts = { low: 15, medium: 25, high: 40 };
  const connectionCounts = { low: 8, medium: 15, high: 25 };
  
  const particles: Particle[] = useMemo(() => 
    [...Array(particleCounts[intensity])].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
    })), [intensity]);

  const connections: Connection[] = useMemo(() =>
    [...Array(connectionCounts[intensity])].map((_, i) => ({
      id: i,
      x1: Math.random() * 100,
      y1: Math.random() * 100,
      x2: Math.random() * 100,
      y2: Math.random() * 100,
      duration: 4 + Math.random() * 3,
      delay: Math.random() * 3,
    })), [intensity]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-purple-500/5 dark:bg-purple-400/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-400/10 blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full bg-teal-500/3 dark:bg-teal-400/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((conn) => (
          <motion.line
            key={conn.id}
            x1={`${conn.x1}%`}
            y1={`${conn.y1}%`}
            x2={`${conn.x2}%`}
            y2={`${conn.y2}%`}
            stroke="hsl(var(--neural-primary) / 0.1)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={animated ? {
              pathLength: [0, 1, 1, 0],
              opacity: [0, 0.3, 0.3, 0],
            } : { pathLength: 1, opacity: 0.15 }}
            transition={{
              duration: conn.duration,
              delay: conn.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* Floating particles (neurons) */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-neural-primary/30 dark:bg-neural-primary/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={animated ? {
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
            y: [0, -20, 0],
          } : { opacity: 0.3, scale: 1 }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
