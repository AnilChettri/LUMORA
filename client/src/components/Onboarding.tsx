import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { ChevronRight, X } from "lucide-react";

type OnboardingStep = "greeting" | "mood-prompt" | "camera" | "complete";

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>("greeting");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const stepMessages = {
    greeting: {
      title: "Welcome to Lumi! 💜",
      message: "I'm your AI mental health companion here to support your wellness journey with personalized guidance, exercises, and a caring community.",
      subtitle: "Let's create something beautiful together",
      icon: "happy",
    },
    "mood-prompt": {
      title: "Let's Understand You",
      message: "By checking in with your current mood, I can offer personalized recommendations that match exactly how you're feeling right now.",
      subtitle: "This takes just 30 seconds",
      icon: "calm",
    },
  };

  const currentStep = stepMessages[step as keyof typeof stepMessages];

  const handleNext = async () => {
    if (step === "greeting") {
      setStep("mood-prompt");
    } else if (step === "mood-prompt") {
      setStep("camera");
    }
  };

  const handleSkip = () => {
    setStep("complete");
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleMoodDetectionStart = () => {
    setIsLoading(true);
    // Navigate to mood detection page
    setTimeout(() => {
      setLocation("/mood?onboarding=true");
      onComplete();
    }, 500);
  };

  const handleClose = () => {
    setStep("complete");
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <AnimatePresence mode="wait">
      {step !== "complete" && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <motion.div
            className="relative w-full max-w-2xl mx-auto px-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Main card */}
            <div className="bg-gradient-to-br from-purple-900/95 via-violet-900/95 to-purple-900/95 backdrop-blur-xl rounded-3xl border border-purple-500/40 shadow-2xl overflow-hidden">
              <div className="p-12">
                <div className="flex flex-col items-center text-center gap-8">
                  {/* Floating Lumi Agent */}
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/50 to-violet-400/50 blur-xl"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* Lumi character */}
                    <div className="relative z-10 w-40 h-40">
                      <LumiCharacter
                        size="lg"
                        mood={step === "greeting" ? "happy" : "calm"}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Floating particles around Lumi */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-violet-400"
                        animate={{
                          x: Math.cos((i * Math.PI) / 3) * 60,
                          y: Math.sin((i * Math.PI) / 3) * 60,
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>

                  {/* Content */}
                  <div className="space-y-4">
                    <motion.h2
                      key={`${step}-title`}
                      className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      {currentStep?.title}
                    </motion.h2>

                    <motion.p
                      key={`${step}-message`}
                      className="text-lg text-purple-100/80 max-w-lg mx-auto leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      {currentStep?.message}
                    </motion.p>

                    <motion.p
                      key={`${step}-subtitle`}
                      className="text-sm text-purple-200/60 italic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {currentStep?.subtitle}
                    </motion.p>
                  </div>

                  {/* Action buttons */}
                  <motion.div
                    className="flex flex-col sm:flex-row gap-4 w-full pt-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {step === "greeting" && (
                      <>
                        <Button
                          onClick={handleNext}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg py-6 text-base font-semibold"
                        >
                          Let's Begin
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                          onClick={handleSkip}
                          variant="outline"
                          className="flex-1 border-purple-500/40 text-purple-100 hover:bg-purple-500/10 rounded-lg py-6"
                        >
                          Skip for Now
                        </Button>
                      </>
                    )}

                    {step === "mood-prompt" && (
                      <>
                        <Button
                          onClick={handleMoodDetectionStart}
                          disabled={isLoading}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg py-6 text-base font-semibold"
                        >
                          {isLoading ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-2" />
                              Starting...
                            </>
                          ) : (
                            <>
                              Open Camera
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleSkip}
                          variant="outline"
                          className="flex-1 border-purple-500/40 text-purple-100 hover:bg-purple-500/10 rounded-lg py-6"
                        >
                          Skip Step
                        </Button>
                      </>
                    )}

                    {step === "camera" && (
                      <Button
                        onClick={handleMoodDetectionStart}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg py-6 text-base font-semibold"
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Loading...
                          </>
                        ) : (
                          "Proceed to Mood Detection"
                        )}
                      </Button>
                    )}
                  </motion.div>

                  {/* Progress indicator */}
                  <div className="flex gap-2 pt-4">
                    {["greeting", "mood-prompt"].map((s) => (
                      <motion.div
                        key={s}
                        className={`h-1 rounded-full transition-all ${
                          step === s || (step === "camera" && s === "mood-prompt")
                            ? "bg-gradient-to-r from-purple-400 to-violet-400 w-8"
                            : "bg-purple-500/30 w-2"
                        }`}
                        layoutId={`progress-${s}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
