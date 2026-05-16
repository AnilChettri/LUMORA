import type { MoodType } from "@shared/schema";
import { speakText } from "@/lib/aiMocks";

const SESSION_STORAGE_KEY = "soulsync_session_state";

function saveSessionState(type: "exercise" | "game" | "music", details: Record<string, unknown>) {
  try {
    const state = {
      active: true,
      type,
      ...details,
      startedAt: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save session state", e);
  }
}

function clearSessionState() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn("Could not clear session state", e);
  }
}

/**
 * Phase 1: dev-ready mood → intervention planner.
 *
 * Separate the "plan" (pure, testable) from "execution" (side effects).
 * This makes it easy to later swap the planner for a small local LLM
 * that outputs the same action schema.
 */

// Catalog of allowed intervention actions for the planner/agent.
export type InterventionAction =
  | {
      type: "exercise";
      id: string; // e.g. "478-breathing", "54321-grounding"
      category: "breathing" | "grounding" | "meditation" | "sleep";
      autoStart?: boolean; // whether to auto-start when possible
    }
  | {
      type: "game";
      id: string; // e.g. "breathing-game", "memory"
      autoStart?: boolean;
    }
  | {
      type: "music";
      mood: "calm" | "sleep" | "happy" | "anxious"; // map to playlist tags
      autoPlay?: boolean;
    }
  | {
      type: "navigate";
      route: string; // fallback direct route, e.g. "/" or "/journal"
    }
  | {
      type: "voice_script";
      id: string;
      text: string;
      rate?: number;
    };

/**
 * Pure, hardcoded plan for Phase 1.
 * No side effects, just returns a short sequence of actions.
 */
/**
 * Human-readable preview of what Lumi will do next for a given mood.
 * Used for UI copy so the user knows what to expect before they tap.
 */
export function getPlanPreviewForMood(mood: MoodType): {
  title: string;
  subtitle: string;
  chips: string[];
} {
  switch (mood) {
    case "sad":
      return {
        title: "We'll start with a grounding exercise",
        subtitle: "5-4-3-2-1 grounding · about 3–5 minutes",
        chips: ["Name 5 things you can see", "Gentle pace", "Helps you feel more steady"],
      };
    case "anxious":
      return {
        title: "We'll guide you through 4-7-8 breathing",
        subtitle: "Calming breath pattern · around 3 minutes",
        chips: ["In for 4", "Hold for 7", "Out for 8"],
      };
    case "tired":
      return {
        title: "We'll put on a sleep-friendly soundscape",
        subtitle: "Soft ambient mix to help you unwind",
        chips: ["Low stimulation", "No lyrics", "Great before bed"],
      };
    case "stressed":
      return {
        title: "We'll release tension with a light game",
        subtitle: "Bubble pop in sync with your breath",
        chips: ["Tap to pop bubbles", "Visually soothing", "Quick reset"],
      };
    case "neutral":
      return {
        title: "We'll move into a gentle reflection",
        subtitle: "Short journal check-in to set your tone",
        chips: ["No pressure to write a lot", "Name what matters today"],
      };
    case "happy":
    default:
      return {
        title: "We'll head to your home space",
        subtitle: "From there you can choose music, practices, or community",
        chips: ["Keep the momentum", "Share or reflect", "Explore a new ritual"],
      };
  }
}

export function getImmediatePlanForMood(mood: MoodType): InterventionAction[] {
  switch (mood) {
    case "sad":
      return [
        {
          type: "voice_script",
          id: "sad_intro",
          text:
            "I'm here with you. Let's start with a simple grounding exercise to help you feel a bit more steady.",
          rate: 0.9,
        },
        {
          type: "exercise",
          id: "54321-grounding",
          category: "grounding",
          autoStart: false,
        },
      ];

    case "anxious":
      return [
        {
          type: "voice_script",
          id: "anxious_intro",
          text:
            "I can feel your mind is active. We'll do four-seven-eight breathing together. Breathe in for four, hold for seven, and out for eight.",
          rate: 0.9,
        },
        {
          type: "exercise",
          id: "478-breathing",
          category: "breathing",
          autoStart: true,
        },
      ];

    case "tired":
      return [
        {
          type: "voice_script",
          id: "tired_intro",
          text:
            "You seem low on energy. I'll put on something calm. You can close your eyes, or jot down a few thoughts while it plays.",
          rate: 0.9,
        },
        {
          type: "music",
          mood: "sleep",
          autoPlay: true,
        },
      ];

    case "stressed":
      return [
        {
          type: "voice_script",
          id: "stressed_intro",
          text:
            "There’s a lot on your plate. Let’s release some tension with a light bubble popping game, then you can choose to breathe or journal.",
          rate: 0.9,
        },
        {
          type: "game",
          id: "breathing-game",
          autoStart: true,
        },
      ];

    case "neutral":
      return [
        {
          type: "voice_script",
          id: "neutral_intro",
          text:
            "You're in a balanced place. Let's use that to reflect a bit and decide what you want from today.",
          rate: 0.9,
        },
        {
          type: "navigate",
          route: "/journal?fromMood=neutral",
        },
      ];

    case "happy":
    default:
      return [
        {
          type: "voice_script",
          id: "happy_intro",
          text:
            "Love seeing this mood. Let's explore something that keeps this energy going.",
          rate: 1,
        },
        {
          type: "navigate",
          route: "/",
        },
      ];
  }
}

/**
 * Execute a plan using the current client routing + voice stack.
 *
 * This is the only place that knows about URLs or speech synthesis.
 */
export function runPlan(
  plan: InterventionAction[],
  navigate: (path: string) => void
) {
  if (!navigate || !plan.length) return;

  // 1) Fire voice scripts immediately so the user hears guidance.
  for (const step of plan) {
    if (step.type === "voice_script") {
      speakText(step.text, step.rate ?? 1);
    }
  }

  // 2) Find the first navigational step and route accordingly.
  const navStep = plan.find((step) =>
    step.type === "exercise" ||
    step.type === "game" ||
    step.type === "music" ||
    step.type === "navigate"
  );

  if (!navStep) return;

  if (navStep.type === "navigate") {
    navigate(navStep.route);
    return;
  }

  if (navStep.type === "exercise") {
    const params = new URLSearchParams();
    params.set("type", navStep.category);
    params.set("exerciseId", navStep.id);
    if (navStep.autoStart) {
      params.set("autoStart", "true");
    }
    saveSessionState("exercise", {
      exerciseId: navStep.id,
      exerciseCategory: navStep.category,
    });
    navigate(`/exercises?${params.toString()}&fromMoodOverride=1`);
    return;
  }

  if (navStep.type === "game") {
    const params = new URLSearchParams();
    params.set("game", navStep.id);
    if (navStep.autoStart) {
      params.set("autoStart", "true");
    }
    saveSessionState("game", { exerciseId: navStep.id });
    navigate(`/games?${params.toString()}&fromMoodOverride=1`);
    return;
  }

  if (navStep.type === "music") {
    const params = new URLSearchParams();
    params.set("mood", navStep.mood);
    if (navStep.autoPlay) {
      params.set("autoPlay", "true");
    }
    saveSessionState("music", { mood: navStep.mood });
    navigate(`/music?${params.toString()}&fromMoodOverride=1`);
  }
}

/**
 * Backwards-compatible helper used by the UI: mood → plan → run.
 */
export function runImmediateMoodPlan(
  mood: MoodType,
  navigate: (path: string) => void
) {
  const plan = getImmediatePlanForMood(mood);
  runPlan(plan, navigate);
}
