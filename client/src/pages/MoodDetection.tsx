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
      // Navigation is controlled by the mood intervention plan.
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

      // Start mock scanning animation
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

          // Use real emotion detection from video frame
          if (videoRef.current) {
            detectEmotionFromFrame(videoRef.current).then(({ mood, confidence }) => {
              setDetectedMood(mood);
              setConfidence(confidence);
              setPhase("result");
            });
          } else {
            // Fallback if video not available
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
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleManualMoodSelect = (mood: MoodType) => {
    setDetectedMood(mood);
    setConfidence(100);
    setPhase("result");
  };

  const handleConfirm = () => {
    if (detectedMood) {
      // Trigger the immediate mood → action plan
      runImmediateMoodPlan(detectedMood, setLocation);
      // Persist mood in the background
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
      disposeEmotionModel(); // Cleanup TensorFlow resources
    };
  }, [stopCamera]);

  return (
    <Screen>
      <Header />
      <ScreenBody>
        <div className="max-w-3xl mx-auto w-full">
          <ScreenHeader
            eyebrow="Check-in"
            title="How are you feeling?"
            subtitle="Lumi will guide you into a short practice based on your mood."
          />

          <AnimatePresence mode="wait">
            {/* Consent Phase */}
            {phase === "consent" && (
              <motion.section
                key="consent"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col justify-between flex-1 gap-8"
              >
                <div className="flex flex-col items-center text-center gap-4 mt-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Use your camera for a quick read?</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Lumi can use your facial expressions to guess your mood. No images are stored and you can always choose manually.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-2">
                  <Button
                    className="w-full rounded-2xl py-5 text-base font-semibold"
                    size="lg"
                    onClick={startCamera}
                    data-testid="button-enable-camera"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Use camera for a quick scan
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full rounded-2xl py-4 text-sm text-muted-foreground border border-border/60"
                    size="lg"
                    onClick={() => setPhase("result")}
                    data-testid="button-manual-mood"
                  >
                    <VideoOff className="w-5 h-5 mr-2" />
                    I’ll choose my mood myself
                  </Button>
                </div>
              </motion.section>
            )}

            {/* Scanning Phase */}
            {phase === "scanning" && (
              <motion.section
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col flex-1 gap-4"
              >
                <div className="relative aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Scan line */}
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Corner brackets */}
                    <div className="absolute inset-4">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
                    </div>

                    {/* Brain visualization overlay */}
                    <div className="absolute top-4 right-4">
                      <BrainVisualization mood="neutral" isScanning size="sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Analyzing expressions…</span>
                    <span className="font-mono">{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="h-2" />
                </div>
              </motion.section>
            )}

            {/* Analyzing Phase */}
            {phase === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <BrainVisualization mood="neutral" isScanning size="lg" className="mx-auto mb-6" />
                <h2 className="text-xl font-semibold mb-2">Analyzing Your Mood</h2>
                <p className="text-muted-foreground">
                  Lumi is processing your emotional state...
                </p>
              </motion.div>
            )}

            {/* Result Phase */}
            {phase === "result" && (
              <motion.section
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col flex-1 gap-5"
              >
                {detectedMood ? (
                  <>
                    <div className="flex flex-col gap-5">
                      <div className="text-center">
                        <BrainVisualization mood={detectedMood} size="md" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-1">
                          {moodDetails[detectedMood].label}
                        </h2>
                        <p className="text-muted-foreground">
                          {moodDetails[detectedMood].description}
                        </p>
                        {confidence > 0 && (
                          <Badge variant="secondary" className="mt-2">
                            {confidence}% confidence
                          </Badge>
                        )}
                      </div>

                      {/* Lumi summary: what happens if I tap Confirm? */}
                      <div className="rounded-2xl bg-background/70 border border-border/60 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <LumiCharacter size="sm" mood="calm" animate={false} />
                          <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Lumi's next step
                            </p>
                            {(() => {
                              const preview = getPlanPreviewForMood(detectedMood);
                              return (
                                <>
                                  <p className="text-sm font-medium">
                                    {preview.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {preview.subtitle}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {preview.chips.map((chip) => (
                                      <span
                                        key={chip}
                                        className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground"
                                      >
                                        {chip}
                                      </span>
                                    ))}
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-background/60 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <LumiCharacter size="sm" mood="calm" animate={false} />
                          <p className="text-sm">{moodDetails[detectedMood].suggestion}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-1">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleRetry}
                          data-testid="button-retry-mood"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleConfirm}
                          disabled={saveMoodMutation.isPending}
                          data-testid="button-confirm-mood"
                        >
                          {saveMoodMutation.isPending ? (
                            <LoadingSpinner size="sm" variant="dots" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Confirm
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Recommended activities */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <p className="text-sm font-medium text-muted-foreground px-1">Suggested activities for you</p>
                      <div className="grid gap-3">
                        {getMoodRecommendations(detectedMood).map((rec, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            onClick={() => setLocation(rec.path)}
                            className={cn(
                              "p-4 rounded-lg border text-left transition-all hover:shadow-md",
                              "flex items-center gap-3 group",
                              rec.color
                            )}
                            data-testid={`rec-activity-${rec.label}`}
                          >
                            <div className="text-2xl">{rec.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold group-hover:text-primary transition-colors">{rec.label}</div>
                            </div>
                            <div className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <section className="flex flex-col flex-1 gap-4">
                    <h2 className="text-xl font-semibold text-center">
                      Choose your mood
                    </h2>
                    <p className="text-xs text-muted-foreground text-center mb-1">
                      This helps Lumi pick the right next step.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {allMoods.map((mood) => (
                        <motion.button
                          key={mood}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleManualMoodSelect(mood)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left",
                            moodDetails[mood].color,
                            "hover:shadow-md"
                          )}
                          data-testid={`button-mood-${mood}`}
                        >
                          <div className="font-semibold">{moodDetails[mood].label}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {moodDetails[mood].description}
                          </div>
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
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-green-600" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">All Set!</h2>
                <p className="text-muted-foreground mb-6">
                  Your mood has been recorded. Let's make today count!
                </p>
                <Button onClick={() => setLocation("/")} data-testid="button-go-dashboard">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScreenBody>
    </Screen>
  );
}
