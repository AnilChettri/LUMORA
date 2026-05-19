import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CrisisButton() {
  return (
    <Link href="/dashboard/crisis">
      <motion.div
        className="fixed bottom-20 right-4 z-50 md:bottom-6"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <Button
          variant="destructive"
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg crisis-pulse"
          data-testid="button-crisis-help"
        >
          <Heart className="w-5 h-5" />
        </Button>
        <span className="sr-only">I need help</span>
      </motion.div>
    </Link>
  );
}
