import { motion } from "framer-motion";

interface MorphingShapeProps {
  size?: number;
  duration?: number;
}

export function MorphingShape({ size = 300, duration = 8 }: MorphingShapeProps) {
  const paths = [
    "M150,50 Q250,50 280,100 Q300,150 280,200 Q250,250 150,250 Q50,250 20,200 Q0,150 20,100 Q50,50 150,50 Z",
    "M150,30 Q280,50 300,150 Q280,250 150,270 Q20,250 0,150 Q20,50 150,30 Z",
    "M150,50 Q290,80 290,150 Q290,220 150,250 Q10,220 10,150 Q10,80 150,50 Z",
    "M150,40 Q280,40 300,120 Q300,180 150,280 Q0,180 0,120 Q20,40 150,40 Z",
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      className="drop-shadow-2xl"
      style={{
        filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.4))",
      }}
    >
      <defs>
        <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.6)" />
          <stop offset="50%" stopColor="rgba(139, 92, 246, 0.5)" />
          <stop offset="100%" stopColor="rgba(88, 28, 135, 0.6)" />
        </linearGradient>
      </defs>

      <motion.path
        d={paths[0]}
        fill="url(#morphGradient)"
        animate={{
          d: paths,
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}
