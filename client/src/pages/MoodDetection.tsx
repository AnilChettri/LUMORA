import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Screen, ScreenBody, ScreenHeader } from "@/components/layout/Screen";
import { BrainVisualization } from "@/components/animations/BrainVisualization";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getMoodRecommendations } from "@/lib/aiMocks";
import { detectEmotionFromFrame, disposeEmotionModel } from "@/lib/emotionDetection";
import { runImmediateMoodPlan, getPlanPreviewForMood } from "@/lib/moodInterventions";
import type { MoodType } from "@shared/schema";
import {
  Camera,
  RefreshCw,
  Check,
  X,
  Brain,
  Sparkles,
  Video,
  VideoOff,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DetectionPhase = "consent" | "scanning" | "analyzing" | "result" | "confirmed";

const moodDetails: Record<MoodType, { label: string; description: string; color: string; suggestion: string }> = {
  happy: {
    label: "Happy",
    description: "You're radiating positive energy!",
    color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
    suggestion: "Share your joy in the community or create something in your journal!",
  },
  sad: {
    label: "Sad",
    description: "It's okay to feel this way.",
    color: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
    suggestion: "Would you like to talk to Lumi or try a gentle exercise?",
  },
  anxious: {
    label: "Anxious",
    description: "Your mind seems active right now.",
    color: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
    suggestion: "Let's try some breathing exercises to help you feel calmer.",
  },
  tired: {
    label: "Tired",
    description: "Your energy seems low today.",
    color: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
    suggestion: "How about some relaxing music or a short meditation?",
  },
  stressed: {
    label: "Stressed",
    description: "You might be carrying some tension.",
    color: "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700",
    suggestion: "Let's work through this together with grounding techniques.",
  },
  neutral: {
    label: "Neutral",
    description: "You seem balanced and centered.",
    color: "bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700",
    suggestion: "A great time to explore new content or check in with the community!",
  },
};

const allMoods: MoodType[] = ["happy", "sad", "anxious", "tired", "stressed", "neutral"];

export default function MoodDetection() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<DetectionPhase>("consent");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [detectedMood, setDetectedMood] = useState<MoodType | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  // Check if this is part of onboarding flow
  const isOnboarding = location?.includes("onboarding=true") ?? false;

  const saveMoodMutation = useMutation({
    mutationFn: async (mood: MoodType) => {
      return apiRequest("POST", "/api/mood", {
        mood,
        confidence,
        source: cameraEnabled ? "camera" : "manual"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood/current"] });
      toast({
        title: "Mood saved!",
        description: "Your mood has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Couldn't save mood",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraEnabled(true);
      setPhase("scanning");
      runMockScan();
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "You can still set your mood manually below.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraEnabled(false);
  }, []);

  const runMockScan = useCallback(() => {
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase("analyzing");

          if (videoRef.current) {
            detectEmotionFromFrame(videoRef.current).then(({ mood, confidence }) => {
              setDetectedMood(mood);
              setConfidence(confidence);
              setPhase("result");
            });
          } else {
            setTimeout(() => {
              const moods: MoodType[] = ["happy", "neutral", "anxious", "tired", "stressed"];
              const randomMood = moods[Math.floor(Math.random() * moods.length)];
              const randomConfidence = 70 + Math.floor(Math.random() * 25);
              setDetectedMood(randomMood);
              setConfidence(randomConfidence);
              setPhase("result");
            }, 1500);
          }
          return 100;
        }
        return prev + 0.5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleManualMoodSelect = (mood: MoodType) => {
    setDetectedMood(mood);
    setConfidence(100);
    setPhase("result");
  };

  const handleConfirm = () => {
    if (detectedMood) {
      runImmediateMoodPlan(detectedMood, setLocation);
      saveMoodMutation.mutate(detectedMood);
    }
  };

  const handleRetry = () => {
    setPhase("scanning");
    setScanProgress(0);
    runMockScan();
  };

  useEffect(() => {
    return () => {
      stopCamera();
      disposeEmotionModel();
    };
  }, [stopCamera]);

  return (
    <Screen>
      <Header />
      <ScreenBody>
        <motion.div 
          className="max-w-4xl mx-auto w-full px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-4"
            >
              <Brain className="w-4 h-4" />
              Emotional Intelligence
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
              How's your <span className="gradient-text">spirit</span> today?
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Lumi uses neural analysis to understand your mood and tailor your experience.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Consent Phase */}
            {phase === "consent" && (
              <motion.section
                key="consent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                className="grid md:grid-cols-2 gap-8 items-stretch"
              >
                <div className="super-glass rounded-[3rem] p-10 flex flex-col items-center text-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center neural-pulse">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-display">Neural Scan</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Lumi analyzes facial micro-expressions for a precise emotional read.
                    </p>
                  </div>
                  <Button
                    className="w-full h-14 rounded-2xl text-lg font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all mt-auto"
                    onClick={startCamera}
                    data-testid="button-enable-camera"
                  >
                    <Video className="w-6 h-6 mr-3" />
                    Start Scan
                  </Button>
                </div>

                <div className="super-glass rounded-[3rem] p-10 flex flex-col items-center text-center gap-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-display">Manual Check-in</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Prefer to tell Lumi yourself? Select your current state manually.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl text-lg font-bold border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all mt-auto"
                    onClick={() => setPhase("result")}
                    data-testid="button-manual-mood"
                  >
                    Choose Manually
                  </Button>
                </div>
              </motion.section>
            )}

            {/* Scanning Phase */}
            {phase === "scanning" && (
              <motion.section
                key="scanning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto w-full"
              >
                <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover grayscale opacity-60"
                  />

                  {/* Simplified scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-primary/5" />
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-scan" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-64 h-64 border border-primary/20 rounded-full animate-pulse" />
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-card px-4 py-1.5 rounded-full border-primary/20">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Neural Analysis Active</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span className="text-primary uppercase tracking-tighter">Scanning...</span>
                    <span className="font-mono">{scanProgress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-primary/10 overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]"
                      initial={{ width: 0 }}
                      animate={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              </motion.section>
            )}

            {/* Result Phase */}
            {phase === "result" && (
              <motion.section
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {detectedMood ? (
                  <div className="grid lg:grid-cols-12 gap-8">
                    {/* Mood Profile - 5 cols */}
                    <div className="lg:col-span-5">
                      <div className="super-glass rounded-[3rem] p-10 h-full flex flex-col items-center text-center gap-6 overflow-hidden relative group">
                        <div className={cn("absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity", moodDetails[detectedMood].color)} />
                        
                        <div className="relative z-10 space-y-6">
                          <BrainVisualization mood={detectedMood} size="lg" className="mx-auto" />
                          <div className="space-y-2">
                            <h2 className="text-5xl font-display font-bold tracking-tighter">
                              {moodDetails[detectedMood].label}
                            </h2>
                            <p className="text-xl text-muted-foreground">
                              {moodDetails[detectedMood].description}
                            </p>
                            {confidence > 0 && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                <Zap className="w-3 h-3" />
                                {confidence}% Accurate
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="relative z-10 w-full mt-auto pt-8 border-t border-primary/5 flex gap-4">
                          <Button
                            variant="ghost"
                            className="flex-1 h-12 rounded-xl font-bold opacity-60 hover:opacity-100"
                            onClick={handleRetry}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                          </Button>
                          <Button
                            className="flex-1 h-12 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20"
                            onClick={handleConfirm}
                            disabled={saveMoodMutation.isPending}
                          >
                            Confirm
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Next Steps - 7 cols */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="super-glass rounded-[2.5rem] p-8 space-y-6 border-white/30">
                        <div className="flex items-center gap-4">
                          <LumiCharacter size="sm" mood="listening" />
                          <div>
                            <h3 className="font-bold text-lg font-display">Lumi's Plan</h3>
                            <p className="text-sm text-muted-foreground">Designed for your current state</p>
                          </div>
                        </div>

                        {(() => {
                          const preview = getPlanPreviewForMood(detectedMood);
                          return (
                            <div className="space-y-4">
                              <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
                                <h4 className="text-2xl font-bold font-display mb-2">{preview.title}</h4>
                                <p className="text-muted-foreground leading-relaxed">{preview.subtitle}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {preview.chips.map((chip) => (
                                    <span key={chip} className="px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md text-xs font-bold border border-white/20">
                                      {chip}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {getMoodRecommendations(detectedMood).slice(0, 2).map((rec, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ y: -5, scale: 1.02 }}
                            onClick={() => setLocation(rec.path)}
                            className={cn(
                              "p-6 rounded-[2rem] border-2 text-left transition-all group super-glass border-white/10 hover:border-primary/30",
                              rec.color
                            )}
                          >
                            <div className="text-3xl mb-4 group-hover:scale-125 transition-transform duration-500">{rec.icon}</div>
                            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{rec.label}</h4>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <section className="super-glass rounded-[3rem] p-10 max-w-3xl mx-auto w-full">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {allMoods.map((mood) => (
                        <motion.button
                          key={mood}
                          whileHover={{ y: -5, scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleManualMoodSelect(mood)}
                          className={cn(
                            "aspect-square p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center justify-center text-center gap-3",
                            moodDetails[mood].color,
                            "hover:shadow-2xl hover:border-primary/40 shadow-lg border-white/10"
                          )}
                          data-testid={`button-mood-${mood}`}
                        >
                          <BrainVisualization mood={mood} size="sm" />
                          <div className="font-bold text-lg tracking-tight leading-tight">{moodDetails[mood].label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </section>
                )}
              </motion.section>
            )}

            {/* Confirmed Phase */}
            {phase === "confirmed" && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="super-glass rounded-[3rem] p-20 text-center max-w-2xl mx-auto"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/10 flex items-center justify-center"
                >
                  <Check className="w-12 h-12 text-green-500" />
                </motion.div>
                <h2 className="text-4xl font-bold font-display mb-4">All Set!</h2>
                <p className="text-xl text-muted-foreground mb-10">
                  Lumi is now tuned to your rhythm.
                </p>
                <Button 
                  size="lg"
                  onClick={() => setLocation("/")}
                  className="h-14 px-10 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-5 h-5 mr-3" />
                  Enter Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </ScreenBody>
    </Screen>
  );
}
