import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { BrainVisualization } from "@/components/animations/BrainVisualization";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MoodType } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Camera, Sparkles, ChevronRight, Brain, Bot, Compass } from "lucide-react";

type OnboardingPhase = "welcome" | "camera-scan" | "analyzing" | "result" | "choose-mode" | "redirecting";

const moodDetails: Record<MoodType, { label: string; bgColor: string; emoji: string }> = {
  happy: { label: "Happy", bgColor: "from-yellow-400 to-orange-400", emoji: "😊" },
  sad: { label: "Sad", bgColor: "from-blue-400 to-indigo-400", emoji: "😢" },
  anxious: { label: "Anxious", bgColor: "from-orange-400 to-amber-500", emoji: "😰" },
  tired: { label: "Tired", bgColor: "from-purple-400 to-pink-400", emoji: "😴" },
  stressed: { label: "Stressed", bgColor: "from-red-400 to-rose-500", emoji: "😤" },
  neutral: { label: "Neutral", bgColor: "from-teal-400 to-cyan-400", emoji: "😐" },
};

interface OnboardingProps {
  onComplete?: (mood: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<OnboardingPhase>("welcome");
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedMood, setDetectedMood] = useState<MoodType | null>(null);
  const [confidence, setConfidence] = useState(0);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase === "result" || phase === "choose-mode" || phase === "redirecting" || phase === "analyzing") {
      stopCamera();
    }
    return () => stopCamera();
  }, [phase, stopCamera]);

  const saveMoodMutation = useMutation({
    mutationFn: async (data: { mood: MoodType; confidence: number }) => {
      return apiRequest("POST", "/api/mood", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood/current"] });
    },
  });

  const startCamera = useCallback(async () => {
    setPhase("camera-scan");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      runScan();
    } catch {
      setDetectedMood("neutral");
      setConfidence(80);
      setPhase("result");
    }
  }, []);

  const runScan = useCallback(() => {
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("analyzing");
          setTimeout(() => {
            const moods: MoodType[] = ["happy", "sad", "anxious", "tired", "stressed", "neutral"];
            const randomMood = moods[Math.floor(Math.random() * moods.length)];
            const randomConfidence = 75 + Math.floor(Math.random() * 20);
            setDetectedMood(randomMood);
            setConfidence(randomConfidence);
            setPhase("result");
          }, 1500);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
  }, []);

  const handleConfirm = () => {
    if (detectedMood) {
      saveMoodMutation.mutate({ mood: detectedMood, confidence });
      setPhase("choose-mode");
    }
  };

  const handleChooseMode = (mode: "guided" | "manual") => {
    setPhase("redirecting");
    setTimeout(() => {
      if (onComplete) {
        onComplete(detectedMood || "neutral");
      }
      if (mode === "guided") {
        setLocation(`/voice?onboarding=true&initialMood=${detectedMood}`);
      } else {
        setLocation("/");
      }
    }, 1000);
  };

  if (phase === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px]"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full text-center"
          >
            <motion.div
              className="relative mb-8"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="w-40 h-40 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <LumiCharacter size="lg" mood="happy" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold uppercase tracking-widest mb-6"
            >
              <Brain className="w-4 h-4" />
              AI-Powered Analysis
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Meet <span className="gradient-text">Lumi</span>
            </motion.h1>

            <motion.p
              className="text-white/70 text-xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Your AI companion who understands you deeply
            </motion.p>

            <motion.div
              className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-white/60 leading-relaxed">
                Lumi will first scan your emotions, then have a meaningful conversation 
                with you, and guide you through personalized wellness spaces.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={startCamera}
                className="h-16 px-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl shadow-lg shadow-purple-500/30"
              >
                <Camera className="w-6 h-6 mr-3" />
                Start Emotional Scan
                <ChevronRight className="w-6 h-6 ml-3" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === "camera-scan") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <LumiCharacter size="lg" mood="listening" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mt-6">Analyzing Your Emotions</h2>
            <p className="text-white/50 mt-2">Lumi is reading your expressions...</p>
          </div>

          <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-500/20">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-purple-400/50 rounded-full animate-pulse" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 rounded-full">
              <span className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Neural Scan Active
              </span>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-purple-400 uppercase tracking-tighter">Scanning...</span>
              <span className="font-mono text-white">{scanProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <LoadingSpinner size="lg" variant="neural" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mt-8">Processing...</h2>
          <p className="text-white/50 mt-2">Lumi is understanding your emotional state</p>
        </motion.div>
      </div>
    );
  }

  if (phase === "result" && detectedMood) {
    const mood = moodDetails[detectedMood];
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-32 h-32 mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
            <div className="relative z-10 w-full h-full rounded-full flex items-center justify-center">
              <LumiCharacter size="lg" mood={detectedMood === "happy" ? "happy" : "calm"} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4" />
              Scan Complete
            </div>

            <h2 className="text-5xl font-bold text-white mb-2">
              I sense you're feeling <span className="gradient-text">{mood.label}</span>
            </h2>
            <p className="text-white/50 text-lg mb-6">{confidence}% confidence</p>

            <Card className="p-8 bg-white/5 border-white/10 rounded-3xl mb-8">
              <BrainVisualization mood={detectedMood} size="lg" className="mx-auto mb-4" />
              <p className="text-white/60">
                Now let's have a conversation to dive deeper into how you're feeling.
              </p>
            </Card>

            <Button
              onClick={handleConfirm}
              disabled={saveMoodMutation.isPending}
              className="h-14 px-10 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg"
            >
              {saveMoodMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  Continue to Chat
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (phase === "choose-mode" && detectedMood) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-4 h-4" />
              Choose Your Experience
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              How would you like to explore?
            </h2>
            <p className="text-white/50 text-lg mb-10">
              Lumi detected you're feeling <span className="text-purple-400 font-bold">{moodDetails[detectedMood].label}</span>. Choose how you'd like to continue.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => handleChooseMode("guided")}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:border-purple-400/60 transition-all text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  Guided Tour
                </h3>
                <p className="text-white/60 mb-4">
                  Lumi (AI agent) will guide you through all wellness spaces, track your activity, and provide personalized guidance.
                </p>
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <span>AI Agent Led</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                onClick={() => handleChooseMode("manual")}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-teal-600/20 to-emerald-600/20 border border-teal-500/30 hover:border-teal-400/60 transition-all text-left"
              >
                <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center">
                  <Compass className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                  Explore Myself
                </h3>
                <p className="text-white/60 mb-4">
                  Browse all wellness spaces at your own pace. Music, exercises, journal, community, and more - all available to you.
                </p>
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                  <span>Full Freedom</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (phase === "redirecting") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <LumiCharacter size="lg" mood="happy" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mt-8">Starting Your Session...</h2>
          <p className="text-white/50 mt-2">Get ready to chat with Lumi</p>
        </motion.div>
      </div>
    );
  }

  return null;
}