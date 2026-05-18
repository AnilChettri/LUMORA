import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { speakText } from "@/lib/aiMocks";
import { 
  ChevronRight, 
  Sparkles,
  Music,
  BookOpen,
  HeartPulse,
  Joystick,
  UsersRound,
  NotebookPen,
  CheckCircle,
  ArrowRight,
  Clock,
  X,
} from "lucide-react";

const SPACE_POPUP_TIME = 20;

type TourPhase = "intro" | "driving" | "complete";

interface SpaceConfig {
  id: string;
  path: string;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  agentIntro: string;
  agentExploration: string;
}

const spaces: SpaceConfig[] = [
  {
    id: "music",
    path: "/music",
    label: "Soundscapes",
    description: "Curated calming music",
    icon: Music,
    gradient: "from-rose-400 to-pink-500",
    agentIntro: "Welcome to Soundscapes! Let me play some calming music for you.",
    agentExploration: "Music can help regulate your emotions. Feel the rhythm and let it soothe your soul.",
  },
  {
    id: "exercises",
    path: "/exercises",
    label: "Practices",
    description: "Mindful exercises",
    icon: HeartPulse,
    gradient: "from-teal-400 to-emerald-500",
    agentIntro: "Now let's practice some breathing exercises together.",
    agentExploration: "Breathe in for 4 seconds, hold for 7, exhale for 8. Feel the tension leaving your body.",
  },
  {
    id: "journal",
    path: "/journal",
    label: "Journal",
    description: "Express your thoughts",
    icon: NotebookPen,
    gradient: "from-indigo-400 to-blue-500",
    agentIntro: "Time to reflect. Write down what's on your mind.",
    agentExploration: "Journaling helps process emotions. Let your thoughts flow freely onto the page.",
  },
  {
    id: "books",
    path: "/books",
    label: "Stories",
    description: "Inspiring reads",
    icon: BookOpen,
    gradient: "from-amber-400 to-orange-500",
    agentIntro: "Here's a story that might resonate with you right now.",
    agentExploration: "Stories have the power to heal, inspire, and transform how we see the world.",
  },
  {
    id: "games",
    path: "/games",
    label: "Play",
    description: "Lighthearted fun",
    icon: Joystick,
    gradient: "from-sky-400 to-indigo-500",
    agentIntro: "Let's have some fun! Games can be a great way to lift your energy.",
    agentExploration: "Play releases endorphins and gives your mind a break from worries.",
  },
  {
    id: "community",
    path: "/community",
    label: "Community",
    description: "Support circle",
    icon: UsersRound,
    gradient: "from-violet-400 to-purple-500",
    agentIntro: "You're not alone. Let's see what our community is sharing.",
    agentExploration: "Connecting with others who understand can make all the difference.",
  },
];

interface SpaceTourProps {
  initialMood: string;
  verifiedMood: string;
  onComplete: () => void;
}

