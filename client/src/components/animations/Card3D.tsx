import { motion } from "framer-motion";
import { useState } from "react";

interface Card3DProps {
  front: React.ReactNode;
  back: React.ReactNode;
  title?: string;
}

export function Card3D({ front, back, title }: Card3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={false}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{
        transformStyle: "preserve-3d",
        cursor: "pointer",
      }}
      onClick={() => setIsFlipped(!isFlipped)}
      className="relative w-full h-80 rounded-2xl"
    >
      {/* Front */}
      <motion.div
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        className="absolute w-full h-full"
      >
        <div className="w-full h-full p-6 rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-900/40 via-violet-900/30 to-purple-900/40 backdrop-blur-xl flex flex-col items-center justify-center text-center">
          {front}
          <p className="text-sm text-purple-300/60 mt-4">Click to explore</p>
        </div>
      </motion.div>

      {/* Back */}
      <motion.div
        style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
        className="absolute w-full h-full"
      >
        <div className="w-full h-full p-6 rounded-2xl border border-purple-400/30 bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-violet-900/40 backdrop-blur-xl flex flex-col items-center justify-center text-center">
          {back}
        </div>
      </motion.div>
    </motion.div>
  );
}
