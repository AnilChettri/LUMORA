import { motion } from "framer-motion";

interface FloatingOrbsProps {
  count?: number;
}

export function FloatingOrbs({ count = 5 }: FloatingOrbsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-${32 + i * 8} h-${32 + i * 8} rounded-full opacity-30 blur-3xl pointer-events-none`}
          style={{
            background: [
              "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(88, 28, 135, 0.3) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(126, 39, 246, 0.35) 0%, transparent 70%)",
            ][i % 5],
            left: `${20 + i * 15}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            y: [0, 100 - i * 15, 0],
            x: [0, 50 + i * 10, 0],
            scale: [1, 1.2 - i * 0.1, 1],
          }}
          transition={{
            duration: 20 + i * 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </>
  );
}
