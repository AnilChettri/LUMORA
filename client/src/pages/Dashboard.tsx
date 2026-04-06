import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { runImmediateMoodPlan } from "@/lib/moodInterventions";
import { Badge } from "@/components/ui/badge";
import { Onboarding } from "@/components/Onboarding";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { BrainVisualization } from "@/components/animations/BrainVisualization";
import { LoadingSkeleton } from "@/components/animations/LoadingSpinner";
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

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      <Screen>
        <div className="pointer-events-none absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#05000f]/80 via-[#0c0220]/82 to-[#12052f]/90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(136,78,255,0.35),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,120,196,0.18),transparent_65%)]" />
        </div>

        <Header />

        <motion.div
          className="container px-4 py-6 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          variants={containerVariants}
        >
          {/* App-style home header */}
          <motion.section
            variants={itemVariants}
            className="mb-10 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between text-white/85">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                  {greeting}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Hi, {firstName}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 border border-white/20">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                    Mood
                  </span>
                  <Badge
                    variant="secondary"
                    className={`mood-${currentMood} text-foreground px-3 py-1 text-xs`}
                  >
                    {moodLabels[currentMood].label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-white/85">
              <p className="text-sm text-white/80 max-w-md">
                Lumi can start a short guided session based on how you feel, or you can just log your mood.
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  size="lg"
                  className="flex-1 rounded-2xl py-4 text-base font-semibold bg-gradient-to-r from-[#f472b6] via-[#c084fc] to-[#818cf8] text-white shadow-lg shadow-rose-400/30 hover:scale-[1.01] transition"
                  onClick={handleStartGuidedSession}
                  data-testid="button-start-guided-session"
                >
                  <BrainCircuit className="h-4 w-4 mr-2" />
                  Start guided session
                </Button>

                <div className="flex flex-1 gap-2">
                  <Link href="/mood">
                    <Button
                      size="sm"
                      className="w-full gap-2 rounded-2xl border border-white/30 bg-white/10 text-white hover:bg-white/20"
                      data-testid="button-check-mood"
                    >
                      <motion.div
                        className="h-5 w-5 overflow-hidden rounded-full"
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <img src="/Quantum Shift.jpg" alt="Mood" className="h-full w-full object-cover" />
                      </motion.div>
                      Log mood
                    </Button>
                  </Link>
                  <Link href="/voice">
                    <Button
                      size="sm"
                      className="w-full gap-2 rounded-2xl bg-white/10 text-white border border-white/30 hover:bg-white/20"
                      data-testid="button-talk-lumi"
                    >
                      <MicVocal className="h-4 w-4" />
                      Talk to Lumi
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
                <span>Daily check-in keeps your space tuned to you.</span>
              </div>
            </div>
          </motion.section>

          {/* Lumi's Suggestions */}
          <motion.section variants={itemVariants} className="mb-10">
            <div className="rounded-3xl border border-white/16 bg-white/8 px-6 py-8 backdrop-blur-2xl shadow-[0_20px_55px_rgba(30,5,70,0.45)] text-white">
              <div className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                <Stars className="h-4 w-4 text-rose-200" />
                Lumi's Suggestions
              </div>
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="shrink-0"><LumiCharacter size="sm" mood="calm" animate={false} /></div>
                  <p className="text-sm text-white/78 md:max-w-md">{getSuggestionForMood(currentMood)}</p>
                </div>
                <Link href={getSuggestionPath(currentMood)}>
                  <Button variant="ghost" size="sm" className="self-start gap-1 rounded-full border border-white/20 px-5 text-white/85 hover:text-white">
                    Try it now
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Quick Tools */}
          <motion.section variants={itemVariants} className="mb-10">
            <div className="rounded-3xl border border-white/14 bg-white/8 px-6 py-8 backdrop-blur-2xl shadow-[0_18px_50px_rgba(26,4,60,0.45)] text-white">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="text-xl font-semibold">Quick Wellness Tools</h2>
                <span className="text-xs uppercase tracking-[0.32em] text-white/60">Breathe • Ground • Rest</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {quickTools.map((tool) => (
                  <Link key={tool.id} href={tool.path}>
                    <div className="group flex h-full flex-col items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-5 transition hover:border-white/25 hover:bg-white/16">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#f472b6] via-[#c084fc] to-[#818cf8] text-slate-900 shadow-lg shadow-rose-400/30 group-hover:scale-105 transition-transform">
                        <tool.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">{tool.label}</h3>
                        <p className="text-xs text-white/70">Tap to start in under a minute</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Spaces Overview */}
          <motion.section variants={itemVariants} className="mb-10">
            <div className="rounded-3xl border border-white/16 bg-white/8 px-6 py-8 backdrop-blur-2xl shadow-[0_22px_55px_rgba(24,4,66,0.5)] text-white">
              <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Explore Spaces</h2>
                  <p className="text-sm text-white/75">Choose the environment that matches how you’d like to feel next.</p>
                </div>
                <Link href="/spaces" className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                  View all spaces
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {spaces.map((space) => (
                  <Link key={space.id} href={space.path}>
                    <div className="group flex h-full flex-col gap-4 rounded-2xl border border-white/14 bg-white/10 px-6 py-6 transition hover:border-white/25 hover:bg-white/16">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${space.gradient} text-slate-900 shadow-lg shadow-rose-400/25 transition-transform group-hover:scale-105`}>
                        <space.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1 text-left">
                        <h3 className="text-lg font-semibold text-white">{space.label}</h3>
                        <p className="text-sm text-white/75">{space.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Trending Posts */}
          <motion.section variants={itemVariants}>
            <div className="rounded-3xl border border-white/16 bg-white/8 px-6 py-8 backdrop-blur-2xl shadow-[0_22px_55px_rgba(20,3,55,0.45)] text-white">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <TrendingUp className="h-5 w-5 text-rose-200" />
                  Trending in Community
                </h2>
                <Link href="/community" className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
                  View all
                </Link>
              </div>
              <div className="space-y-4">
                {trendingPosts && trendingPosts.length > 0 ? (
                  trendingPosts.slice(0, 3).map((post) => (
                    <Link key={post.id} href={`/community/post/${post.id}`}>
                      <div className="rounded-2xl border border-white/12 bg-white/10 px-5 py-4 transition hover:border-white/22 hover:bg-white/16">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-semibold text-white">{post.title}</h3>
                            <p className="mt-1 line-clamp-1 text-sm text-white/75">{post.content}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-xs font-semibold text-white/70">
                            <MessageSquareMore className="h-4 w-4" />
                            <HeartIcon className="h-4 w-4" />
                            <span>{post.upvotes}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/12 bg-white/10 px-6 py-8 text-center text-white/75">
                    <UsersRound className="mx-auto mb-3 h-8 w-8 text-white/60" />
                    <p>No posts yet. Be the first to share!</p>
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
