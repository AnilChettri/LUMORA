import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { LoadingSkeleton } from "@/components/animations/LoadingSpinner";
import { AudioPlayer, type AudioTrack } from "@/components/AudioPlayer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PreSessionGuide } from "@/components/PreSessionGuide";
import { cn } from "@/lib/utils";
import { fetchAllPlaylists, type MusicTrack } from "@/lib/musicApi";
import { playAmbientSound, stopAmbientSound, resumeAudioContext } from "@/lib/ambientAudio";
import {
  Music,
  ListMusic,
  ExternalLink,
  Volume2,
  Loader2,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Playlist {
  id: string;
  title: string;
  description: string;
  moodTags: string[];
  tracks: AudioTrack[];
  isLocalFallback?: boolean;
}

const moodFilters = [
  { id: "all", label: "All", color: "bg-muted" },
  { id: "calm", label: "Calm", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "focus", label: "Focus", color: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "sleep", label: "Sleep", color: "bg-indigo-100 dark:bg-indigo-900/30" },
  { id: "happy", label: "Happy", color: "bg-yellow-100 dark:bg-yellow-900/30" },
  { id: "anxious", label: "Anxiety Relief", color: "bg-orange-100 dark:bg-orange-900/30" },
];

// Convert track to AudioTrack format
function convertToAudioTrack(track: MusicTrack): AudioTrack {
  return {
    id: track.id,
    title: track.name,
    artist: track.artist_name,
    audioUrl: track.audio || '',
    imageUrl: track.image || '',
    duration: track.duration || 180,
    isLocal: track.source === 'local',
    isStream: track.source === 'radio',
  };
}

export default function MusicSpace() {
  const [location] = useLocation();
  const [activeMood, setActiveMood] = useState("all");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [allTracks, setAllTracks] = useState<AudioTrack[]>([]);
  const [showMusicGuide, setShowMusicGuide] = useState(false);
  const [musicMood, setMusicMood] = useState("calm");

  const { data: jamendoPlaylists, isLoading } = useQuery({
    queryKey: ['/music/playlists'],
    queryFn: fetchAllPlaylists,
    staleTime: 1000 * 60 * 30,
  });

  const playlists: Playlist[] = jamendoPlaylists?.map(playlist => ({
    id: playlist.id,
    title: playlist.name,
    description: playlist.description,
    moodTags: [playlist.mood],
    tracks: playlist.tracks.map(convertToAudioTrack),
  })) || [];

  const filteredPlaylists = activeMood === "all"
    ? playlists
    : playlists.filter(p => p.moodTags.includes(activeMood));

  const handlePlayTrack = (track: AudioTrack, playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    const trackIndex = playlist.tracks.findIndex(t => t.id === track.id);
    setCurrentTrackIndex(trackIndex);
    setAllTracks(playlist.tracks);
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    setAllTracks(playlist.tracks);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const mood = params.get("mood");
    const autoPlay = params.get("autoPlay") === "true";

    if (!mood && !autoPlay) return;

    const targetMood = mood && mood !== "all" ? mood : "calm";
    setMusicMood(targetMood);

    if (mood) {
      setActiveMood(mood);
    }

    if (!autoPlay || !playlists.length) return;

    const playlistForMood = playlists.find((p) =>
      p.moodTags.includes(targetMood)
    );

    if (!playlistForMood || playlistForMood.tracks.length === 0) return;

    setShowMusicGuide(true);
  }, [location, playlists.length]);

  const handleMusicGuideStart = () => {
    setShowMusicGuide(false);
    const params = new URLSearchParams(location.split("?")[1] || "");
    const mood = params.get("mood") || musicMood;
    const targetMood = mood !== "all" ? mood : "calm";
    const playlistForMood = playlists.find((p) => p.moodTags.includes(targetMood));
    if (playlistForMood) {
      handlePlaylistClick(playlistForMood);
    }
  };

  const handleMusicGuideSkip = () => {
    setShowMusicGuide(false);
    const params = new URLSearchParams(location.split("?")[1] || "");
    const mood = params.get("mood") || musicMood;
    const targetMood = mood !== "all" ? mood : "calm";
    const playlistForMood = playlists.find((p) => p.moodTags.includes(targetMood));
    if (playlistForMood) {
      handlePlaylistClick(playlistForMood);
    }
  };

  return (
    <div className="min-h-screen pb-32 relative overflow-x-hidden">
      {/* Pre-Session Guide for Music */}
      {showMusicGuide && (
        <PreSessionGuide
          sessionId={`music-${musicMood}`}
          onStart={handleMusicGuideStart}
          onSkip={handleMusicGuideSkip}
        />
      )}

      <Header />

      <div className="container px-4 py-12 max-w-7xl mx-auto space-y-12">
        {/* Immersive Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
           <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                 <Volume2 className="w-4 h-4" />
                 Auditory Wellness
              </div>
              <h1 className="text-5xl font-display font-bold tracking-tight">
                 Music <span className="gradient-text">Sanctuary</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
                 Discover curated soundscapes and melodies scientifically designed to balance your frequency.
              </p>
           </div>
        </div>

        {/* Mood-Based Filtering Island */}
        <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-2 no-scrollbar">
              {moodFilters.map((mood) => (
                <Button
                  key={mood.id}
                  variant={activeMood === mood.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveMood(mood.id)}
                  className={cn(
                    "rounded-xl px-6 font-bold h-12 transition-all",
                    activeMood === mood.id ? "bg-primary shadow-lg shadow-primary/20" : "hover:bg-primary/10"
                  )}
                  data-testid={`filter-mood-${mood.id}`}
                >
                  {mood.label}
                </Button>
              ))}
           </div>
           
           <div className="hidden md:flex items-center gap-2 px-6">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                       {i}
                    </div>
                 ))}
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-4">12k+ Listening Now</span>
           </div>
        </div>

        {/* Playlists Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            [...Array(8)].map((_, i) => (
               <Card key={i} className="p-6 glass-card border-white/20 rounded-[2.5rem] space-y-4">
                  <LoadingSkeleton className="aspect-square w-full rounded-2xl" />
                  <div className="space-y-2">
                     <LoadingSkeleton className="h-4 w-2/3" />
                     <LoadingSkeleton className="h-3 w-full" />
                  </div>
               </Card>
            ))
          ) : filteredPlaylists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card
                className="p-6 glass-card border-white/20 hover:border-primary/40 cursor-pointer transition-all duration-500 rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] h-full flex flex-col relative overflow-hidden"
                onClick={() => setSelectedPlaylist(playlist)}
                data-testid={`card-playlist-${playlist.id}`}
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] group-hover:bg-primary/20 transition-colors" />
                
                <div className="aspect-square w-full rounded-3xl bg-gradient-to-br from-primary/30 via-violet-500/20 to-indigo-500/30 mb-6 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-500 shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                   <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
                      <ListMusic className="w-10 h-10 text-white" />
                   </div>
                   <div className="absolute bottom-4 right-4">
                      <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl shadow-primary/20">
                         <Play className="w-5 h-5 fill-current" />
                      </div>
                   </div>
                </div>

                <div className="flex-1 space-y-2">
                   <h3 className="text-xl font-display font-bold leading-tight group-hover:text-primary transition-colors truncate">
                      {playlist.title}
                   </h3>
                   <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {playlist.description}
                   </p>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {playlist.moodTags.slice(0, 2).map((tag) => (
                    <Badge key={tag} className="bg-primary/5 text-primary border-none text-[10px] uppercase font-bold tracking-widest px-2.5 py-1">
                      {tag}
                    </Badge>
                  ))}
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-auto py-1">
                     {playlist.tracks.length} Tracks
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Track View Overlay */}
        <AnimatePresence>
          {selectedPlaylist && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-background/40"
            >
              <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 40 }}
                className="w-full max-w-4xl glass-card border-white/20 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]"
              >
                {/* Left Side: Playlist Info */}
                <div className="w-full md:w-80 bg-primary/5 p-8 flex flex-col items-center text-center border-r border-white/5">
                   <div className="w-48 h-48 rounded-[2rem] bg-gradient-to-br from-primary via-violet-600 to-indigo-600 mb-8 shadow-2xl flex items-center justify-center relative">
                      <Music className="w-20 h-20 text-white" />
                      <div className="absolute inset-0 rounded-[2rem] ring-4 ring-white/10 ring-inset" />
                   </div>
                   <h2 className="text-2xl font-display font-bold mb-4">{selectedPlaylist.title}</h2>
                   <p className="text-sm text-muted-foreground leading-relaxed mb-8 flex-1">
                      {selectedPlaylist.description}
                   </p>
                   <Button
                    variant="outline"
                    className="w-full rounded-xl border-white/10 hover:bg-white/10 font-bold h-12"
                    onClick={() => setSelectedPlaylist(null)}
                   >
                    Back to Gallery
                   </Button>
                </div>

                {/* Right Side: Track List */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-background/20">
                   <div className="space-y-3">
                      {selectedPlaylist.tracks.map((track, index) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "group/track flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer border",
                            allTracks[currentTrackIndex]?.id === track.id
                              ? "bg-primary/10 border-primary/20"
                              : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                          )}
                          onClick={() => handlePlayTrack(track, selectedPlaylist)}
                        >
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 relative overflow-hidden group-hover/track:scale-105 transition-transform">
                             {track.imageUrl ? (
                               <img src={track.imageUrl} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <Music className="w-6 h-6 text-primary/40" />
                             )}
                             {allTracks[currentTrackIndex]?.id === track.id && (
                                <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
                                   <div className="flex gap-1">
                                      <div className="w-1 h-3 bg-white animate-music-bar-1" />
                                      <div className="w-1 h-4 bg-white animate-music-bar-2" />
                                      <div className="w-1 h-2 bg-white animate-music-bar-3" />
                                   </div>
                                </div>
                             )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-bold font-display truncate transition-colors",
                              allTracks[currentTrackIndex]?.id === track.id ? "text-primary" : "group-hover/track:text-primary"
                            )}>
                              {track.title}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                              {track.artist}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 opacity-0 group-hover/track:opacity-100 transition-opacity">
                             <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                             </span>
                             <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <Play className="w-4 h-4 fill-current" />
                             </div>
                          </div>
                        </motion.div>
                      ))}
                   </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audio Player Controller - Fixed Bottom */}
      {allTracks.length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 z-40 px-4 md:px-8 pointer-events-none">
           <div className="max-w-5xl mx-auto pointer-events-auto">
              <AudioPlayer
                tracks={allTracks}
                currentTrackIndex={currentTrackIndex}
                onTrackChange={setCurrentTrackIndex}
              />
           </div>
        </div>
      )}
    </div>
  );
}
