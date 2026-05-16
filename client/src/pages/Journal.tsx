import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner, LoadingSkeleton } from "@/components/animations/LoadingSpinner";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { soundManager } from "@/lib/soundManager";
import type { Journal, MoodType } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  PenLine,
  Plus,
  Calendar,
  Heart,
  Sparkles,
  ChevronRight,
  Clock,
  BookOpen,
} from "lucide-react";

const moodOptions: { value: MoodType; label: string; color: string }[] = [
  { value: "happy", label: "Happy", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200" },
  { value: "sad", label: "Sad", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" },
  { value: "anxious", label: "Anxious", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200" },
  { value: "tired", label: "Tired", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200" },
  { value: "stressed", label: "Stressed", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200" },
  { value: "neutral", label: "Neutral", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200" },
];

const journalPrompts = [
  "What are you grateful for today?",
  "How are you really feeling right now?",
  "What made you smile today?",
  "What's weighing on your mind?",
  "What's one small win from today?",
  "What would make tomorrow great?",
];

const journalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(10000),
  moodTag: z.enum(["happy", "sad", "anxious", "tired", "stressed", "neutral"]).optional(),
});

type JournalFormData = z.infer<typeof journalSchema>;

export default function JournalPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Journal | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");

  const form = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      content: "",
      moodTag: undefined,
    },
  });

  const { data: journals, isLoading } = useQuery<Journal[]>({
    queryKey: ["/api/journals"],
  });

  const createJournalMutation = useMutation({
    mutationFn: async (data: JournalFormData) => {
      return apiRequest("POST", "/api/journals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journals"] });
      setShowCreateDialog(false);
      form.reset();
      setSelectedPrompt("");
      toast({
        title: "Entry saved!",
        description: "Your journal entry has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Couldn't save entry",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateJournal = (data: JournalFormData) => {
    createJournalMutation.mutate(data);
  };

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    form.setValue("content", prompt + "\n\n");
    setShowCreateDialog(true);
  };

  const groupedJournals = groupJournalsByDate(journals || []);
  const todayPrompt = journalPrompts[new Date().getDay() % journalPrompts.length];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <motion.div 
        className="container px-4 py-8 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">Journal</h1>
            <p className="text-muted-foreground text-lg max-w-md">
              A quiet space for your reflections and discoveries.
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                size="lg"
                className="h-14 px-8 rounded-2xl font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                data-testid="button-new-entry"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] super-glass border-white/20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display font-bold">Write Your Story</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateJournal)} className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold uppercase tracking-wider opacity-60">Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="A title for this moment..."
                            className="h-14 rounded-2xl border-2 border-primary/10 bg-primary/5 focus-visible:ring-primary focus-visible:border-primary text-lg font-medium"
                            {...field}
                            data-testid="input-journal-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold uppercase tracking-wider opacity-60">What's on your mind?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Let your thoughts flow..."
                            className="min-h-[250px] rounded-2xl border-2 border-primary/10 bg-primary/5 focus-visible:ring-primary focus-visible:border-primary text-base leading-relaxed resize-none"
                            {...field}
                            data-testid="input-journal-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moodTag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold uppercase tracking-wider opacity-60">Emotion</FormLabel>
                        <div className="flex flex-wrap gap-3">
                          {moodOptions.map((mood) => (
                            <Button
                              key={mood.value}
                              type="button"
                              variant={field.value === mood.value ? "default" : "outline"}
                              className={cn(
                                "rounded-full px-6 transition-all",
                                field.value === mood.value ? "scale-105 shadow-md" : "opacity-70 hover:opacity-100"
                              )}
                              onClick={() => field.onChange(mood.value)}
                              data-testid={`button-mood-${mood.value}`}
                            >
                              {mood.label}
                            </Button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-xl h-12 px-6 font-bold"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setSelectedPrompt("");
                      }}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      disabled={createJournalMutation.isPending}
                      className="rounded-xl h-12 px-10 font-bold bg-primary shadow-lg shadow-primary/20"
                      data-testid="button-save-journal"
                    >
                      {createJournalMutation.isPending ? (
                        <LoadingSpinner variant="dots" size="sm" />
                      ) : (
                        "Save Entry"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Today's Prompt - Featured Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12"
        >
          <div
            className="group relative overflow-hidden rounded-[2.5rem] p-1 shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 max-w-4xl mx-auto"
            onClick={() => handlePromptClick(todayPrompt)}
            data-testid="card-todays-prompt"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent animate-pulse" />
            <div className="relative super-glass rounded-[2.4rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="shrink-0 scale-125 md:scale-150">
                <LumiCharacter size="sm" mood="calm" animate={true} />
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" />
                  Daily Reflection
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight">
                  {todayPrompt}
                </h2>
                <p className="text-muted-foreground font-medium">Tap to start writing...</p>
              </div>
              <div className="hidden md:flex w-14 h-14 rounded-full bg-primary text-white items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <ChevronRight className="w-8 h-8" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* More Prompts - Horizontal Scroll */}
        <div className="mb-16 max-w-5xl mx-auto overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-display">Need inspiration?</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar">
            {journalPrompts.map((prompt, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="shrink-0"
              >
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl px-6 border-primary/10 bg-primary/5 hover:bg-primary/10 hover:border-primary/20 text-base font-medium transition-all"
                  onClick={() => handlePromptClick(prompt)}
                  data-testid={`button-prompt-${i}`}
                >
                  {prompt}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Journal Entries Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold font-display">Your Collection</h2>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 rounded-[2rem] border-primary/10 bg-primary/5">
                  <LoadingSkeleton className="h-4 w-1/4 mb-4" />
                  <LoadingSkeleton className="h-6 w-3/4 mb-4" />
                  <LoadingSkeleton className="h-24 w-full rounded-xl" />
                </Card>
              ))}
            </div>
          ) : journals && journals.length > 0 ? (
            <div className="space-y-12">
              {Object.entries(groupedJournals).map(([date, entries]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{date}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {entries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <JournalEntryCard
                          entry={entry}
                          onClick={() => setSelectedEntry(entry)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="super-glass rounded-[3rem] p-20 text-center max-w-2xl mx-auto border-dashed border-2 border-primary/20">
              <PenLine className="w-20 h-20 mx-auto mb-6 text-primary/20" />
              <h3 className="text-2xl font-bold font-display mb-3">Begin Your Story</h3>
              <p className="text-muted-foreground text-lg mb-8">
                Your first entry is just a thought away.
              </p>
              <Button 
                size="lg"
                onClick={() => setShowCreateDialog(true)}
                className="h-14 px-10 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              >
                <Plus className="w-5 h-5 mr-2" />
                Write First Entry
              </Button>
            </div>
          )}
        </div>

        {/* Entry Detail Dialog */}
        <AnimatePresence>
          {selectedEntry && (
            <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none bg-transparent shadow-none">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="super-glass rounded-[3rem] p-10 md:p-16 border border-white/20 shadow-2xl"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        {selectedEntry.moodTag && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "px-4 py-1 rounded-full text-sm font-bold shadow-sm",
                              moodOptions.find(m => m.value === selectedEntry.moodTag)?.color
                            )}
                          >
                            {selectedEntry.moodTag}
                          </Badge>
                        )}
                        <span className="text-muted-foreground font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(selectedEntry.createdAt!).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight tracking-tight">
                        {selectedEntry.title}
                      </h1>
                    </div>
                  </div>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground/80 font-serif italic text-lg md:text-xl">
                      {selectedEntry.content}
                    </p>
                  </div>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function JournalEntryCard({
  entry,
  onClick
}: {
  entry: Journal;
  onClick: () => void;
}) {
  const moodInfo = entry.moodTag
    ? moodOptions.find(m => m.value === entry.moodTag)
    : null;

  const time = new Date(entry.createdAt!).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <Card
        className="h-full p-8 rounded-[2rem] glass-card border-white/20 hover:border-primary/30 cursor-pointer transition-all duration-500 shadow-lg hover:shadow-2xl flex flex-col"
        onClick={onClick}
        data-testid={`card-journal-${entry.id}`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{time}</span>
          {moodInfo && (
            <div className={cn("w-3 h-3 rounded-full shadow-sm", moodInfo.color.split(" ")[0])} />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <h4 className="text-xl font-bold font-display leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {entry.title}
          </h4>
          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
            {entry.content}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-primary/5 flex items-center justify-between text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Read Entry</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </Card>
    </motion.div>
  );
}

function groupJournalsByDate(journals: Journal[]): Record<string, Journal[]> {
  const grouped: Record<string, Journal[]> = {};

  journals.forEach((journal) => {
    const date = new Date(journal.createdAt!);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(journal);
  });

  return grouped;
}
