import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Quote,
} from "lucide-react";

interface BookContent {
  id: number;
  title: string;
  author?: string;
  description: string;
  content: string;
  category: "quotes" | "stories" | "readings";
  readTime: number;
  coverGradient: string;
}

const mockBooks: BookContent[] = [
  {
    id: 1,
    title: "The Power of Now",
    author: "Eckhart Tolle",
    description: "Finding peace in the present moment",
    content: `"Realize deeply that the present moment is all you ever have. Make the Now the primary focus of your life."

The past has no power over the present moment. When you accept what is, you are released from time's hold on your mind.

Unease, anxiety, tension, stress, worry — all forms of fear — are caused by too much future, and not enough presence. Guilt, regret, resentment, grievances, sadness, bitterness, and all forms of non-forgiveness are caused by too much past, and not enough presence.

Life is now. There was never a time when your life was not now, nor will there ever be. The present moment is the only moment available to us, and it is the door to all moments.

When you accept what is, every moment is the best moment. That is enlightenment.`,
    category: "readings",
    readTime: 3,
    coverGradient: "from-purple-500 to-indigo-600",
  },
  {
    id: 2,
    title: "Daily Affirmations",
    description: "Positive statements for your wellbeing",
    content: `"I am worthy of love and respect."

"I choose to focus on what I can control and let go of what I cannot."

"Every breath I take fills me with calm and peace."

"I am stronger than my anxious thoughts."

"Today, I choose happiness and gratitude."

"I trust the process of life and embrace uncertainty."

"I am enough, just as I am."

"My feelings are valid, and it's okay to feel them."

"I release what no longer serves me."

"I am capable of handling whatever comes my way."`,
    category: "quotes",
    readTime: 2,
    coverGradient: "from-pink-500 to-rose-600",
  },
  {
    id: 3,
    title: "The Lighthouse Keeper",
    author: "Sarah Mitchell",
    description: "A story of hope and resilience",
    content: `On a rocky cliff overlooking the endless sea stood an old lighthouse, its light cutting through the darkest nights.

The keeper, an elderly woman named Elena, had tended the light for forty years. Each night, she would climb the spiral stairs, light the lamp, and watch over the ships passing in the distance.

One stormy evening, a young sailor lost at sea spotted the light. Through waves that crashed like thunder and winds that howled like wolves, she followed that steady beam until she found safe harbor.

"How do you keep the light burning through every storm?" the sailor asked Elena the next morning.

The old woman smiled, her eyes reflecting years of wisdom. "The storm is not my concern," she said. "My only job is to tend the light. The light will do the rest."

The sailor thought about this for a long time. She realized that sometimes, in the darkest moments of life, all we need to do is keep our own small light burning. We don't need to fight the storm or illuminate the entire ocean. We just need to tend our light, and trust that it will guide whoever needs it home.

Years later, the sailor became a keeper of lights herself — not of a lighthouse, but of hope in others' hearts. And whenever the storms of life grew fierce, she would remember Elena's words: tend the light, and trust it to do the rest.`,
    category: "stories",
    readTime: 4,
    coverGradient: "from-teal-500 to-emerald-600",
  },
  {
    id: 4,
    title: "Mindfulness Moments",
    description: "Brief reflections for inner peace",
    content: `"In this moment, you are exactly where you need to be."

Take a breath. Feel your feet on the ground. Notice the air filling your lungs.

You are alive. You are present. You are enough.

"Happiness is not something ready-made. It comes from your own actions." — Dalai Lama

"The mind is everything. What you think, you become." — Buddha

"Peace comes from within. Do not seek it without." — Buddha

"You don't have to control your thoughts. You just have to stop letting them control you." — Dan Millman

"Be where you are, not where you think you should be."`,
    category: "quotes",
    readTime: 2,
    coverGradient: "from-blue-500 to-cyan-600",
  },
  {
    id: 5,
    title: "The Gratitude Practice",
    description: "A guide to cultivating thankfulness",
    content: `Gratitude is not just an emotion — it's a practice, a way of seeing the world that transforms our experience of life.

Start small. Each morning, before you check your phone or begin your tasks, pause. Think of three things you're grateful for. They don't need to be extraordinary.

The warmth of your blanket. The sound of birds outside. The fact that you woke up to another day.

As you practice, you'll notice something remarkable: the more you look for things to be grateful for, the more you find them. Your brain, trained to seek gratitude, begins to notice the small joys that were always there.

"Gratitude turns what we have into enough." — Melody Beattie

The practice doesn't deny difficulty or pain. It simply opens a door — a door through which light can enter even the darkest room.

Tonight, before you sleep, try this: replay your day like a movie, but only notice the moments of goodness. The smile from a stranger. The taste of your morning coffee. The moment of quiet. Let these memories fill your last waking moments.

This is the gift of gratitude: it doesn't change your circumstances, but it transforms how you experience them.`,
    category: "readings",
    readTime: 3,
    coverGradient: "from-amber-500 to-orange-600",
  },
];

