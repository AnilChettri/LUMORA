import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LumiCharacterProps {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: "happy" | "calm" | "thinking" | "listening";
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

export function LumiCharacter({ 
  size = "md", 
  mood = "calm",
  className,
  animate = true,
}: LumiCharacterProps) {
  const eyeVariants = {
    calm: { scaleY: 1 },
    happy: { scaleY: 0.7 },
    thinking: { scaleY: 1, x: [0, 2, 0] },
    listening: { scaleY: 1.1 },
  };

  const glowVariants = {
    calm: {
      scale: [1, 1.05, 1],
      opacity: [0.5, 0.7, 0.5],
    },
    happy: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 0.9, 0.6],
    },
    thinking: {
      scale: [1, 1.02, 1],
      opacity: [0.4, 0.6, 0.4],
    },
    listening: {
      scale: [1, 1.15, 1],
      opacity: [0.5, 0.8, 0.5],
    },
  };

  return (
    <div className={cn("relative", sizeMap[size], className)}>
      {/* Outer glow for image */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/40 to-violet-400/40 blur-2xl"
        animate={animate ? { 
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.8, 0.4],
        } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Quantum Shift Image */}
      <motion.div
        className="absolute inset-0 rounded-full overflow-hidden shadow-lg shadow-purple-500/60"
        animate={animate ? { 
          boxShadow: [
            "0 0 20px rgba(168, 85, 247, 0.4)",
            "0 0 40px rgba(168, 85, 247, 0.8)",
            "0 0 20px rgba(168, 85, 247, 0.4)",
          ]
        } : undefined}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <motion.img 
          src="/Quantum Shift.jpg" 
          alt="Lumi"
          className="w-full h-full object-cover"
          animate={animate ? { 
            scale: [1, 1.08, 1],
          } : undefined}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
