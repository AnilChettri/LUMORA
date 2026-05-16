import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { runImmediateMoodPlan, getPlanPreviewForMood } from "@/lib/moodInterventions";
import { Badge } from "@/components/ui/badge";
import { Onboarding } from "@/components/Onboarding";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { BrainVisualization } from "@/components/animations/BrainVisualization";
import { LoadingSkeleton } from "@/components/animations/LoadingSpinner";
import { SmartRecommendations } from "@/components/SmartRecommendations";
import { useSessionState, getGreetingScript, getSessionResumeScript } from "@/hooks/useSessionState";
import { speakText } from "@/lib/aiMocks";
import type { MoodType, Post } from "@shared/schema";
import {
  Music4,
  Sparkle,
  HeartPulse,
  Joystick,
  UsersRound,
  MicVocal,
  NotebookPen,
  BrainCircuit,
  Stars,
  Wind,
  MoonStar,
  Sunrise,
  TrendingUp,
  ArrowUpRight,
  MessageSquareMore,
  Heart as HeartIcon,
} from "lucide-react";

const spaces = [
  {
    id: "music",
    path: "/music",
    icon: Music4,
    label: "Soundscapes",
    description: "Curated calm mixes",
    gradient: "from-rose-300 to-fuchsia-400",
    bgGradient: "from-rose-100/45 via-fuchsia-100/30 to-rose-50/30 dark:from-rose-950/20 dark:to-fuchsia-950/20",
  },
  {
    id: "books",
    path: "/books",
    icon: Sparkle,
    label: "Stories",
    description: "Inspiring reads",
    gradient: "from-amber-300 to-orange-400",
    bgGradient: "from-amber-100/45 via-orange-100/30 to-amber-50/30 dark:from-amber-950/20 dark:to-orange-950/20",
  },
  {
    id: "exercises",
    path: "/exercises",
    icon: HeartPulse,
    label: "Practices",
    description: "Mindful moments",
    gradient: "from-teal-300 to-emerald-400",
    bgGradient: "from-teal-100/40 via-emerald-100/28 to-teal-50/30 dark:from-teal-950/20 dark:to-emerald-950/20",
  },
  {
    id: "games",
    path: "/games",
    icon: Joystick,
    label: "Play",
    description: "Lighthearted fun",
    gradient: "from-sky-300 to-indigo-400",
    bgGradient: "from-sky-100/40 via-indigo-100/28 to-sky-50/30 dark:from-sky-950/20 dark:to-indigo-950/20",
  },
  {
    id: "community",
    path: "/community",
    icon: UsersRound,
    label: "Community",
    description: "Support circle",
    gradient: "from-violet-300 to-purple-400",
    bgGradient: "from-violet-100/40 via-purple-100/28 to-violet-50/30 dark:from-violet-950/20 dark:to-purple-950/20",
  },
  {
    id: "journal",
    path: "/journal",
    icon: NotebookPen,
    label: "Journal",
    description: "Daily reflections",
    gradient: "from-indigo-300 to-blue-400",
    bgGradient: "from-indigo-100/40 via-blue-100/28 to-indigo-50/30 dark:from-indigo-950/20 dark:to-blue-950/20",
  },
];

const quickTools = [
  { id: "breathing", icon: Wind, label: "Breathing", path: "/exercises?type=breathing" },
  { id: "grounding", icon: Stars, label: "Grounding", path: "/exercises?type=grounding" },
  { id: "sleep", icon: MoonStar, label: "Sleep Ritual", path: "/exercises?type=sleep" },
  { id: "energy", icon: Sunrise, label: "Energy Boost", path: "/exercises?type=energy" },
];

