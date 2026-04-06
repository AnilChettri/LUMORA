import { motion } from "framer-motion";

interface RotatingSphere3DProps {
  size?: "sm" | "md" | "lg";
  colors?: string[];
}

export function RotatingSphere3D({ size = "md", colors }: RotatingSphere3DProps) {
  const sizeMap = {
    sm: 120,
    md: 200,
    lg: 280,
  };

  const dimension = sizeMap[size];

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{
        width: dimension,
        height: dimension,
        perspective: 1200,
      }}
    >
      {/* Outer rotating ring 1 */}
      <motion.div
        className="absolute rounded-full border-2 border-purple-400/40"
        style={{
          width: dimension,
          height: dimension,
        }}
        animate={{ rotateZ: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-purple-400 transform -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Outer rotating ring 2 */}
      <motion.div
        className="absolute rounded-full border-2 border-violet-400/30"
        style={{
          width: dimension * 0.7,
          height: dimension * 0.7,
        }}
        animate={{ rotateZ: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full bg-violet-400 transform -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Outer rotating ring 3 */}
      <motion.div
        className="absolute rounded-full border border-fuchsia-400/20"
        style={{
          width: dimension * 0.4,
          height: dimension * 0.4,
        }}
        animate={{ rotateZ: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-fuchsia-400 transform -translate-x-1/2 -translate-y-1/2" />
      </motion.div>

      {/* Central glowing orb */}
      <motion.div
        className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-violet-500"
        animate={{
          scale: [1, 1.2, 1],
          boxShadow: [
            "0 0 20px rgba(168, 85, 247, 0.6)",
            "0 0 40px rgba(139, 92, 246, 0.8)",
            "0 0 20px rgba(168, 85, 247, 0.6)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pulsing particles around center */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-purple-300"
          animate={{
            x: [0, Math.cos((i * Math.PI) / 2) * 60, 0],
            y: [0, Math.sin((i * Math.PI) / 2) * 60, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}