export default function BooksSpace() {
  const [activeCategory, setActiveCategory] = useState<"all" | "quotes" | "stories" | "readings">("all");
  const [selectedBook, setSelectedBook] = useState<BookContent | null>(null);
  const [readProgress, setReadProgress] = useState<Record<number, number>>({});

  const filteredBooks = activeCategory === "all"
    ? mockBooks
    : mockBooks.filter(b => b.category === activeCategory);

  const handleBookClick = (book: BookContent) => {
    setSelectedBook(book);
    // Simulate reading progress
    if (!readProgress[book.id]) {
      setReadProgress(prev => ({ ...prev, [book.id]: 0 }));
    }
  };

  const handleClose = () => {
    if (selectedBook) {
      // Mark as partially or fully read
      setReadProgress(prev => ({ ...prev, [selectedBook.id]: 100 }));
    }
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <AnimatePresence mode="wait">
        {!selectedBook ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container px-4 py-6 max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Reading Space
              </h1>
              <p className="text-muted-foreground">
                Inspiring stories, quotes, and reflections
              </p>
            </div>

            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="mb-6">
              <TabsList className="grid grid-cols-4 w-full max-w-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="quotes">Quotes</TabsTrigger>
                <TabsTrigger value="stories">Stories</TabsTrigger>
                <TabsTrigger value="readings">Readings</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="overflow-hidden hover-elevate cursor-pointer transition-all h-full flex flex-col"
                    onClick={() => handleBookClick(book)}
                    data-testid={`card-book-${book.id}`}
                  >
                    <div className={cn(
                      "h-32 bg-gradient-to-br flex items-center justify-center shrink-0",
                      book.coverGradient
                    )}>
                      {book.category === "quotes" ? (
                        <Quote className="w-10 h-10 text-white/80" />
                      ) : (
                        <BookOpen className="w-10 h-10 text-white/80" />
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold line-clamp-1 text-lg">{book.title}</h3>
                          {book.author && (
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs capitalize">
                          {book.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                        {book.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {book.readTime} min read
                        </span>
                        {readProgress[book.id] !== undefined && (
                          <div className="flex items-center gap-2">
                            <Progress
                              value={readProgress[book.id]}
                              className="w-16 h-1.5"
                            />
                            <span className="text-xs text-muted-foreground">
                              {readProgress[book.id]}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reader"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-background"
          >
            {/* Reader Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
              <div className="container px-4 py-3 max-w-2xl mx-auto flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  data-testid="button-close-reader"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Reader Content */}
            <div className="container px-4 py-8 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Cover */}
                <div className={cn(
                  "h-32 rounded-xl mb-6 flex items-center justify-center bg-gradient-to-br",
                  selectedBook.coverGradient
                )}>
                  {selectedBook.category === "quotes" ? (
                    <Quote className="w-12 h-12 text-white/80" />
                  ) : (
                    <BookOpen className="w-12 h-12 text-white/80" />
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-display font-bold mb-2">
                  {selectedBook.title}
                </h1>
                {selectedBook.author && (
                  <p className="text-muted-foreground mb-4">by {selectedBook.author}</p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 mb-8">
                  <Badge variant="secondary">{selectedBook.category}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedBook.readTime} min read
                  </span>
                </div>

                {/* Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                    {selectedBook.content}
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-border text-center">
                  <p className="text-muted-foreground mb-4">
                    How did this make you feel?
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">Peaceful</Button>
                    <Button variant="outline" size="sm">Inspired</Button>
                    <Button variant="outline" size="sm">Grateful</Button>
                    <Button variant="outline" size="sm">Hopeful</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
