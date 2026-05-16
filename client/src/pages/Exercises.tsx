import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { BreathingCircle } from "@/components/animations/BreathingCircle";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreSessionGuide, getSessionGuide } from "@/components/PreSessionGuide";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/soundManager";
import { useExerciseGuidance } from "@/hooks/useExerciseGuidance";
import {
  Wind,
  Brain,
  Moon,
  Sun,
  Sparkles,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Check,
  ChevronRight,
  Timer,
} from "lucide-react";

const exerciseCategories = [
  { id: "breathing", icon: Wind, label: "Breathing" },
  { id: "grounding", icon: Brain, label: "Grounding" },
  { id: "meditation", icon: Sparkles, label: "Meditation" },
  { id: "sleep", icon: Moon, label: "Sleep" },
];

const exercises = [
  {
    id: "478-breathing",
    title: "4-7-8 Breathing",
    description: "A calming technique to reduce anxiety and help you relax",
    category: "breathing",
    duration: 180,
    pattern: "478" as const,
    steps: [
      "Find a comfortable position",
      "Breathe in through your nose for 4 seconds",
      "Hold your breath for 7 seconds",
      "Exhale completely through your mouth for 8 seconds",
      "Repeat 4 cycles",
    ],
    benefits: ["Reduces anxiety", "Helps with sleep", "Calms nervous system"],
    icon: "🌬️",
  },
  {
    id: "box-breathing",
    title: "Box Breathing",
    description: "A simple technique used by Navy SEALs to stay calm",
    category: "breathing",
    duration: 240,
    pattern: "box" as const,
    steps: [
      "Sit upright in a comfortable position",
      "Breathe in for 4 seconds",
      "Hold for 4 seconds",
      "Breathe out for 4 seconds",
      "Hold for 4 seconds",
      "Repeat 4-6 cycles",
    ],
    benefits: ["Improves focus", "Reduces stress", "Enhances performance"],
    icon: "📦",
  },
  {
    id: "relaxing-breath",
    title: "Relaxing Breath",
    description: "A gentle breathing exercise for stress relief",
    category: "breathing",
    duration: 120,
    pattern: "relaxing" as const,
    steps: [
      "Close your eyes",
      "Breathe in slowly for 4 seconds",
      "Hold briefly for 2 seconds",
      "Exhale slowly for 6 seconds",
      "Feel the tension leaving your body",
    ],
    benefits: ["Releases tension", "Promotes relaxation", "Quick stress relief"],
    icon: "😌",
  },
  {
    id: "54321-grounding",
    title: "5-4-3-2-1 Grounding",
    description: "Use your senses to ground yourself in the present moment",
    category: "grounding",
    duration: 300,
    steps: [
      "Name 5 things you can SEE",
      "Name 4 things you can TOUCH",
      "Name 3 things you can HEAR",
      "Name 2 things you can SMELL",
      "Name 1 thing you can TASTE",
    ],
    benefits: ["Reduces anxiety", "Brings present awareness", "Eases panic"],
    icon: "🧘",
  },
  {
    id: "body-scan",
    title: "Body Scan",
    description: "A mindfulness practice to release physical tension",
    category: "meditation",
    duration: 600,
    steps: [
      "Lie down or sit comfortably",
      "Focus on your feet and toes",
      "Slowly move attention up through your legs",
      "Notice any tension in your hips and stomach",
      "Relax your chest, shoulders, and arms",
      "Release tension in your neck and face",
      "Feel your whole body relaxed",
    ],
    benefits: ["Releases tension", "Improves body awareness", "Promotes deep relaxation"],
    icon: "✨",
  },
  {
    id: "sleep-prep",
    title: "Sleep Preparation",
    description: "Wind down and prepare your mind for restful sleep",
    category: "sleep",
    duration: 480,
    steps: [
      "Dim the lights in your room",
      "Take 5 slow, deep breaths",
      "Relax your facial muscles",
      "Let your shoulders drop",
      "Visualize a peaceful place",
      "Focus on slow, steady breathing",
      "Let go of the day's worries",
    ],
    benefits: ["Better sleep quality", "Calms the mind", "Natural relaxation"],
    icon: "🌙",
  },
  {
    id: "breathing-meditation",
    title: "Breathing Meditation",
    description: "Simple breath awareness for inner peace",
    category: "meditation",
    duration: 300,
    steps: [
      "Find a comfortable seated position",
      "Close your eyes naturally",
      "Simply notice your breath",
      "Don't control, just observe",
      "When mind wanders, gently return to breath",
      "Continue for several minutes",
    ],
    benefits: ["Improves focus", "Reduces overthinking", "Creates inner calm"],
    icon: "🕉️",
  },
  {
    id: "tension-release",
    title: "Tension Release",
    description: "Progressive muscle relaxation for stress relief",
    category: "meditation",
    duration: 420,
    steps: [
      "Start with your toes, curl them tight",
      "Release and notice the sensation",
      "Move to your calves, tense then release",
      "Continue up through your thighs",
      "Squeeze your belly, then relax",
      "Clench your fists, then open wide",
      "Lift shoulders to ears, drop heavily",
      "Notice your whole body feeling light",
    ],
    benefits: ["Deep relaxation", "Stress relief", "Better sleep"],
    icon: "💆",
  },
  {
    id: "morning-energy",
    title: "Morning Energy",
    description: "Energizing breath to start your day right",
    category: "breathing",
    duration: 180,
    pattern: "478" as const,
    steps: [
      "Stand tall with feet hip-width apart",
      "Take 3 deep breaths awakening your body",
      "4-7-8: Inhale 4, hold 7, exhale 8",
      "Repeat 3-4 cycles",
      "Notice the energy building inside",
      "Set an intention for your day",
    ],
    benefits: ["Boosts energy", "Improves focus", "Sets positive tone"],
    icon: "☀️",
  },
];

