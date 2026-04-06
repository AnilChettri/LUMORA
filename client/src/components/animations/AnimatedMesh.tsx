import { motion } from "framer-motion";

interface AnimatedMeshProps {
  intensity?: "low" | "medium" | "high";
}

export function AnimatedMesh({ intensity = "medium" }: AnimatedMeshProps) {
  const gridSize = intensity === "low" ? 40 : intensity === "medium" ? 30 : 20;
  const columns = Math.ceil(1920 / gridSize);
  const rows = Math.ceil(1080 / gridSize);

  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      style={{
        background: "transparent",
      }}
    >
      <defs>
        <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
          <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
          <stop offset="100%" stopColor="rgba(88, 28, 135, 0.3)" />
        </linearGradient>
      </defs>

      <g stroke="url(#meshGradient)" strokeWidth="1" fill="none">
        {/* Vertical lines */}
        {Array.from({ length: columns }).map((_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={i * gridSize}
            y1="0"
            x2={i * gridSize}
            y2="100%"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 0.5,
            }}
          />
        ))}

        {/* Horizontal lines */}
        {Array.from({ length: rows }).map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={i * gridSize}
            x2="100%"
            y2={i * gridSize}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 0.5,
            }}
          />
        ))}
      </g>
    </svg>
  );
}
