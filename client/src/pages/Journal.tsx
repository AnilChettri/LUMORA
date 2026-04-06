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
  const todayPrompt = journalPrompts[new Date().getDay()];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold mb-1">Journal</h1>
            <p className="text-muted-foreground text-sm">
              Reflect on your thoughts and emotions
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-entry">
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Write a Journal Entry</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateJournal)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Give your entry a title"
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
                        <FormLabel>What's on your mind?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write freely..."
                            rows={8}
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
                        <FormLabel>How are you feeling?</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {moodOptions.map((mood) => (
                            <Button
                              key={mood.value}
                              type="button"
                              variant={field.value === mood.value ? "default" : "outline"}
                              size="sm"
                              onClick={() => field.onChange(mood.value)}
                              className={cn(
                                field.value === mood.value && mood.color
                              )}
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

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateDialog(false);
                        setSelectedPrompt("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createJournalMutation.isPending}
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

        {/* Today's Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card
            className="p-5 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-indigo-500/10 border-purple-200/30 dark:border-purple-800/30 cursor-pointer hover-elevate max-w-3xl mx-auto"
            onClick={() => handlePromptClick(todayPrompt)}
            data-testid="card-todays-prompt"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <LumiCharacter size="sm" mood="calm" animate={false} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Today's prompt
                </p>
                <p className="font-medium">{todayPrompt}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </div>
          </Card>
        </motion.div>

        {/* More Prompts */}
        <div className="mb-8 max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Need inspiration?
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar md:mx-0 md:px-0">
            {journalPrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="shrink-0 text-left"
                onClick={() => handlePromptClick(prompt)}
                data-testid={`button-prompt-${i}`}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Journal Entries */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Your Entries
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <LoadingSkeleton className="h-4 w-1/4 mb-2" />
                  <LoadingSkeleton className="h-5 w-3/4 mb-2" />
                  <LoadingSkeleton className="h-16 w-full" />
                </Card>
              ))}
            </div>
          ) : journals && journals.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedJournals).map(([date, entries]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {date}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {entries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
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
            <Card className="p-12 text-center">
              <PenLine className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your journaling journey today
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Write First Entry
              </Button>
            </Card>
          )}
        </div>

        {/* Entry Detail Dialog */}
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            {selectedEntry && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedEntry.title}</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(selectedEntry.createdAt!).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Badge>
                  {selectedEntry.moodTag && (
                    <Badge
                      variant="outline"
                      className={moodOptions.find(m => m.value === selectedEntry.moodTag)?.color}
                    >
                      {selectedEntry.moodTag}
                    </Badge>
                  )}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
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
    <Card
      className="p-4 hover-elevate cursor-pointer transition-all"
      onClick={onClick}
      data-testid={`card-journal-${entry.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-medium truncate">{entry.title}</h4>
            {moodInfo && (
              <Badge variant="outline" className={cn("text-xs", moodInfo.color)}>
                {moodInfo.label}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {entry.content}
          </p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{time}</span>
      </div>
    </Card>
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