export default function Exercises() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const initialType = urlParams.get("type") || "breathing";

  const [activeCategory, setActiveCategory] = useState(initialType);
  const [selectedExercise, setSelectedExercise] = useState<typeof exercises[0] | null>(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [showPreGuide, setShowPreGuide] = useState(false);
  const [pendingExercise, setPendingExercise] = useState<typeof exercises[0] | null>(null);

  const filteredExercises = exercises.filter(e => e.category === activeCategory);

  useExerciseGuidance({
    exerciseId: selectedExercise?.id || "",
    exerciseTitle: selectedExercise?.title || "",
    steps: selectedExercise?.steps || [],
    pattern: selectedExercise?.pattern || null,
    isActive: isExerciseActive,
    currentStep,
    cyclesCompleted,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const exerciseId = params.get("exerciseId");
    const autoStart = params.get("autoStart") === "true";

    if (!exerciseId) return;

    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    setSelectedExercise(exercise);
    setCurrentStep(0);
    setCyclesCompleted(0);

    if (autoStart && exercise.pattern) {
      setIsExerciseActive(true);
    }
  }, [location]);

  const handleStartExercise = (exercise: typeof exercises[0]) => {
    soundManager.playClick();
    setPendingExercise(exercise);
    setShowPreGuide(true);
  };

  const handleGuideStart = () => {
    if (pendingExercise) {
      setSelectedExercise(pendingExercise);
      setCurrentStep(0);
      setCyclesCompleted(0);
      setIsExerciseActive(false);
      setShowPreGuide(false);
    }
  };

  const handleGuideSkip = () => {
    if (pendingExercise) {
      setSelectedExercise(pendingExercise);
      setCurrentStep(0);
      setCyclesCompleted(0);
      setShowPreGuide(false);
    }
  };

  const handleBeginExercise = () => {
    soundManager.playClick();
    setIsExerciseActive(true);
  };

  const handlePauseExercise = () => {
    soundManager.playClick();
    setIsExerciseActive(false);
  };

  const handleResetExercise = () => {
    soundManager.playClick();
    setIsExerciseActive(false);
    setCurrentStep(0);
    setCyclesCompleted(0);
  };

  const handleCompleteExercise = () => {
    soundManager.playSuccess();
    try {
      localStorage.removeItem("soulsync_session_state");
    } catch {}
    setSelectedExercise(null);
    setIsExerciseActive(false);
    setCurrentStep(0);
    setCyclesCompleted(0);
  };

  const handleCycleComplete = () => {
    soundManager.playSuccess();
    setCyclesCompleted(prev => prev + 1);
    if (cyclesCompleted >= 3) {
      setIsExerciseActive(false);
    }
  };

  const handleNextStep = () => {
    soundManager.playClick();
    setCurrentStep(prev => prev + 1);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Pre-Session Guide */}
      {showPreGuide && pendingExercise && (
        <PreSessionGuide
          sessionId={pendingExercise.id}
          onStart={handleGuideStart}
          onSkip={handleGuideSkip}
        />
      )}

      <Header />

      <div className="container px-4 py-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedExercise ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              {/* Refined Header */}
              <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                    <Sparkles className="w-4 h-4" />
                    Wellness Center
                  </div>
                  <h1 className="text-5xl font-display font-bold tracking-tight">
                    Mindful <span className="gradient-text">Exercises</span>
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-xl">
                    Tailored guidance to help you navigate your inner world and find your center.
                  </p>
                </div>

                {/* Category Filter - Premium Tabs */}
                <div className="w-full md:w-auto">
                  <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                    <TabsList className="bg-primary/5 p-1.5 rounded-2xl border border-primary/10 h-16">
                      {exerciseCategories.map((cat) => (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          className="rounded-xl px-6 font-bold flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white h-full"
                          data-testid={`tab-${cat.id}`}
                        >
                          <cat.icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {/* Exercise Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredExercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <Card
                      className="p-8 h-full flex flex-col glass-card border-white/20 hover:border-primary/40 cursor-pointer transition-all duration-500 rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden"
                      onClick={() => handleStartExercise(exercise)}
                      data-testid={`card-exercise-${exercise.id}`}
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                         <span className="text-8xl">{exercise.icon || '🌟'}</span>
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                          {exercise.icon || '🌟'}
                        </div>
                        <div>
                          <h3 className="text-xl font-display font-bold leading-tight group-hover:text-primary transition-colors">
                            {exercise.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                             <Badge className="bg-primary/5 text-primary border-none text-[10px] uppercase font-bold tracking-widest px-2 py-0.5">
                                {exercise.category}
                             </Badge>
                             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <Timer className="w-3 h-3" />
                                {Math.floor(exercise.duration / 60)}m
                             </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                        {exercise.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-8">
                        {exercise.benefits && exercise.benefits.map((benefit, i) => (
                          <span key={i} className="text-[10px] font-bold text-muted-foreground/60 border border-primary/10 rounded-full px-3 py-1 bg-white/5 uppercase tracking-tighter">
                            {benefit}
                          </span>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-primary/5 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                          <Play className="w-4 h-4 fill-current" />
                          <span>Start Session</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-[1.5] space-y-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCompleteExercise}
                    className="rounded-full font-bold hover:bg-primary/5"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Exit Session
                  </Button>

                  <Card className="p-10 glass-card border-white/20 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="text-center mb-12 relative z-10">
                      <h2 className="text-4xl font-display font-bold mb-4">{selectedExercise.title}</h2>
                      <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                        {selectedExercise.description}
                      </p>
                    </div>

                    {/* Interactive Core */}
                    <div className="relative z-10 min-h-[400px] flex flex-col items-center justify-center">
                      {selectedExercise.pattern ? (
                        <div className="space-y-12 flex flex-col items-center">
                          <BreathingCircle
                            pattern={selectedExercise.pattern}
                            isActive={isExerciseActive}
                            onCycleComplete={handleCycleComplete}
                            size="lg"
                          />
                          <div className="flex items-center gap-4 bg-primary/5 rounded-2xl px-6 py-3 border border-primary/10">
                             <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Status</span>
                                <span className={cn("text-sm font-bold uppercase", isExerciseActive ? "text-primary" : "text-muted-foreground")}>
                                   {isExerciseActive ? "Breathing Now" : "Paused"}
                                </span>
                             </div>
                             <div className="w-px h-8 bg-primary/10" />
                             <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Cycle</span>
                                <span className="text-sm font-bold">{cyclesCompleted + 1} / 4</span>
                             </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full space-y-8">
                          <div className="flex justify-center">
                            <LumiCharacter
                              size="xl"
                              mood={isExerciseActive ? "calm" : "happy"}
                            />
                          </div>

                          <div className="space-y-4 max-w-md mx-auto">
                            {selectedExercise.steps.map((step, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{
                                  opacity: index === currentStep ? 1 : 0.3,
                                  scale: index === currentStep ? 1 : 0.95,
                                  filter: index === currentStep ? "blur(0px)" : "blur(1px)",
                                }}
                                className={cn(
                                  "p-6 rounded-3xl border transition-all duration-500",
                                  index === currentStep && isExerciseActive
                                    ? "bg-primary/10 border-primary/30 shadow-[0_10px_30px_rgba(0,0,0,0.1)] scale-105"
                                    : "bg-white/5 border-white/10"
                                )}
                              >
                                <div className="flex items-start gap-4">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                    index === currentStep ? "bg-primary text-white" : "bg-white/10"
                                  )}>
                                    {index + 1}
                                  </div>
                                  <p className="text-lg font-medium leading-tight pt-1">{step}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Controls Footer */}
                    <div className="mt-12 flex gap-4 relative z-10">
                      {isExerciseActive ? (
                        <Button
                          className="h-16 flex-1 rounded-2xl text-lg font-bold bg-white/5 hover:bg-white/10 border-white/10"
                          variant="outline"
                          onClick={handlePauseExercise}
                        >
                          <Pause className="w-6 h-6 mr-2 fill-current" />
                          Pause Session
                        </Button>
                      ) : (
                        <Button
                          className="h-16 flex-1 rounded-2xl text-lg font-bold bg-primary shadow-xl shadow-primary/20"
                          onClick={handleBeginExercise}
                        >
                          <Play className="w-6 h-6 mr-2 fill-current" />
                          {cyclesCompleted > 0 || currentStep > 0 ? "Continue Session" : "Begin Practice"}
                        </Button>
                      )}
                      
                      {!selectedExercise.pattern && isExerciseActive && currentStep < selectedExercise.steps.length - 1 && (
                        <Button
                          className="h-16 px-8 rounded-2xl font-bold bg-white/10 hover:bg-white/20 border-white/10"
                          onClick={handleNextStep}
                        >
                          Next Step
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Sidebar Stats Area */}
                <div className="flex-1 space-y-6 pt-16">
                   <Card className="p-8 glass-card border-white/20 rounded-[2.5rem] space-y-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Session Info</p>
                        <h4 className="text-xl font-bold">Your Progress</h4>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Timer className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold opacity-70 group-hover:opacity-100">Time Est.</span>
                          </div>
                          <span className="font-mono font-bold text-primary">{Math.floor(selectedExercise.duration / 60)}:00</span>
                        </div>

                        <div className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <Check className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold opacity-70 group-hover:opacity-100">Task Completion</span>
                          </div>
                          <span className="font-mono font-bold text-primary">
                            {selectedExercise.pattern 
                              ? `${Math.round((cyclesCompleted / 4) * 100)}%`
                              : `${Math.round(((currentStep + 1) / selectedExercise.steps.length) * 100)}%`
                            }
                          </span>
                        </div>
                      </div>

                      <div className="h-px w-full bg-white/5" />

                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Benefits</p>
                        <div className="space-y-3">
                          {selectedExercise.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-sm font-medium opacity-80">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full h-14 rounded-2xl border-white/10 hover:bg-rose-500/10 hover:text-rose-500 transition-colors font-bold"
                        onClick={handleCompleteExercise}
                      >
                        Finish & Save
                      </Button>
                   </Card>

                   <div className="p-6 super-glass border-primary/20 rounded-[2rem] text-center space-y-3">
                      <Heart className="w-8 h-8 text-rose-500 mx-auto fill-rose-500" />
                      <p className="text-xs font-bold leading-relaxed text-muted-foreground italic">
                        "Your breath is the bridge between mind and body."
                      </p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
