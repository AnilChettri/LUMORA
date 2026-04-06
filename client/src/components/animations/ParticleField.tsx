import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface ParticleFieldProps {
  count?: number;
  className?: string;
  color?: "purple" | "blue" | "teal" | "mixed";
}

export function ParticleField({
  count = 30,
  className,
  color = "purple",
}: ParticleFieldProps) {
  const particles = useMemo(() => 
    [...Array(count)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 30,
    })), [count]);

  const getColor = (index: number) => {
    if (color === "mixed") {
      const colors = [
        "bg-purple-400/40",
        "bg-blue-400/40",
        "bg-teal-400/40",
        "bg-violet-400/40",
      ];
      return colors[index % colors.length];
    }
    const colorMap = {
      purple: "bg-purple-400/40",
      blue: "bg-blue-400/40",
      teal: "bg-teal-400/40",
    };
    return colorMap[color];
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={cn("absolute rounded-full", getColor(particle.id))}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, particle.drift, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
