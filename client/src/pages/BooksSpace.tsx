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
    if (!readProgress[book.id]) {
      setReadProgress(prev => ({ ...prev, [book.id]: 0 }));
    }
  };

  const handleClose = () => {
    if (selectedBook) {
      setReadProgress(prev => ({ ...prev, [selectedBook.id]: 100 }));
    }
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Header />

      <AnimatePresence mode="wait">
        {!selectedBook ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            className="container px-4 py-12 max-w-7xl mx-auto"
          >
            {/* Library Header */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                  <BookOpen className="w-4 h-4" />
                  Library of Wisdom
                </div>
                <h1 className="text-5xl font-display font-bold tracking-tight">
                  The <span className="gradient-text">Reading Space</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl">
                  Curated literature to soothe your mind, inspire your heart, and guide your journey home.
                </p>
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-auto">
                <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="w-full">
                  <TabsList className="bg-primary/5 p-1.5 rounded-2xl border border-primary/10 h-14">
                    <TabsTrigger value="all" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">All</TabsTrigger>
                    <TabsTrigger value="quotes" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Quotes</TabsTrigger>
                    <TabsTrigger value="stories" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Stories</TabsTrigger>
                    <TabsTrigger value="readings" className="rounded-xl px-6 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Readings</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Books Shelves Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Card
                    className="relative overflow-hidden glass-card rounded-[2.5rem] border-white/20 hover:border-primary/40 cursor-pointer transition-all duration-500 h-[480px] flex flex-col group shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]"
                    onClick={() => handleBookClick(book)}
                    data-testid={`card-book-${book.id}`}
                  >
                    {/* Artistic Book Cover Area */}
                    <div className={cn(
                      "h-64 bg-gradient-to-br p-10 flex flex-col items-center justify-center relative overflow-hidden transition-transform duration-700 group-hover:scale-105",
                      book.coverGradient
                    )}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
                      <div className="absolute -top-10 -left-10 w-40 h-40 bg-black/20 blur-3xl rounded-full" />
                      
                      {book.category === "quotes" ? (
                        <Quote className="w-16 h-16 text-white drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <BookOpen className="w-16 h-16 text-white drop-shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>

                    <div className="p-8 flex-1 flex flex-col relative bg-background/50 backdrop-blur-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                          {book.category}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {book.readTime} min
                        </span>
                      </div>

                      <h3 className="text-2xl font-display font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      {book.author && (
                        <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-tight mb-4">{book.author}</p>
                      )}
                      
                      <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3 mb-6">
                        {book.description}
                      </p>

                      <div className="mt-auto pt-6 border-t border-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">Read Now</span>
                        </div>
                        
                        {readProgress[book.id] !== undefined && (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Progress</p>
                              <p className="text-xs font-bold">{readProgress[book.id]}%</p>
                            </div>
                            <Progress
                              value={readProgress[book.id]}
                              className="w-12 h-1.5 rounded-full"
                            />
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
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto custom-scrollbar"
          >
            {/* Immersive Reader Header */}
            <div className="sticky top-0 z-20 glass-card border-none rounded-none h-20">
              <div className="container px-6 h-full max-w-4xl mx-auto flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="rounded-full h-12 px-6 font-bold hover:bg-primary/5"
                  onClick={handleClose}
                  data-testid="button-close-reader"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Close Library
                </Button>
                
                <div className="flex-1 text-center hidden md:block">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">{selectedBook.category}</p>
                  <p className="font-display font-bold truncate max-w-[200px] mx-auto">{selectedBook.title}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:text-primary">
                    <Bookmark className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:text-rose-500">
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Reading Canvas */}
            <div className="container px-6 py-20 max-w-3xl mx-auto min-h-screen">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-12"
              >
                {/* Book Header Section */}
                <div className="text-center space-y-6">
                  <div className={cn(
                    "w-32 h-32 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-2xl bg-gradient-to-br",
                    selectedBook.coverGradient
                  )}>
                    {selectedBook.category === "quotes" ? (
                      <Quote className="w-12 h-12 text-white/80" />
                    ) : (
                      <BookOpen className="w-12 h-12 text-white/80" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
                      {selectedBook.title}
                    </h1>
                    {selectedBook.author && (
                      <p className="text-xl font-bold text-primary/60 italic">by {selectedBook.author}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Length</span>
                      <span className="font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {selectedBook.readTime} min
                      </span>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Emotion</span>
                      <span className="font-bold capitalize text-primary">{selectedBook.category}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* Content Area with Paper-like Typography */}
                <article className="prose prose-xl dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-[2] text-foreground/90 font-serif text-xl md:text-2xl selection:bg-primary/20">
                    {selectedBook.content}
                  </div>
                </article>

                {/* Post-reading Interaction */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="mt-24 p-12 rounded-[3rem] super-glass border-primary/20 text-center space-y-8"
                >
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-display">Reflection</h3>
                    <p className="text-muted-foreground text-lg">How does your soul feel after this reading?</p>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    {["Peaceful", "Inspired", "Grateful", "Hopeful", "Calm"].map((emotion) => (
                      <Button 
                        key={emotion}
                        variant="outline" 
                        className="h-14 px-8 rounded-2xl font-bold border-primary/10 bg-primary/5 hover:bg-primary hover:text-white transition-all text-lg"
                      >
                        {emotion}
                      </Button>
                    ))}
                  </div>

                  <Button 
                    size="lg"
                    className="h-14 px-10 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20"
                    onClick={handleClose}
                  >
                    Finish Reading
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
