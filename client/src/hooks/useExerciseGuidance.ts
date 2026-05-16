import { useEffect, useRef } from "react";
import { speakText } from "@/lib/aiMocks";

interface ExerciseStep {
  instruction: string;
  duration?: number;
}

interface ExerciseGuidanceConfig {
  exerciseId: string;
  exerciseTitle: string;
  steps: string[];
  pattern?: "478" | "box" | "relaxing" | null;
  isActive: boolean;
  currentStep: number;
  cyclesCompleted: number;
}

export function useExerciseGuidance(config: ExerciseGuidanceConfig) {
  const hasStartedRef = useRef(false);
  const lastStepRef = useRef(-1);
  const lastCycleRef = useRef(-1);

  useEffect(() => {
    const autoPlayConsent = localStorage.getItem("tts-auto-play-consent");
    if (autoPlayConsent !== "true" || !config.isActive) return;

    const { exerciseId, exerciseTitle, steps, pattern, currentStep, cyclesCompleted } = config;

    if (!hasStartedRef.current && config.isActive) {
      hasStartedRef.current = true;
      
      const startScripts: Record<string, string> = {
        "478-breathing": "Let's do the 4-7-8 breathing. I'll guide you through each breath. In through your nose for 4, hold for 7, and out through your mouth for 8.",
        "box-breathing": "Time for box breathing. Breathe in for 4, hold for 4, out for 4, hold for 4. I'll keep you synchronized.",
        "54321-grounding": "Let's ground yourself using the 5-4-3-2-1 technique. I'll guide you through each sense. Let's begin.",
        "body-scan": "Let's do a body scan meditation. I'll walk you through relaxing each part of your body, from your feet to your head.",
        "sleep-prep": "Let's prepare for restful sleep. Follow my voice as we wind down together.",
      };

      const script = startScripts[exerciseId] || `Let's begin ${exerciseTitle}. I'll guide you through each step.`;
      setTimeout(() => speakText(script, 0.85), 300);
    }

    if (lastStepRef.current !== currentStep && currentStep > 0 && currentStep < steps.length) {
      lastStepRef.current = currentStep;
      
      if (steps[currentStep]) {
        const stepScript = steps[currentStep];
        setTimeout(() => speakText(stepScript, 0.9), 500);
      }
    }

    if (lastCycleRef.current !== cyclesCompleted && cyclesCompleted > 0) {
      lastCycleRef.current = cyclesCompleted;
      
      if (pattern) {
        const cycleMessages = [
          "Great job, cycle complete.",
          "Keep going, you're doing well.",
          "One more cycle to go.",
          "Almost done, just one more.",
        ];
        const message = cycleMessages[Math.min(cyclesCompleted - 1, cycleMessages.length - 1)];
        setTimeout(() => speakText(message, 0.9), 500);
      }
    }

    const isComplete = (pattern && cyclesCompleted >= 4) || 
                      (!pattern && currentStep >= steps.length - 1);
    
    if (isComplete && cyclesCompleted >= lastCycleRef.current && lastCycleRef.current > 0) {
      setTimeout(() => {
        speakText("Well done! You've completed the exercise. Take a moment to notice how you feel now.", 0.85);
      }, 1000);
    }
  }, [config.isActive, config.currentStep, config.cyclesCompleted]);

  useEffect(() => {
    if (!config.isActive) {
      hasStartedRef.current = false;
      lastStepRef.current = -1;
      lastCycleRef.current = -1;
    }
  }, [config.isActive]);
}

export function getCompletionScript(exerciseTitle: string): string {
  const scripts = [
    `Wonderful work completing ${exerciseTitle}. Take a moment to notice how you feel.`,
    `Great job! You've finished ${exerciseTitle}. Take a breath and appreciate this moment.`,
    `Well done! ${exerciseTitle} is complete. How do you feel right now?`,
  ];
  return scripts[Math.floor(Math.random() * scripts.length)];
}