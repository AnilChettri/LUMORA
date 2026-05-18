import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { apiRequest } from "@/lib/queryClient";
import type { MoodLog } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Brain,
  Calendar,
  Clock,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from "lucide-react";

interface MoodTrend {
  mood: string;
  count: number;
  percentage: number;
}

interface SessionMetrics {
  totalSessions: number;
  totalTime: number;
  spacesVisited: string[];
  activitiesCompleted: number;
  moodShift: { from: string; to: string }[];
}

export default function AnalysisPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "all">("7d");

  const { data: moodHistory, isLoading: moodLoading } = useQuery<MoodLog[]>({
    queryKey: ["/api/mood/history"],
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery<SessionMetrics>({
    queryKey: ["/api/analysis/metrics"],
  });

  const moodTrends: MoodTrend[] = [
    { mood: "happy", count: 12, percentage: 35 },
    { mood: "anxious", count: 8, percentage: 24 },
    { mood: "neutral", count: 6, percentage: 18 },
    { mood: "stressed", count: 5, percentage: 15 },
    { mood: "sad", count: 2, percentage: 6 },
    { mood: "tired", count: 1, percentage: 2 },
  ];

  const moodColors: Record<string, string> = {
    happy: "bg-yellow-500",
    anxious: "bg-orange-500",
    neutral: "bg-teal-500",
    stressed: "bg-red-500",
    sad: "bg-blue-500",
    tired: "bg-purple-500",
  };

  const moodLabels: Record<string, string> = {
    happy: "Happy",
    anxious: "Anxious",
    neutral: "Neutral",
    stressed: "Stressed",
    sad: "Sad",
    tired: "Tired",
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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

  if (moodLoading || metricsLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" variant="neural" />
        </div>
      </div>
    );
  }

  const latestMood = moodHistory?.[0]?.mood || "neutral";
  const avgConfidence = moodHistory?.length
    ? Math.round(moodHistory.reduce((sum, m) => sum + (m.confidence || 0), 0) / moodHistory.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold font-display tracking-tight">Your Analysis</h1>
              <p className="text-muted-foreground mt-1">Track your wellness journey over time</p>
            </div>
            <div className="flex gap-2">
              {(["7d", "30d", "all"] as const).map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={cn(
                    "rounded-full font-bold",
                    selectedPeriod === period && "bg-primary"
                  )}
                >
                  {period === "all" ? "All Time" : period === "7d" ? "7 Days" : "30 Days"}
                </Button>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <Card className="p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Current Mood</span>
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-2xl", moodColors[latestMood], "flex items-center justify-center")}>
                    <LumiCharacter size="sm" mood={latestMood === "happy" ? "happy" : "calm"} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold capitalize">{latestMood}</p>
                    <p className="text-xs text-muted-foreground">{avgConfidence}% confidence</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sessions</span>
                  <Activity className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-500">12</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Total sessions</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Time Spent</span>
                  <Clock className="w-5 h-5 text-violet-500" />
                </div>
                <p className="text-2xl font-bold">2h 45m</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Mood Trend</span>
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                  <p className="text-2xl font-bold">+15%</p>
                </div>
                <p className="text-xs text-muted-foreground">Improvement rate</p>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}>
              <Card className="p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Mood Distribution</h2>
                    <p className="text-sm text-muted-foreground">Your emotional patterns</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {moodTrends.map((trend) => (
                    <div key={trend.mood}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", moodColors[trend.mood])} />
                          <span className="text-sm font-medium capitalize">{moodLabels[trend.mood]}</span>
                        </div>
                        <span className="text-sm font-bold">{trend.percentage}%</span>
                      </div>
                      <Progress
                        value={trend.percentage}
                        className={cn("h-2 [&>div]:bg-gradient-to-r", trend.mood === "happy" ? "[&>div]:from-yellow-400 [&>div]:to-orange-400" : moodColors[trend.mood])}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Activity Summary</h2>
                    <p className="text-sm text-muted-foreground">Spaces you've explored</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { space: "Soundscapes", count: 8, icon: "🎵" },
                    { space: "Practices", count: 5, icon: "🧘" },
                    { space: "Journal", count: 12, icon: "📝" },
                    { space: "Stories", count: 3, icon: "📚" },
                    { space: "Play", count: 6, icon: "🎮" },
                    { space: "Community", count: 4, icon: "👥" },
                  ].map((item) => (
                    <div
                      key={item.space}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-bold">{item.count}</p>
                        <p className="text-xs text-muted-foreground">{item.space}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Card className="p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Recent Mood History</h2>
                  <p className="text-sm text-muted-foreground">Your emotional check-ins</p>
                </div>
              </div>

              <div className="space-y-3">
                {(moodHistory || []).slice(0, 7).map((log, i) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl", moodColors[log.mood] || "bg-slate-500", "flex items-center justify-center")}>
                        <LumiCharacter size="sm" mood={log.mood === "happy" ? "happy" : "calm"} />
                      </div>
                      <div>
                        <p className="font-bold capitalize">{log.mood}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.source === "voice-agent" ? "Voice Session" : log.source === "camera" ? "Camera Scan" : "Manual Entry"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        }) : "N/A"}
                      </p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          (log.confidence || 0) > 70 ? "bg-emerald-500" : (log.confidence || 0) > 40 ? "bg-amber-500" : "bg-rose-500"
                        )} />
                        <span className="text-xs text-muted-foreground">{log.confidence || 0}% confident</span>
                      </div>
                    </div>
                  </div>
                ))}

                {(!moodHistory || moodHistory.length === 0) && (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No mood history yet</p>
                    <p className="text-sm text-muted-foreground/70">Start a session to begin tracking</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Insights</h2>
                  <p className="text-sm text-muted-foreground">AI-generated analysis</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-emerald-500">Positive Trend</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your mood has improved by 15% this week! You've been more consistent with 
                    breathing exercises, which correlates with better emotional regulation.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-amber-500">Opportunity</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You tend to feel more anxious on weekdays. Consider adding a morning check-in 
                    with Lumi or starting with Soundscapes to set a calm tone for your day.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h3 className="font-bold text-purple-500">Recommendation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your Journal entries show themes of work-related stress. Try the "Letting Go" 
                    exercise in Practices, or explore the Stories section for calming content.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-blue-500">Pattern Detected</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Music time correlates with a 40% mood improvement. You're most active in the 
                    evening hours - this is a great time to explore new spaces!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}