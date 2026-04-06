import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
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

  // Allow mood controller to deep-link directly into a specific game
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const gameId = params.get("game");

    if (!gameId) return;
    const exists = games.some((g) => g.id === gameId);
    if (!exists) return;

    setSelectedGame(gameId);
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-6 max-w-7xl mx-auto">
        {!selectedGame ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold mb-2 flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-primary" />
                Calming Games
              </h1>
              <p className="text-muted-foreground">
                Mindful activities to help you relax
              </p>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="overflow-hidden hover-elevate cursor-pointer transition-all h-full flex flex-col"
                    onClick={() => setSelectedGame(game.id)}
                    data-testid={`card-game-${game.id}`}
                  >
                    <div className={cn(
                      "h-40 bg-gradient-to-br flex items-center justify-center shrink-0",
                      game.gradient
                    )}>
                      <game.icon className="w-12 h-12 text-white/80" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{game.title}</h3>
                        <Badge variant="secondary" className="shrink-0 text-xs capitalize">
                          {game.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {game.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        ) : selectedGame === "memory" ? (
          <MemoryGame onBack={() => setSelectedGame(null)} />
        ) : selectedGame === "breathing-game" ? (
          <BubbleGame onBack={() => setSelectedGame(null)} />
        ) : selectedGame === "color-flow" ? (
          <ColorFlowGame onBack={() => setSelectedGame(null)} />
        ) : null}
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

    // Play click sound when card is flipped
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
        // Play success sound for match
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
              // Play game complete sound
              setTimeout(() => gameSounds.levelUp(), 300);
              setIsComplete(true);
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        // Play error sound for mismatch
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            <Timer className="w-3 h-3 mr-1" />
            Moves: {moves}
          </Badge>
          <Badge variant="secondary">
            <Trophy className="w-3 h-3 mr-1" />
            Matched: {matches}/{memoryCards.length}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={initializeGame}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {isComplete && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
            <p className="text-muted-foreground">
              You completed the game in {moves} moves!
            </p>
          </Card>
        </motion.div>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className={cn(
              "aspect-square rounded-xl cursor-pointer transition-all transform-gpu",
              card.matched && "opacity-50"
            )}
            whileHover={{ scale: card.matched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            data-testid={`card-memory-${card.id}`}
          >
            <motion.div
              className="w-full h-full relative"
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card Back */}
              <div
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <motion.div
                  className="w-8 h-8 rounded-full overflow-hidden"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <img src="/Quantum Shift.jpg" alt="Card" className="w-full h-full object-cover" />
                </motion.div>
              </div>
              {/* Card Front */}
              <div
                className="absolute inset-0 rounded-xl bg-card border border-border flex items-center justify-center text-3xl backface-hidden"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {card.emoji}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
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
            size: 30 + Math.random() * 30,
            popped: false,
          });
        }
        return newBubbles.map(b => ({ ...b, y: b.y - 0.5 }));
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const popBubble = (id: number) => {
    setBubbles(prev => prev.map(b =>
      b.id === id ? { ...b, popped: true } : b
    ));
    setScore(prev => prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Score: {score}
        </Badge>
      </div>

      <Card className="relative h-[400px] overflow-hidden bg-gradient-to-b from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30">
        {bubbles.filter(b => !b.popped).map((bubble) => (
          <motion.button
            key={bubble.id}
            className="absolute rounded-full bg-gradient-to-br from-blue-400/60 to-cyan-400/60 backdrop-blur-sm border-2 border-white/30"
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: bubble.size,
              height: bubble.size,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => popBubble(bubble.id)}
            data-testid={`bubble-${bubble.id}`}
          />
        ))}

        <div className="absolute bottom-4 left-0 right-0 text-center text-muted-foreground text-sm">
          Tap the bubbles to pop them!
        </div>
      </Card>
    </motion.div>
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
    setColors(prev => [...prev.slice(-19), gradient]);
  };

  const clearColors = () => {
    setColors([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="outline" size="sm" onClick={clearColors}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Canvas */}
      <Card className="h-[300px] mb-6 overflow-hidden relative">
        <div className="absolute inset-0 flex flex-wrap gap-1 p-2 overflow-hidden">
          {colors.map((color, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "w-12 h-12 rounded-lg bg-gradient-to-br",
                color
              )}
            />
          ))}
        </div>
        {colors.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Tap colors below to create a pattern
          </div>
        )}
      </Card>

      {/* Color Palette */}
      <div className="flex justify-center gap-3 flex-wrap">
        {gradients.map((gradient, i) => (
          <motion.button
            key={i}
            className={cn(
              "w-14 h-14 rounded-xl bg-gradient-to-br shadow-lg",
              gradient
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addColor(gradient)}
            data-testid={`color-${i}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
