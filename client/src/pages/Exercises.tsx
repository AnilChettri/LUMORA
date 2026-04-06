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
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/soundManager";
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

  const filteredExercises = exercises.filter(e => e.category === activeCategory);

  // Support deep-linking into a specific exercise (for mood → action plans)
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
    setSelectedExercise(exercise);
    setCurrentStep(0);
    setCyclesCompleted(0);
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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {!selectedExercise ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-display font-bold mb-2">Exercises</h1>
                <p className="text-muted-foreground">
                  Guided exercises to help you feel better
                </p>
              </div>

              {/* Category Tabs */}
              <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
                <TabsList className="grid grid-cols-4 h-auto w-full max-w-md">
                  {exerciseCategories.map((cat) => (
                    <TabsTrigger
                      key={cat.id}
                      value={cat.id}
                      className="flex flex-col items-center gap-1 py-3"
                      data-testid={`tab-${cat.id}`}
                    >
                      <cat.icon className="w-5 h-5" />
                      <span className="text-xs">{cat.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Exercise List */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise, index) => (
                  <motion.div
                    key={exercise.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className="p-4 h-full flex flex-col hover-elevate cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
                      onClick={() => handleStartExercise(exercise)}
                      data-testid={`card-exercise-${exercise.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{exercise.title}</h3>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {exercise.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <Badge variant="secondary" className="text-xs">
                          <Timer className="w-3 h-3 mr-1" />
                          {Math.floor(exercise.duration / 60)} min
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {exercise.steps.length} steps
                        </Badge>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
            >
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCompleteExercise}
                className="mb-4"
              >
                ← Back to exercises
              </Button>

              {/* Exercise Card */}
              <Card className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold mb-2">{selectedExercise.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedExercise.description}
                  </p>
                </div>

                {/* Breathing Circle for breathing exercises */}
                {selectedExercise.pattern && (
                  <div className="flex justify-center mb-8">
                    <BreathingCircle
                      pattern={selectedExercise.pattern}
                      isActive={isExerciseActive}
                      onCycleComplete={handleCycleComplete}
                      size="lg"
                    />
                  </div>
                )}

                {/* Non-breathing exercise steps */}
                {!selectedExercise.pattern && (
                  <div className="mb-8">
                    <div className="flex justify-center mb-6">
                      <LumiCharacter
                        size="md"
                        mood={isExerciseActive ? "calm" : "happy"}
                      />
                    </div>

                    <div className="space-y-3">
                      {selectedExercise.steps.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: index <= currentStep ? 1 : 0.5,
                            x: 0,
                          }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-lg transition-all border-2",
                            index === currentStep && isExerciseActive
                              ? "bg-primary/10 border-primary/50 shadow-md"
                              : index < currentStep
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30"
                                : "bg-muted/30 border-transparent"
                          )}
                        >
                          <motion.div
                            animate={index === currentStep && isExerciseActive ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                              index < currentStep
                                ? "bg-green-500 text-white"
                                : index === currentStep
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                            )}
                          >
                            {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                          </motion.div>
                          <span className="text-sm pt-0.5">{step}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress */}
                {selectedExercise.pattern && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Cycles completed</span>
                      <span className="font-medium">{cyclesCompleted} / 4</span>
                    </div>
                    <Progress value={(cyclesCompleted / 4) * 100} className="h-2" />
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleResetExercise}
                    data-testid="button-reset-exercise"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>

                  {isExerciseActive ? (
                    <Button
                      className="flex-1"
                      onClick={handlePauseExercise}
                      data-testid="button-pause-exercise"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={handleBeginExercise}
                      data-testid="button-start-exercise"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {cyclesCompleted > 0 ? "Continue" : "Begin"}
                    </Button>
                  )}
                </div>

                {/* Next step button for non-breathing exercises */}
                {!selectedExercise.pattern && isExerciseActive && currentStep < selectedExercise.steps.length - 1 && (
                  <Button
                    variant="secondary"
                    className="w-full mt-3"
                    onClick={handleNextStep}
                    data-testid="button-next-step"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                {/* Complete button */}
                {((selectedExercise.pattern && cyclesCompleted >= 4) ||
                  (!selectedExercise.pattern && currentStep >= selectedExercise.steps.length - 1)) && (
                    <Button
                      variant="secondary"
                      className="w-full mt-3"
                      onClick={handleCompleteExercise}
                      data-testid="button-complete-exercise"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
