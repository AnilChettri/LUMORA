import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { soundManager, gameSounds } from "@/lib/soundManager";
import {
  Gamepad2,
  Play,
  RotateCcw,
  Timer,
  Trophy,
  Brain,
  Eye,
  Palette,
  Volume2,
  VolumeX,
} from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  difficulty: "easy" | "medium" | "hard";
}

const games: Game[] = [
  {
    id: "memory",
    title: "Memory Match",
    description: "Match pairs of calming images",
    icon: Brain,
    gradient: "from-purple-500 to-indigo-600",
    difficulty: "easy",
  },
  {
    id: "breathing-game",
    title: "Bubble Pop",
    description: "Pop bubbles in rhythm with your breath",
    icon: Eye,
    gradient: "from-blue-500 to-cyan-600",
    difficulty: "easy",
  },
  {
    id: "color-flow",
    title: "Color Flow",
    description: "Create soothing color patterns",
    icon: Palette,
    gradient: "from-pink-500 to-rose-600",
    difficulty: "easy",
  },
];

const memoryCards = ["🌸", "🌿", "🦋", "🌊", "🌙", "⭐", "🌺", "🍃"];

export default function GamesSpace() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [location] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const gameId = params.get("game");

    if (!gameId) return;
    const exists = games.some((g) => g.id === gameId);
    if (!exists) return;

    setSelectedGame(gameId);
  }, [location]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Header />

      <div className="container px-4 py-12 max-w-7xl mx-auto">
        {!selectedGame ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Immersive Header */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
               <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                     <Gamepad2 className="w-4 h-4" />
                     Mindful Playground
                  </div>
                  <h1 className="text-5xl font-display font-bold tracking-tight">
                     Flow <span className="gradient-text">State</span>
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                     Cognitive exercises designed to gently focus your mind and dissolve stress through interactive play.
                  </p>
               </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card
                    className="overflow-hidden glass-card border-white/20 hover:border-primary/40 cursor-pointer transition-all duration-500 h-full flex flex-col rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
                    onClick={() => {
                        soundManager.playClick();
                        setSelectedGame(game.id);
                    }}
                    data-testid={`card-game-${game.id}`}
                  >
                    <div className={cn(
                      "h-52 bg-gradient-to-br flex items-center justify-center shrink-0 relative overflow-hidden",
                      game.gradient
                    )}>
                       <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                       <div className="relative z-10 p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500">
                          <game.icon className="w-16 h-16 text-white" />
                       </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <h3 className="font-display font-bold text-2xl group-hover:text-primary transition-colors">{game.title}</h3>
                        <Badge className="bg-primary/5 text-primary border-none text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
                          {game.difficulty}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed flex-1">
                        {game.description}
                      </p>
                      
                      <div className="pt-6 border-t border-primary/5 flex items-center justify-between mt-8">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                          <Play className="w-4 h-4 fill-current" />
                          <span>Enter Flow</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                           <Trophy className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
           <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
           >
              {selectedGame === "memory" ? (
                <MemoryGame onBack={() => setSelectedGame(null)} />
              ) : selectedGame === "breathing-game" ? (
                <BubbleGame onBack={() => setSelectedGame(null)} />
              ) : selectedGame === "color-flow" ? (
                <ColorFlowGame onBack={() => setSelectedGame(null)} />
              ) : null}
           </motion.div>
        )}
      </div>
    </div>
  );
}

