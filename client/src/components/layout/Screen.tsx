import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScreenProps {
  children: ReactNode;
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

interface ScreenBodyProps {
  children: ReactNode;
  className?: string;
}

interface ScreenFooterProps {
  children: ReactNode;
  className?: string;
}

export function Screen({ children }: ScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#080112] via-[#140425] to-[#1d073a] text-foreground">
      {children}
    </div>
  );
}

export function ScreenHeader({ title, subtitle, eyebrow }: ScreenHeaderProps) {
  return (
    <div className="text-center mb-4">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-display font-bold mb-1">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{subtitle}</p>
      )}
    </div>
  );
}

export function ScreenBody({ children, className }: ScreenBodyProps) {
  return (
    <motion.main
      className={
        "flex-1 flex flex-col px-4 py-6 w-full mx-auto max-w-7xl " + (className ?? "")
      }
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}

export function ScreenFooter({ children, className }: ScreenFooterProps) {
  return (
    <div
      className={
        "px-4 pb-6 pt-2 max-w-md mx-auto w-full space-y-3 " + (className ?? "")
      }
    >
      {children}
    </div>
  );
}
