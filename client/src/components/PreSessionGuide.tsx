import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { speakText } from "@/lib/aiMocks";
import {
  Play,
  Volume2,
  VolumeX,
  ChevronRight,
  X,
  Info,
  Clock,
  Target,
} from "lucide-react";

interface SessionGuide {
  id: string;
  title: string;
  description: string;
  duration: string;
  benefits: string[];
  steps: { title: string; description: string }[];
  introVoice: string;
}

interface PreSessionGuideProps {
  sessionId: string;
  onStart: () => void;
  onSkip: () => void;
}

// Pre-defined guides for different sessions
const sessionGuides: Record<string, SessionGuide> = {
  '478-breathing': {
    id: '478-breathing',
    title: '4-7-8 Breathing',
    description: "A calming technique to reduce anxiety and help you relax",
    duration: '3 minutes',
    benefits: ['Reduces anxiety', 'Helps with sleep', 'Calms nervous system'],
    introVoice: "Welcome to 4-7-8 breathing. This simple technique can help calm your mind and reduce anxiety. You'll breathe in for 4 counts, hold for 7, and exhale for 8. We'll do 4 cycles together. Let me guide you through each breath.",
    steps: [
      { title: 'Get Comfortable', description: 'Sit in a comfortable position with your back straight' },
      { title: 'Breathe In', description: 'Inhale slowly through your nose for 4 counts' },
      { title: 'Hold', description: 'Hold your breath for 7 counts' },
      { title: 'Exhale', description: 'Slowly exhale through your mouth for 8 counts' },
      { title: 'Repeat', description: 'Continue for 4 cycles, then rest' },
    ],
  },
  'box-breathing': {
    id: 'box-breathing',
    title: 'Box Breathing',
    description: "A technique used by Navy SEALs to stay calm under pressure",
    duration: '4 minutes',
    benefits: ['Improves focus', 'Reduces stress', 'Enhances performance'],
    introVoice: "Welcome to box breathing. This is a technique used by Navy SEALs to stay calm and focused. You'll breathe in for 4 counts, hold for 4, breathe out for 4, and hold for 4. Let's do this together.",
    steps: [
      { title: 'Sit Up', description: 'Sit upright with good posture' },
      { title: 'Inhale', description: 'Breathe in for 4 counts' },
      { title: 'Hold', description: 'Hold for 4 counts' },
      { title: 'Exhale', description: 'Breathe out for 4 counts' },
      { title: 'Hold', description: 'Hold empty for 4 counts' },
    ],
  },
  '54321-grounding': {
    id: '54321-grounding',
    title: '5-4-3-2-1 Grounding',
    description: "Use your senses to ground yourself in the present moment",
    duration: '5 minutes',
    benefits: ['Reduces anxiety', 'Brings present awareness', 'Eases panic'],
    introVoice: "Welcome to the 5-4-3-2-1 grounding technique. This helps when you feel overwhelmed or anxious. You'll name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Let's begin.",
    steps: [
      { title: '5 Things You See', description: 'Look around and name 5 things you can see' },
      { title: '4 Things You Can Touch', description: 'Notice 4 things you can physically touch' },
      { title: '3 Things You Can Hear', description: 'Listen for 3 sounds around you' },
      { title: '2 Things You Can Smell', description: 'Notice 2 things you can smell' },
      { title: '1 Thing You Can Taste', description: 'Notice 1 taste in your mouth' },
    ],
  },
  'body-scan': {
    id: 'body-scan',
    title: 'Body Scan Meditation',
    description: "A mindfulness practice to release physical tension",
    duration: '10 minutes',
    benefits: ['Releases tension', 'Improves body awareness', 'Promotes deep relaxation'],
    introVoice: "Welcome to body scan meditation. This practice helps you release physical tension by bringing awareness to each part of your body. I'll guide you from your feet to your head. Simply relax and follow my voice.",
    steps: [
      { title: 'Get Comfortable', description: 'Lie down or sit comfortably with eyes closed' },
      { title: 'Feet & Legs', description: 'Focus on your feet, then move attention up through your legs' },
      { title: 'Hips & Belly', description: 'Notice any tension in your hips and stomach, let it go' },
      { title: 'Chest & Shoulders', description: 'Relax your chest and shoulders' },
      { title: 'Arms & Hands', description: 'Release tension from your arms and hands' },
      { title: 'Face & Head', description: 'Relax your face, jaw, and scalp' },
      { title: 'Full Body', description: 'Feel your whole body completely relaxed' },
    ],
  },
  'sleep-prep': {
    id: 'sleep-prep',
    title: 'Sleep Preparation',
    description: "Wind down and prepare your mind for restful sleep",
    duration: '8 minutes',
    benefits: ['Better sleep quality', 'Calms the mind', 'Natural relaxation'],
    introVoice: "Welcome to sleep preparation. Let's wind down and prepare your mind for restful sleep. Follow along as we relax your body and calm your thoughts. This takes about 8 minutes.",
    steps: [
      { title: 'Dim the Lights', description: 'Make your environment dim and cozy' },
      { title: 'Deep Breaths', description: 'Take 5 slow, deep breaths' },
      { title: 'Relax Face', description: 'Release tension in your face, jaw, and eyes' },
      { title: 'Drop Shoulders', description: 'Let your shoulders drop away from your ears' },
      { title: 'Visualize', description: 'Picture a peaceful, safe place' },
      { title: 'Let Go', description: 'Release all thoughts about the day' },
    ],
  },
  'music-calm': {
    id: 'music-calm',
    title: 'Calm Music Session',
    description: "Gentle ambient sounds to help you relax and find peace",
    duration: '15-30 minutes',
    benefits: ['Reduces stress', 'Calms the mind', 'Creates peaceful atmosphere'],
    introVoice: "Welcome to your calm music session. This is a time to simply sit back, close your eyes, and let the music wash over you. There's nothing to do - just relax and be present. The music will play continuously.",
    steps: [
      { title: 'Get Comfortable', description: 'Sit or lie down in a comfortable position' },
      { title: 'Close Eyes', description: 'Close your eyes and take a few deep breaths' },
      { title: 'Just Listen', description: 'Let the music guide your relaxation' },
      { title: 'Stay Present', description: 'If your mind wanders, gently return to the music' },
    ],
  },
  'music-sleep': {
    id: 'music-sleep',
    title: 'Sleep Sounds',
    description: "Soothing sounds to help you drift off to sleep",
    duration: '30-60 minutes',
    benefits: ['Helps you fall asleep', 'Deep relaxation', 'Blocks distractions'],
    introVoice: "Welcome to sleep sounds. These gentle ambient tracks are designed to help you drift off to sleep. The music will play for a while and then fade. Simply rest and let the sounds carry you to sleep.",
    steps: [
      { title: 'Get Cozy', description: 'Lie down in your most comfortable sleeping position' },
      { title: 'Dim the Room', description: 'Make sure the room is dark enough for sleep' },
      { title: 'Let Go', description: 'Let the sounds wash over you' },
      { title: 'Drift Off', description: 'Allow yourself to fall asleep naturally' },
    ],
  },
  'memory-game': {
    id: 'memory-game',
    title: 'Memory Match',
    description: "A mindful matching game to exercise your brain",
    duration: '5-10 minutes',
    benefits: ['Improves memory', 'Fun distraction', 'Quick mental exercise'],
    introVoice: "Welcome to Memory Match! This is a fun game where you flip cards to find matching pairs. It's a great way to take a mental break and exercise your brain. Take your time and enjoy!",
    steps: [
      { title: 'The Grid', description: 'You see cards face-down in a grid' },
      { title: 'Flip Two', description: 'Click two cards to flip them over' },
      { title: 'Match', description: 'If they match, they stay revealed' },
      { title: 'Keep Going', description: 'Find all pairs in as few moves as possible' },
    ],
  },
  'bubble-game': {
    id: 'bubble-game',
    title: 'Bubble Pop',
    description: "Pop bubbles in rhythm with your breath for relaxation",
    duration: '3-5 minutes',
    benefits: ['Stress relief', 'Fun and engaging', 'Breath awareness'],
    introVoice: "Welcome to Bubble Pop! This is a simple, fun game where you pop bubbles as they float up. It can be quite meditative. Try to pop in rhythm with your breathing - inhale as they rise, exhale as you pop.",
    steps: [
      { title: 'Watch', description: 'Bubbles will float up from the bottom' },
      { title: 'Tap to Pop', description: 'Tap or click bubbles to pop them' },
      { title: 'Stay Calm', description: "Don't worry if you miss some - there's always more" },
      { title: 'Enjoy', description: 'Have fun and let yourself relax' },
    ],
  },
  'journal': {
    id: 'journal',
    title: 'Journaling Session',
    description: "A private space to reflect and process your thoughts",
    duration: '10-20 minutes',
    benefits: ['Self-reflection', 'Emotional processing', 'Clarity of thought'],
    introVoice: "Welcome to your journaling space. This is a private place to write whatever's on your mind. There's no right or wrong - just let your thoughts flow. I can suggest prompts if you'd like, or you can write freely.",
    steps: [
      { title: 'Choose Your Focus', description: "Decide what you want to write about" },
      { title: 'Write Freely', description: 'Just write - donot worry about grammar or structure' },
      { title: 'Be Honest', description: 'This is for you - write your true thoughts' },
      { title: 'Reflect', description: 'Read what you wrote and notice how you feel' },
    ],
  },
};