const moodLabels: Record<MoodType, { label: string; emoji: string }> = {
  happy: { label: "Happy", emoji: "Feeling Good" },
  sad: { label: "Sad", emoji: "Feeling Down" },
  anxious: { label: "Anxious", emoji: "Feeling Worried" },
  tired: { label: "Tired", emoji: "Low Energy" },
  stressed: { label: "Stressed", emoji: "Under Pressure" },
  neutral: { label: "Neutral", emoji: "Balanced" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);
  const [, setLocation] = useLocation();
  const { session, hasIncompleteSession, endSession } = useSessionState();
  const [hasSpokenGreeting, setHasSpokenGreeting] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  const { data: moodData } = useQuery<{ mood: MoodType; confidence: number }>({
    queryKey: ["/api/mood/current"],
    retry: false,
  });

  const { data: trendingPosts } = useQuery<Post[]>({
    queryKey: ["/api/posts/trending"],
    retry: false,
  });

  const currentMood = moodData?.mood || (user?.currentMood as MoodType) || "neutral";
  const greeting = getGreeting();
  const firstName = user?.firstName || "Friend";

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    completeOnboarding();
  };

  const handleStartGuidedSession = () => {
    runImmediateMoodPlan(currentMood, setLocation);
  };

  const handleResumeSession = useCallback(() => {
    if (session.type === "exercise" && session.exerciseId) {
      const params = new URLSearchParams();
      params.set("type", session.exerciseCategory || "breathing");
      params.set("exerciseId", session.exerciseId);
      params.set("autoStart", "true");
      setLocation(`/exercises?${params.toString()}`);
    } else if (session.type === "game") {
      setLocation(`/games?game=${session.exerciseId}&autoStart=true`);
    } else if (session.type === "music") {
      setLocation(`/music?mood=calm&autoPlay=true`);
    }
    setShowResumePrompt(false);
  }, [session, setLocation]);

  const handleStartNewSession = () => {
    endSession();
    setShowResumePrompt(false);
    runImmediateMoodPlan(currentMood, setLocation);
  };

  useEffect(() => {
    const autoPlayConsent = localStorage.getItem("tts-auto-play-consent");
    if (autoPlayConsent === "true" && !hasSpokenGreeting && hasCompletedOnboarding) {
      const greetingText = getGreetingScript(currentMood, greeting);
      
      setTimeout(() => {
        speakText(greetingText, 0.9);
        setHasSpokenGreeting(true);
        
        setTimeout(() => {
          if (hasIncompleteSession) {
            setShowResumePrompt(true);
          }
        }, 2000);
      }, 500);
    } else if (hasIncompleteSession) {
      setShowResumePrompt(true);
    }
  }, [currentMood, greeting, hasSpokenGreeting, hasCompletedOnboarding, hasIncompleteSession]);

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      
      {showResumePrompt && hasIncompleteSession && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowResumePrompt(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mx-4 w-full max-w-md rounded-3xl border border-white/20 bg-gradient-to-br from-violet-950 to-purple-950 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <LumiCharacter size="md" mood="listening" />
              <div>
                <h3 className="text-lg font-semibold text-white">Welcome back!</h3>
                <p className="text-sm text-white/70">
                  {getSessionResumeScript(session.exerciseId || "session")}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                onClick={handleStartNewSession}
              >
                Start Fresh
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-rose-400 via-purple-500 to-indigo-500 text-white"
                onClick={handleResumeSession}
              >
                Continue Session
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Screen>
        <Header />

        <motion.div
          className="container px-4 py-8 max-w-7xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Welcome Section */}
          <motion.section
            variants={itemVariants}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <motion.p 
                  className="text-xs font-bold uppercase tracking-[0.4em] text-primary/80 dark:text-primary/60"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {greeting}
                </motion.p>
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground/90">
                  Hi, <span className="gradient-text">{firstName}</span>
                </h1>
                <p className="text-muted-foreground text-fluid-p max-w-lg">
                  Lumi is here to tune your space. How are you feeling today?
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="super-glass px-5 py-3 rounded-3xl flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Current Mood</span>
                    <span className={`text-sm font-bold mood-${currentMood}-text capitalize`}>{moodLabels[currentMood].label}</span>
                  </div>
                  <Badge
                    className={`mood-${currentMood} w-10 h-10 rounded-2xl flex items-center justify-center p-0 shadow-lg border-none`}
                  >
                    <img src="/Quantum Shift.jpg" alt="Mood" className="w-6 h-6 rounded-full object-cover" />
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="h-14 px-8 rounded-2xl text-base font-bold bg-primary text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.5)] hover:scale-105 hover:shadow-[0_15px_35px_-10px_hsl(var(--primary)/0.6)] transition-all duration-300"
                onClick={handleStartGuidedSession}
              >
                <BrainCircuit className="h-5 w-5 mr-3" />
                Start Guided Session
              </Button>
              
              <Link href="/voice">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <MicVocal className="h-5 w-5 mr-3 text-primary" />
                  Talk to Lumi
                </Button>
              </Link>
            </div>
          </motion.section>

          {/* Featured Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Quick Tools - Spans 4 cols */}
            <motion.section variants={itemVariants} className="lg:col-span-4 h-full">
              <div className="super-glass h-full rounded-[2.5rem] p-8 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold font-display">Refuge</h2>
                  <Sparkle className="text-primary/40 h-5 w-5" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {quickTools.map((tool) => (
                    <Link key={tool.id} href={tool.path}>
                      <motion.div 
                        className="group relative h-32 rounded-3xl overflow-hidden cursor-pointer"
                        whileHover={{ y: -5 }}
                      >
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                          <div className="p-3 rounded-2xl bg-background/50 backdrop-blur-md group-hover:scale-110 transition-transform shadow-sm">
                            <tool.icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-xs font-bold">{tool.label}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Smart Recommendations - Spans 8 cols */}
            <motion.section variants={itemVariants} className="lg:col-span-8">
              <div className="super-glass rounded-[2.5rem] p-8 h-full">
                <SmartRecommendations mood={currentMood} timeOfDay={greeting} />
              </div>
            </motion.section>
          </div>

          {/* Spaces Carousel/Grid */}
          <motion.section variants={itemVariants} className="mb-12">
            <div className="flex items-end justify-between mb-8 px-2">
              <div>
                <h2 className="text-3xl font-bold font-display tracking-tight">Explore Spaces</h2>
                <p className="text-muted-foreground mt-1">Choose your environment</p>
              </div>
              <Link href="/spaces">
                <Button variant="ghost" className="rounded-full font-bold text-primary hover:text-primary hover:bg-primary/10">
                  View All <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaces.map((space, idx) => (
                <Link key={space.id} href={space.path}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group relative aspect-[4/3] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
                  >
                    {/* Dynamic Gradient Background */}
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity duration-500", space.bgGradient)} />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-500")}>
                        <space.icon className="h-7 w-7 text-white" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white drop-shadow-md">{space.label}</h3>
                        <p className="text-white/80 text-sm font-medium line-clamp-1">{space.description}</p>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute -inset-2 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity pointer-events-none" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Trending Community - Modern List */}
          <motion.section variants={itemVariants}>
            <div className="super-glass rounded-[3rem] p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-rose-500" />
                  </div>
                  <h2 className="text-2xl font-bold font-display">Community Pulse</h2>
                </div>
                <Link href="/community">
                  <Button variant="outline" className="rounded-full border-primary/20 hover:bg-primary/5">
                    Join Conversation
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4">
                {trendingPosts && trendingPosts.length > 0 ? (
                  trendingPosts.slice(0, 3).map((post, idx) => (
                    <Link key={post.id} href={`/community/post/${post.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="group flex items-center gap-6 p-6 rounded-[2rem] hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/10"
                      >
                        <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-background border border-border items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.id}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">{post.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-1 mt-1">{post.content}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex items-center gap-2 text-muted-foreground/60 text-sm font-bold">
                            <HeartIcon className="h-4 w-4" />
                            <span>{post.upvotes}</span>
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <UsersRound className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                    <p className="text-muted-foreground">The circle is quiet. Start a ripple!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        </motion.div>
      </Screen>
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getSuggestionForMood(mood: MoodType): string {
  const suggestions: Record<MoodType, string> = {
    happy: "You seem to be in a great mood! How about sharing some positivity in the community or exploring our music collection?",
    sad: "I'm here for you. Would you like to try a gentle breathing exercise or write about your feelings in your journal?",
    anxious: "Let's take a moment to calm those worries. I recommend our 4-7-8 breathing exercise - it's very soothing.",
    tired: "Rest is important. Consider a short meditation or some calming music to help you recharge.",
    stressed: "Take a deep breath with me. Our grounding exercises can help you feel more centered and present.",
    neutral: "A balanced day ahead! Why not explore something new - maybe a story from our reading collection?",
  };
  return suggestions[mood];
}

function getSuggestionPath(mood: MoodType): string {
  const paths: Record<MoodType, string> = {
    happy: "/community",
    sad: "/exercises?type=breathing",
    anxious: "/exercises?type=breathing",
    tired: "/exercises?type=meditation",
    stressed: "/exercises?type=grounding",
    neutral: "/books",
  };
  return paths[mood];
}