export function SpaceTour({ initialMood, verifiedMood, onComplete }: SpaceTourProps) {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<TourPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [agentMessage, setAgentMessage] = useState("");
  const [showNavigation, setShowNavigation] = useState(true);
  const [showSpacePopup, setShowSpacePopup] = useState(false);
  const [timeInCurrentSpace, setTimeInCurrentSpace] = useState(0);
  const [spaceActivity, setSpaceActivity] = useState<Record<string, { timeSpent: number; interactions: number }>>({});
  const spaceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activityStartRef = useRef<number>(Date.now());

  const currentSpace = spaces[currentIndex];
  const progress = ((currentIndex + 1) / spaces.length) * 100;

  const formatMood = (mood: string) => mood.charAt(0).toUpperCase() + mood.slice(1);

  useEffect(() => {
    if (phase !== "driving") return;
    
    activityStartRef.current = Date.now();
    setTimeInCurrentSpace(0);
    setShowSpacePopup(false);

    const timer = setInterval(() => {
      setTimeInCurrentSpace(prev => {
        const newTime = prev + 1;
        if (newTime >= SPACE_POPUP_TIME && !showSpacePopup) {
          setShowSpacePopup(true);
        }
        return newTime;
      });
    }, 1000);

    spaceTimerRef.current = timer;

    return () => {
      if (spaceTimerRef.current) {
        clearInterval(spaceTimerRef.current);
      }
    };
  }, [phase, currentIndex]);

  const recordActivity = useCallback(() => {
    const timeSpent = Date.now() - activityStartRef.current;
    setSpaceActivity(prev => ({
      ...prev,
      [currentSpace.id]: {
        timeSpent: (prev[currentSpace.id]?.timeSpent || 0) + timeSpent,
        interactions: (prev[currentSpace.id]?.interactions || 0) + 1
      }
    }));
    activityStartRef.current = Date.now();
  }, [currentSpace.id]);

  const generateAgentNote = () => {
    const notes: Record<string, string[]> = {
      happy: [
        "Remember that joy you're feeling? Hold onto it. Revisit these spaces whenever you need a boost.",
        "Your positive energy is contagious. Keep shining bright!",
        "Continue exploring what brings you joy. This is just the beginning.",
      ],
      sad: [
        "It's okay to feel sad. You've taken an important step by being here.",
        "The Soundscapes and Journal are great tools for gentle self-care when feeling down.",
        "Remember, sadness is temporary. I'll be here whenever you're ready to talk.",
      ],
      anxious: [
        "When anxiety rises, try the breathing exercises. They can help ground you in moments of worry.",
        "The Soundscapes are designed specifically to help calm an anxious mind.",
        "You've shown courage by engaging with these spaces. That's a big step forward.",
      ],
      tired: [
        "Rest is not a luxury, it's a necessity. Let the Soundscapes guide you to relaxation.",
        "Your energy will return. Until then, gentle activities can be restorative.",
        "Be gentle with yourself. Some days are for productivity, others are for healing.",
      ],
      stressed: [
        "Stress can feel overwhelming, but you have tools now. The grounding exercises help.",
        "One step at a time. The Journal is a great place to unload what's weighing on you.",
        "You've done the hard work of recognizing stress. These spaces can build your resilience.",
      ],
      neutral: [
        "This is a great baseline. Regular check-ins help maintain balance.",
        "Even when feeling balanced, these spaces offer opportunities for growth.",
        "Your self-awareness is impressive. Keep nurturing this connection with yourself.",
      ],
    };
    const noteArray = notes[verifiedMood] || notes.neutral;
    return noteArray[Math.floor(Math.random() * noteArray.length)];
  };

  const displayAgentMessage = useCallback((message: string) => {
    setAgentMessage(message);
    speakText(message, 0.8);
  }, []);

  const startTour = useCallback(() => {
    setPhase("driving");
    displayAgentMessage(`Hello! I'm Lumi, and I'll be guiding you through your wellness journey today. I understand you're feeling ${formatMood(verifiedMood)}. Let's explore some spaces together that are designed just for you. ${currentSpace.agentIntro}`);
  }, [displayAgentMessage, verifiedMood, currentSpace]);

  const goToNextSpace = useCallback(() => {
    recordActivity();
    setShowSpacePopup(false);
    if (currentIndex < spaces.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextSpace = spaces[nextIndex];
      displayAgentMessage(nextSpace.agentIntro);
    } else {
      setPhase("complete");
      console.log("Space activity summary:", spaceActivity);
      displayAgentMessage("We've explored all the wellness spaces together. Take a moment to absorb what you've experienced. I'll now share some final thoughts with you.");
    }
  }, [currentIndex, displayAgentMessage, recordActivity, spaceActivity]);

  const stayInCurrentSpace = useCallback(() => {
    setShowSpacePopup(false);
    displayAgentMessage(currentSpace.agentExploration);
  }, [currentSpace, displayAgentMessage]);

  const visitSpace = useCallback((path: string) => {
    recordActivity();
    setLocation(path);
  }, [recordActivity, setLocation]);

  useEffect(() => {
    if (phase === "driving") {
      const timer = setTimeout(() => {
        setShowNavigation(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase, currentIndex]);

  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 max-w-lg w-full text-center"
        >
          <motion.div
            className="relative mb-8"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl" />
              <div className="relative z-10">
                <LumiCharacter size="lg" mood="happy" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Agent-Guided Journey
          </motion.div>

          <motion.h1 
            className="text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            I'm Your Guide, <span className="gradient-text">Lumi</span>
          </motion.h1>

          <motion.p 
            className="text-white/60 text-lg mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Based on our conversation, I sense you're feeling <span className="text-purple-400 font-bold">{formatMood(verifiedMood)}</span>
          </motion.p>

          <motion.p 
            className="text-white/40 text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            I'll personally guide you through 6 wellness spaces
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-8"
          >
            <p className="text-white/70 mb-4">
              Each space is carefully selected to match your emotional state. I'll be with you every step of the way.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {spaces.map((s, i) => (
                <span key={s.id} className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/50">
                  {i + 1}. {s.label}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={startTour}
              className="h-14 px-8 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Begin Guided Tour
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={onComplete}
              variant="outline"
              className="h-14 px-8 rounded-2xl border-white/20 text-white/70 hover:bg-white/10"
            >
              Skip
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (phase === "driving") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
        />

        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
              <span>Space {currentIndex + 1} of {spaces.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-2xl w-full"
        >
          <motion.div
            className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 rounded-3xl p-6 border border-purple-500/30 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <LumiCharacter size="sm" mood="listening" />
              </div>
              <div>
                <p className="text-white/90 text-lg font-medium">{agentMessage || currentSpace.agentIntro}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            key={currentSpace.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div 
              className={cn(
                "relative overflow-hidden rounded-3xl bg-gradient-to-br p-1",
                `bg-gradient-to-br ${currentSpace.gradient}`
              )}
            >
              <div className="bg-slate-900/90 rounded-[1.5rem] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", `bg-gradient-to-br ${currentSpace.gradient}`)}>
                    <currentSpace.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase">{currentIndex + 1} / {spaces.length}</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{currentSpace.label}</h2>
                <p className="text-white/60 text-lg mb-6">{currentSpace.description}</p>
                <Button
                  onClick={() => visitSpace(currentSpace.path)}
                  className={cn("w-full h-12 rounded-xl font-bold", `bg-gradient-to-r ${currentSpace.gradient}`)}
                >
                  Explore This Space
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {showNavigation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-between mt-8"
              >
                <div className="flex gap-2">
                  {spaces.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCurrentIndex(i);
                        displayAgentMessage(spaces[i].agentIntro);
                      }}
                      className={cn(
                        "flex-shrink-0 w-3 h-3 rounded-full transition-all",
                        i === currentIndex ? "bg-purple-500 scale-125" : "bg-white/20 hover:bg-white/40"
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={goToNextSpace}
                    className="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                  >
                    {currentIndex < spaces.length - 1 ? <>Next Space <ChevronRight className="w-4 h-4 ml-2" /></> : "Finish Tour"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="absolute bottom-4 left-0 right-0 text-center">
          <button onClick={onComplete} className="text-white/30 text-sm hover:text-white/50 transition-colors">
            End Tour Early
          </button>
        </div>

        <AnimatePresence>
          {showSpacePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <Card className="bg-slate-900 border-purple-500/30 rounded-3xl p-8 max-w-md mx-4">
                  <div className="flex items-center justify-between mb-6">
                    <LumiCharacter size="md" mood="listening" />
                    <div className="flex items-center gap-2 text-white/40">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold">{timeInCurrentSpace}s</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white text-center mb-4">
                    Continue or Move On?
                  </h3>
                  <p className="text-white/60 text-center mb-8">
                    You've been in {currentSpace.label} for 20 seconds. Would you like to explore another space or stay here longer?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={goToNextSpace}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl border-white/20 text-white/70 font-bold"
                    >
                      Next Space
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={stayInCurrentSpace}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                    >
                      Stay Here
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (phase === "complete") {
    const agentNote = generateAgentNote();
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-32 h-32 mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full blur-2xl" />
            <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-white mb-2">Tour Complete!</h2>
            <p className="text-white/60 text-lg mb-8">
              You did amazing exploring all the spaces with me.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 rounded-2xl p-6 border border-purple-500/30 mb-8"
          >
            <div className="flex items-start gap-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <LumiCharacter size="sm" mood="calm" />
              </div>
              <div>
                <p className="text-white/80 font-medium mb-2">My Note for You</p>
                <p className="text-white/60 text-sm leading-relaxed">{agentNote}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-8"
          >
            <p className="text-white/50 text-sm">
              Your mood journey: <span className="text-purple-400">{formatMood(initialMood)}</span> → <span className="text-green-400">{formatMood(verifiedMood)}</span>
            </p>
          </motion.div>

          <Button
            onClick={onComplete}
            className="h-14 px-10 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg"
          >
            Go to Dashboard
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return null;
}