// Generic guide for sessions not specifically defined
const genericGuide: SessionGuide = {
  id: 'generic',
  title: 'Guided Session',
  description: 'A mindful session for your well-being',
  duration: '5-15 minutes',
  benefits: ['Relaxation', 'Mindfulness', 'Self-care'],
  introVoice: "Welcome to your guided session. I'll be here with you the whole time. Just follow along, do what feels comfortable, and remember to breathe.",
  steps: [
    { title: 'Get Ready', description: 'Find a comfortable position' },
    { title: 'Follow Along', description: 'Listen to the guidance and follow along' },
    { title: 'Breathe', description: 'Take deep breaths throughout' },
    { title: 'Relax', description: 'Allow yourself to fully relax' },
  ],
};

export function getSessionGuide(sessionId: string): SessionGuide {
  return sessionGuides[sessionId] || genericGuide;
}

export function PreSessionGuide({ sessionId, onStart, onSkip }: PreSessionGuideProps) {
  const [showGuide, setShowGuide] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const guide = getSessionGuide(sessionId);

  useEffect(() => {
    // Auto-play intro after a short delay
    const timer = setTimeout(() => {
      if (!isMuted) {
        speakText(guide.introVoice, 0.85);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [guide.introVoice, isMuted]);

  const handleStart = () => {
    if (!isMuted) {
      speakText("Let's begin. Follow along at your own pace.", 0.9);
    }
    onStart();
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (isMuted) {
      speakText(guide.introVoice, 0.85);
    } else {
      window.speechSynthesis?.cancel();
    }
  };

  if (!showGuide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="bg-gradient-to-br from-violet-950 to-purple-950 border-white/20 text-white overflow-hidden">
            {/* Header with Lumi */}
            <div className="relative p-6 pb-4 bg-gradient-to-r from-violet-900/50 to-purple-900/50">
              <button
                onClick={() => setShowGuide(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-4">
                <LumiCharacter size="lg" mood="happy" animate={true} />
                <div>
                  <h2 className="text-xl font-bold">{guide.title}</h2>
                  <p className="text-sm text-white/70">{guide.description}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Quick Info */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-rose-300" />
                  <span className="text-sm">{guide.duration}</span>
                </div>
                <button
                  onClick={handleMuteToggle}
                  className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 hover:bg-white/20 transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-2">
                  Benefits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {guide.benefits.map((benefit, i) => (
                    <span
                      key={i}
                      className="bg-white/10 px-3 py-1 rounded-full text-xs"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps Preview */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-2">
                  What to expect
                </h3>
                <div className="space-y-2">
                  {guide.steps.slice(0, 3).map((step, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 rounded-lg p-3">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-white/60">{step.description}</p>
                      </div>
                    </div>
                  ))}
                  {guide.steps.length > 3 && (
                    <p className="text-xs text-white/40 text-center">
                      + {guide.steps.length - 3} more steps
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                onClick={onSkip}
              >
                Skip Guide
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-rose-400 via-purple-500 to-indigo-500 text-white"
                onClick={handleStart}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}