function MemoryGame({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const initializeGame = useCallback(() => {
    const shuffledCards = [...memoryCards, ...memoryCards]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].matched) return;
    if (flippedCards.includes(id)) return;

    gameSounds.gameStart();

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    setCards(prev => prev.map(card =>
      card.id === id ? { ...card, flipped: true } : card
    ));

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        gameSounds.correctMatch();
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, matched: true }
              : card
          ));
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === memoryCards.length) {
              setTimeout(() => gameSounds.levelUp(), 300);
              setIsComplete(true);
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        gameSounds.wrongMatch();
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second
              ? { ...card, flipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Immersive Game Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 glass-card border-white/20 rounded-[2rem]">
        <Button variant="ghost" onClick={onBack} className="rounded-xl font-bold hover:bg-white/10 h-12 px-6">
          ← Exit Session
        </Button>
        <div className="flex items-center gap-6">
          <div className="text-center px-6 border-r border-white/10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Moves</p>
            <p className="text-2xl font-display font-bold text-primary">{moves}</p>
          </div>
          <div className="text-center px-6 border-r border-white/10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Matches</p>
            <p className="text-2xl font-display font-bold text-primary">{matches} / {memoryCards.length}</p>
          </div>
          <div className="text-center px-6">
             <Trophy className={cn("w-8 h-8 transition-colors", isComplete ? "text-yellow-500 fill-yellow-500" : "text-white/20")} />
          </div>
        </div>
        <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/10 h-12 px-6 font-bold" onClick={initializeGame}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <Card className="p-10 text-center glass-card border-primary/40 rounded-[3rem] bg-primary/5 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1),transparent_70%)]" />
               <div className="relative z-10">
                  <Trophy className="w-20 h-20 mx-auto mb-6 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                  <h3 className="text-4xl font-display font-bold mb-4">Brilliant Focus!</h3>
                  <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                    You found all matches in just {moves} moves. Your cognitive clarity is peaking.
                  </p>
                  <Button className="h-14 px-10 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20" onClick={initializeGame}>
                     Play Again
                  </Button>
               </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Grid - Refined Cards */}
      <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={cn(
              "aspect-square rounded-[1.5rem] cursor-pointer transition-all transform-gpu",
              card.matched && "opacity-40"
            )}
            whileHover={{ scale: card.matched || card.flipped ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            data-testid={`card-memory-${card.id}`}
          >
            <motion.div
              className="w-full h-full relative"
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card Back - Modern Glass */}
              <div
                className="absolute inset-0 rounded-[1.5rem] glass-card border-white/20 bg-gradient-to-br from-primary/40 to-indigo-600/40 flex items-center justify-center backface-hidden shadow-lg"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                   <div className="w-10 h-10 rounded-full overflow-hidden shadow-inner ring-2 ring-white/20">
                      <img src="/Quantum Shift.jpg" alt="" className="w-full h-full object-cover" />
                   </div>
                </div>
              </div>
              
              {/* Card Front - Clean & Symbolic */}
              <div
                className="absolute inset-0 rounded-[1.5rem] bg-white dark:bg-slate-900 border-2 border-primary/30 flex items-center justify-center text-5xl backface-hidden shadow-2xl"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {card.emoji}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function BubbleGame({ onBack }: { onBack: () => void }) {
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number; size: number; popped: boolean }[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBubbles(prev => {
        const newBubbles = prev.filter(b => !b.popped && b.y > -10);
        if (newBubbles.length < 8) {
          newBubbles.push({
            id: Date.now(),
            x: Math.random() * 90 + 5,
            y: 100 + Math.random() * 20,
            size: 50 + Math.random() * 40,
            popped: false,
          });
        }
        return newBubbles.map(b => ({ ...b, y: b.y - 0.4 }));
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.map(b =>
      b.id === id ? { ...b, popped: true } : b
    ));
    setScore(prev => prev + 1);
    soundManager.playClick();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-6 glass-card border-white/20 rounded-[2rem]">
        <Button variant="ghost" onClick={onBack} className="rounded-xl font-bold h-12 px-6">
          ← Back to Games
        </Button>
        <div className="flex items-center gap-4 bg-primary/10 rounded-2xl px-8 py-3 border border-primary/20">
           <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bubbles Popped</span>
           <span className="text-2xl font-display font-bold text-primary">{score}</span>
        </div>
      </div>

      <Card className="relative h-[600px] overflow-hidden rounded-[3rem] glass-card border-white/10 shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-cyan-500/5 to-indigo-500/10 pointer-events-none" />
         
         <AnimatePresence>
            {bubbles.filter(b => !b.popped).map((bubble) => (
              <motion.button
                key={bubble.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                className="absolute rounded-full glass-card border-2 border-white/40 shadow-[0_0_30px_rgba(103,232,249,0.2)] group"
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: bubble.size,
                  height: bubble.size,
                }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => popBubble(bubble.id)}
              >
                 <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 rounded-full bg-white/40" />
              </motion.button>
            ))}
         </AnimatePresence>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
           <h2 className="text-8xl font-display font-bold uppercase tracking-widest select-none">POLLEN</h2>
        </div>

        <div className="absolute bottom-10 left-0 right-0 text-center z-10">
           <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Tap to release the energy</p>
        </div>
      </Card>
    </div>
  );
}

function ColorFlowGame({ onBack }: { onBack: () => void }) {
  const [colors, setColors] = useState<string[]>([]);
  const gradients = [
    "from-purple-400 to-pink-400",
    "from-blue-400 to-cyan-400",
    "from-green-400 to-teal-400",
    "from-yellow-400 to-orange-400",
    "from-pink-400 to-rose-400",
    "from-indigo-400 to-purple-400",
  ];

  const addColor = (gradient: string) => {
    setColors(prev => [...prev.slice(-23), gradient]);
    soundManager.playClick();
  };

  const clearColors = () => {
    setColors([]);
    soundManager.playClick();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between p-6 glass-card border-white/20 rounded-[2rem]">
        <Button variant="ghost" onClick={onBack} className="rounded-xl font-bold h-12 px-6">
          ← Back
        </Button>
        <Button variant="outline" className="rounded-xl border-white/10 hover:bg-rose-500/10 hover:text-rose-500 h-12 px-6 font-bold" onClick={clearColors}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Clear Canvas
        </Button>
      </div>

      <Card className="h-[500px] rounded-[3rem] glass-card border-white/10 p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 flex flex-wrap content-start gap-4 p-8 overflow-hidden z-10">
          <AnimatePresence>
            {colors.map((color, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                className={cn(
                  "w-20 h-20 rounded-3xl bg-gradient-to-br shadow-xl",
                  color
                )}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {colors.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
             <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                <Palette className="w-10 h-10 text-primary/40" />
             </div>
             <h3 className="text-2xl font-display font-bold mb-2">Infinite Palette</h3>
             <p className="text-muted-foreground max-w-xs">Select colors below to begin your mindful composition.</p>
          </div>
        )}
      </Card>

      <div className="p-10 glass-card border-white/10 rounded-[3rem] flex flex-wrap justify-center gap-6">
        {gradients.map((gradient, i) => (
          <motion.button
            key={i}
            className={cn(
              "w-20 h-20 rounded-3xl bg-gradient-to-br shadow-2xl relative group overflow-hidden",
              gradient
            )}
            whileHover={{ scale: 1.15, y: -10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addColor(gradient)}
          >
             <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
