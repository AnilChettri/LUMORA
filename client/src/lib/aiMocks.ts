/**
 * AI Mock Utilities
 * These provide realistic simulated AI responses for development/demo
 * Can be replaced with real API calls in production
 */

import type { MoodType } from "@shared/schema";

/**
 * Mock Emotion Detection from Video Frame
 * In production, would use TensorFlow.js, Azure Face API, or similar
 */
export async function mockDetectEmotion(
  videoElement: HTMLVideoElement
): Promise<{ mood: MoodType; confidence: number }> {
  return new Promise((resolve) => {
    // Simulate detection delay (0.5-1.5 seconds)
    const delay = 500 + Math.random() * 1000;

    setTimeout(() => {
      // Weighted mood distribution (more realistic)
      const moodWeights: Record<MoodType, number> = {
        happy: 0.2,
        neutral: 0.35,
        anxious: 0.15,
        tired: 0.15,
        stressed: 0.1,
        sad: 0.05,
      };

      const rand = Math.random();
      let cumulative = 0;
      let selectedMood: MoodType = "neutral";

      for (const [mood, weight] of Object.entries(moodWeights)) {
        cumulative += weight;
        if (rand <= cumulative) {
          selectedMood = mood as MoodType;
          break;
        }
      }

      // Higher confidence for neutral, lower for extremes
      const confidenceVariation = selectedMood === "neutral" ? 15 : 20;
      const baseConfidence =
        selectedMood === "neutral" ? 80 : 70;
      const confidence = Math.min(
        99,
        baseConfidence + Math.random() * confidenceVariation
      );

      resolve({
        mood: selectedMood,
        confidence: Math.round(confidence),
      });
    }, delay);
  });
}

/**
 * Mock Voice Recognition Response
 * In production, would use Web Speech API + OpenAI/Claude
 */
export async function mockProcessVoiceInput(
  transcription: string
): Promise<{ response: string; sentiment: "positive" | "neutral" | "concerned" }> {
  return new Promise((resolve) => {
    const delay = 800 + Math.random() * 400;

    setTimeout(() => {
      const responses: Record<
        string,
        { response: string; sentiment: "positive" | "neutral" | "concerned" }
      > = {
        hello: {
          response: "Hi there! I'm Lumi. How are you feeling today?",
          sentiment: "positive",
        },
        help: {
          response: "I'm here to listen and support you. Would you like to try a breathing exercise?",
          sentiment: "neutral",
        },
        anxious: {
          response: "I understand you're feeling anxious. Let's try some grounding techniques to help calm your mind.",
          sentiment: "concerned",
        },
        tired: {
          response: "It sounds like you need some rest. A short meditation or calming music might help.",
          sentiment: "neutral",
        },
        sad: {
          response: "I'm sorry you're feeling this way. Your feelings are valid. Would you like to talk or try an exercise?",
          sentiment: "concerned",
        },
        happy: {
          response: "That's wonderful to hear! Let's share that positive energy with the community!",
          sentiment: "positive",
        },
      };

      const lowerTranscript = transcription.toLowerCase();
      let matchedResponse = responses.hello;

      for (const [key, value] of Object.entries(responses)) {
        if (lowerTranscript.includes(key)) {
          matchedResponse = value;
          break;
        }
      }

      resolve(matchedResponse);
    }, delay);
  });
}

/**
 * Mock Wellness Suggestions
 * Based on mood and time of day
 */
export function generateWellnessSuggestion(
  mood: MoodType,
  hour: number = new Date().getHours()
): string {
  const suggestions: Record<MoodType, string[]> = {
    happy: [
      "🎵 Share your joy with the community!",
      "📸 Capture this moment in your journal",
      "🎮 Celebrate with a fun game",
    ],
    sad: [
      "📖 Read an inspiring story",
      "🎵 Listen to uplifting music",
      "💬 Talk to someone in the community",
    ],
    anxious: [
      "🫁 Try our 4-7-8 breathing exercise",
      "🧘 Guided grounding meditation",
      "🎵 Calming ambient sounds",
    ],
    tired: [
      "😴 Sleep preparation exercise",
      "🎵 Relaxing bedtime music",
      "📔 Reflect before bed in your journal",
    ],
    stressed: [
      "🌀 Progressive muscle relaxation",
      "🫁 Quick breathing break",
      "🚶 Take a mindful walk",
    ],
    neutral: [
      "🎮 Try something new today",
      "📚 Discover a new story",
      "💪 Gentle movement exercise",
    ],
  };

  const moodSuggestions = suggestions[mood];
  return moodSuggestions[Math.floor(Math.random() * moodSuggestions.length)];
}

