import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { PreSessionGuide } from "@/components/PreSessionGuide";
import { Music, Volume2, Sparkles, Play, Pause, SkipBack, SkipForward, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  src: string;
  mood: string;
  gradient: string;
}

const tracks: Track[] = [
  {
    id: "1",
    title: "Moonlight",
    artist: "Scott Buckley",
    duration: "3:42",
    src: "/music/scott-buckley-moonlight(chosic.com).mp3",
    mood: "calm",
    gradient: "from-indigo-400 to-purple-500",
  },
  {
    id: "2",
    title: "Transcendence",
    artist: "Chosic",
    duration: "5:18",
    src: "/music/Transcendence-chosic.com_.mp3",
    mood: "peaceful",
    gradient: "from-teal-400 to-emerald-500",
  },
  {
    id: "3",
    title: "The Open Sky",
    artist: "Chosic",
    duration: "4:05",
    src: "/music/The-Open-Sky-chosic.com_.mp3",
    mood: "uplifting",
    gradient: "from-sky-400 to-blue-500",
  },
];

export default function MusicSpace() {
  const [location] = useLocation();
  const [showMusicGuide, setShowMusicGuide] = useState(false);
  const [musicMood, setMusicMood] = useState("calm");
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const mood = params.get("mood");
    const autoPlay = params.get("autoPlay") === "true";

    if (mood && autoPlay) {
      const targetMood = mood !== "all" ? mood : "calm";
      setMusicMood(targetMood);
      setShowMusicGuide(true);
    }
  }, [location]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handleMusicGuideStart = () => {
    setShowMusicGuide(false);
  };

  const handleMusicGuideSkip = () => {
    setShowMusicGuide(false);
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (!currentTrack) {
      playTrack(tracks[0]);
      return;
    }
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack) {
      playTrack(tracks[tracks.length - 1]);
      return;
    }
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  const handleTrackEnd = () => {
    if (isLooping) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else {
      playNext();
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {showMusicGuide && (
        <PreSessionGuide
          sessionId={`music-${musicMood}`}
          onStart={handleMusicGuideStart}
          onSkip={handleMusicGuideSkip}
        />
      )}

      <audio
        ref={audioRef}
        src={currentTrack?.src}
        onEnded={handleTrackEnd}
        loop={isLooping ? true : false}
      />

      <Header />

      <div className="container px-4 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              <Volume2 className="w-4 h-4" />
              Auditory Wellness
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight">
              Music <span className="gradient-text">Sanctuary</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-xl">
              Immerse yourself in curated soundscapes designed to restore balance.
            </p>
          </div>
        </div>

        {/* Now Playing Bar */}
        {currentTrack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl mx-4"
          >
            <div className="super-glass rounded-3xl p-4 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", currentTrack.gradient)}>
                  <Music className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full" onClick={playPrevious}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="h-12 w-12 rounded-full bg-primary" onClick={togglePlay}>
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full" onClick={playNext}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn("h-10 w-10 rounded-full", isLooping && "text-primary")}
                  onClick={() => setIsLooping(!isLooping)}
                >
                  <Sparkles className={cn("w-4 h-4", isLooping && "fill-current")} />
                </Button>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: isPlaying ? "100%" : "0%" }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Track List */}
        <div className="grid gap-4">
          {tracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => playTrack(track)}
              className={cn(
                "group relative rounded-2xl p-4 cursor-pointer transition-all duration-300",
                currentTrack?.id === track.id
                  ? "bg-primary/10 border-primary/30"
                  : "hover:bg-white/5 border border-transparent hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                  "bg-gradient-to-br", track.gradient
                )}>
                  {currentTrack?.id === track.id && isPlaying ? (
                    <div className="flex gap-0.5">
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
                      <div className="w-1 h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-bold truncate transition-colors",
                    currentTrack?.id === track.id ? "text-primary" : "text-foreground"
                  )}>
                    {track.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{track.artist}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground font-mono">{track.duration}</span>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase",
                    "bg-gradient-to-r", track.gradient, "text-white"
                  )}>
                    {track.mood}
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mood Categories */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Mood Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["calm", "peaceful", "uplifting", "focused"].map((mood) => (
              <button
                key={mood}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
              >
                <span className="capitalize font-bold">{mood}</span>
                <span className="block text-xs text-muted-foreground mt-1">
                  {tracks.filter(t => t.mood === mood).length} tracks
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}