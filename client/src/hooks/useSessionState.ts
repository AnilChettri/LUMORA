import { useState, useCallback, useEffect } from "react";

export interface SessionState {
  active: boolean;
  type: "exercise" | "game" | "music" | null;
  exerciseId?: string;
  exerciseCategory?: string;
  step?: number;
  totalSteps?: number;
  startedAt?: number;
  mood?: string;
}

const STORAGE_KEY = "soulsync_session_state";

export function useSessionState() {
  const [session, setSession] = useState<SessionState>(() => {
    if (typeof window === "undefined") {
      return { active: false, type: null };
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { active: false, type: null };
    } catch {
      return { active: false, type: null };
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  const startSession = useCallback((type: SessionState["type"], details: Partial<SessionState> = {}) => {
    setSession({
      active: true,
      type,
      ...details,
      startedAt: Date.now(),
      step: details.step || 0,
    });
  }, []);

  const updateSession = useCallback((updates: Partial<SessionState>) => {
    setSession(prev => ({ ...prev, ...updates }));
  }, []);

  const advanceStep = useCallback(() => {
    setSession(prev => ({
      ...prev,
      step: (prev.step || 0) + 1,
    }));
  }, []);

  const endSession = useCallback(() => {
    setSession({ active: false, type: null });
  }, []);

  const hasIncompleteSession = session.active && session.type !== null;

  return {
    session,
    startSession,
    updateSession,
    advanceStep,
    endSession,
    hasIncompleteSession,
  };
}

export function getGreetingScript(mood: string | null, timeOfDay: string): string {
  const hour = new Date().getHours();
  let greeting = "";
  
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  const moodGreetings: Record<string, string> = {
    happy: "It's wonderful to see you're feeling good!",
    sad: "I'm here for you. Let's take it easy today.",
    anxious: "I can feel you might be feeling a bit worried. Let's find some calm together.",
    tired: "You seem low on energy. Let's take things gently.",
    stressed: "I can sense some tension. Let's work through it step by step.",
    neutral: "You're in a balanced place. How can I support you today?",
  };

  const baseGreeting = mood && moodGreetings[mood] 
    ? moodGreetings[mood] 
    : "Welcome back! How are you feeling right now?";

  return `${greeting}. ${baseGreeting}`;
}

export function getSessionResumeScript(type: string, exerciseName?: string): string {
  const activityNames: Record<string, string> = {
    "478-breathing": "4-7-8 breathing exercise",
    "54321-grounding": "5-4-3-2-1 grounding",
    "box-breathing": "box breathing",
    "breathing-game": "bubble popping game",
    "memory": "memory match game",
    "meditation": "meditation session",
  };

  const name = exerciseName || activityNames[type] || "your session";
  return `I notice you have an incomplete ${name}. Would you like to pick up where you left off?`;
}