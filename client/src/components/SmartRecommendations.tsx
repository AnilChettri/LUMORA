import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { speakText } from "@/lib/aiMocks";
import type { MoodType } from "@shared/schema";
import {
  Sparkles,
  Play,
  Music4,
  HeartPulse,
  Wind,
  Brain,
  ChevronRight,
} from "lucide-react";

interface SmartRecommendationsProps {
  mood: MoodType;
  timeOfDay: string;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  action: string;
}

const getRecommendations = (mood: MoodType, timeOfDay: string): Recommendation[] => {
  const hour = new Date().getHours();
  const isEvening = hour >= 18;
  const isMorning = hour < 12;

  const moodBased: Record<MoodType, Recommendation[]> = {
    happy: [
      { id: 'share', title: 'Share Your Joy', description: 'Post in community', icon: Sparkles, path: '/community', color: 'from-yellow-400 to-orange-500', action: 'Share your positive energy!' },
      { id: 'music-upbeat', title: 'Uplifting Music', description: 'Boost your mood', icon: Music4, path: '/music?mood=happy', color: 'from-pink-400 to-rose-500', action: 'Keep the good vibes going!' },
    ],
    sad: [
      { id: 'breathe-calm', title: 'Gentle Breathing', description: 'Find some calm', icon: Wind, path: '/exercises?type=breathing', color: 'from-blue-400 to-cyan-500', action: "Let's take it easy together." },
      { id: 'journal-sad', title: 'Write It Out', description: 'Process your feelings', icon: Sparkles, path: '/journal', color: 'from-indigo-400 to-purple-500', action: 'Sometimes writing helps.' },
    ],
    anxious: [
      { id: '478-breath', title: '4-7-8 Breathing', description: 'Calm your mind', icon: Wind, path: '/exercises?type=breathing&exerciseId=478-breathing', color: 'from-teal-400 to-emerald-500', action: 'This will help you feel more calm.' },
      { id: 'grounding', title: '5-4-3-2-1 Grounding', description: 'Be present', icon: Brain, path: '/exercises?type=grounding', color: 'from-violet-400 to-purple-500', action: "Let's ground you in the present." },
    ],
    stressed: [
      { id: 'body-scan', title: 'Body Scan', description: 'Release tension', icon: HeartPulse, path: '/exercises?type=meditation', color: 'from-rose-400 to-pink-500', action: 'Let go of the tension.' },
      { id: 'bubble-game', title: 'Bubble Pop', description: 'Quick reset', icon: Sparkles, path: '/games?game=breathing-game', color: 'from-sky-400 to-indigo-500', action: 'A fun break might help!' },
    ],
    tired: [
      { id: 'sleep-music', title: 'Sleep Sounds', description: 'Rest and recover', icon: Music4, path: '/music?mood=sleep', color: 'from-indigo-400 to-blue-500', action: "Let's help you rest." },
      { id: 'sleep-prep', title: 'Sleep Prep', description: 'Wind down', icon: HeartPulse, path: '/exercises?type=sleep', color: 'from-purple-400 to-indigo-500', action: 'Prepare for some good rest.' },
    ],
    neutral: [
      { id: 'explore', title: 'Explore Spaces', description: 'Try something new', icon: Sparkles, path: '/exercises', color: 'from-amber-400 to-orange-500', action: "There's lots to explore!" },
      { id: 'check-in', title: 'Quick Check-in', description: 'How are you really?', icon: HeartPulse, path: '/mood', color: 'from-teal-400 to-cyan-500', action: "Let's check in with yourself." },
    ],
  };

  // Add time-based recommendations
  let recommendations = [...(moodBased[mood] || moodBased.neutral)];

  // Morning: energy boost
  if (isMorning) {
    recommendations.unshift({ id: 'morning-energy', title: 'Morning Energy', description: 'Start strong', icon: Sparkles, path: '/exercises?type=breathing&exerciseId=morning-energy', color: 'from-orange-400 to-yellow-500', action: 'Start your day right!' });
  }

  // Evening: wind down
  if (isEvening) {
    recommendations.unshift({ id: 'evening-wind', title: 'Evening Wind Down', description: 'Prepare for rest', icon: Sparkles, path: '/exercises?type=sleep', color: 'from-indigo-400 to-purple-500', action: "Time to wind down." });
  }

  return recommendations.slice(0, 3);
};

export function SmartRecommendations({ mood, timeOfDay }: SmartRecommendationsProps) {
  const [, setLocation] = useLocation();
  const recommendations = getRecommendations(mood, timeOfDay);

  const handleRecommendation = (rec: Recommendation) => {
    speakText(rec.action, 0.9);
    setLocation(rec.path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="rounded-3xl border border-white/16 bg-gradient-to-br from-violet-950/80 to-purple-950/80 px-6 py-6 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <LumiCharacter size="sm" mood="happy" animate={true} />
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Recommended for you
            </p>
            <h3 className="text-lg font-semibold text-white">Based on how you're feeling</h3>
          </div>
        </div>

        <div className="grid gap-3">
          {recommendations.map((rec, index) => (
            <motion.button
              key={rec.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => handleRecommendation(rec)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rec.color} flex items-center justify-center shrink-0 shadow-lg`}>
                <rec.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white group-hover:text-white/90">{rec.title}</h4>
                <p className="text-sm text-white/70">{rec.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}