/**
 * Text-to-speech synthesis using Web Speech API
 */
export function speakText(text: string, rate: number = 1) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2, rate));
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Play sound effect
 */
export function playSound(audioUrl: string, volume: number = 0.5) {
  try {
    const audio = new Audio(audioUrl);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(() => {
      // Silently fail if audio cannot play
    });
  } catch {
    // Silently fail if audio API is not available
  }
}

/**
 * Get activity recommendations based on mood
 */
export function getMoodRecommendations(mood: MoodType) {
  const recommendations: Record<
    MoodType,
    Array<{ icon: string; label: string; path: string; color: string }>
  > = {
    happy: [
      {
        icon: "🎵",
        label: "Share Your Joy",
        path: "/music",
        color: "from-yellow-500 to-orange-500",
      },
      {
        icon: "👥",
        label: "Community",
        path: "/community",
        color: "from-pink-500 to-rose-500",
      },
      {
        icon: "📚",
        label: "Inspiring Stories",
        path: "/books",
        color: "from-blue-500 to-cyan-500",
      },
    ],
    sad: [
      {
        icon: "💬",
        label: "Talk to Lumi",
        path: "/voice",
        color: "from-purple-500 to-pink-500",
      },
      {
        icon: "📔",
        label: "Journal",
        path: "/journal",
        color: "from-indigo-500 to-purple-500",
      },
      {
        icon: "🎵",
        label: "Calming Music",
        path: "/music",
        color: "from-blue-500 to-violet-500",
      },
    ],
    anxious: [
      {
        icon: "🫁",
        label: "Breathing",
        path: "/exercises?type=breathing",
        color: "from-green-500 to-teal-500",
      },
      {
        icon: "🧘",
        label: "Grounding",
        path: "/exercises?type=grounding",
        color: "from-emerald-500 to-cyan-500",
      },
      {
        icon: "🧠",
        label: "Meditation",
        path: "/exercises",
        color: "from-violet-500 to-purple-500",
      },
    ],
    tired: [
      {
        icon: "🌙",
        label: "Sleep Prep",
        path: "/exercises?type=sleep",
        color: "from-indigo-500 to-blue-500",
      },
      {
        icon: "🎵",
        label: "Ambient Music",
        path: "/music",
        color: "from-slate-500 to-gray-500",
      },
      {
        icon: "🎮",
        label: "Relaxing Games",
        path: "/games",
        color: "from-teal-500 to-cyan-500",
      },
    ],
    stressed: [
      {
        icon: "🫁",
        label: "Quick Breathing",
        path: "/exercises?type=breathing",
        color: "from-green-500 to-emerald-500",
      },
      {
        icon: "🎮",
        label: "Games",
        path: "/games",
        color: "from-orange-500 to-yellow-500",
      },
      {
        icon: "📚",
        label: "Read",
        path: "/books",
        color: "from-blue-500 to-cyan-500",
      },
    ],
    neutral: [
      {
        icon: "🎯",
        label: "Explore",
        path: "/exercises",
        color: "from-purple-500 to-violet-500",
      },
      {
        icon: "👥",
        label: "Community",
        path: "/community",
        color: "from-pink-500 to-rose-500",
      },
      {
        icon: "🎵",
        label: "Music",
        path: "/music",
        color: "from-orange-500 to-pink-500",
      },
    ],
  };

  return recommendations[mood];
}

/**
 * Game sound effects (placeholder URLs - replace with actual audio files)
 */
export const gameSounds = {
  match: "/sounds/match.mp3",
  mismatch: "/sounds/mismatch.mp3",
  levelUp: "/sounds/level-up.mp3",
  gameOver: "/sounds/game-over.mp3",
  buttonClick: "/sounds/click.mp3",
  pop: "/sounds/pop.mp3",
};

