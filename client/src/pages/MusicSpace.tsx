import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/Header";
import { LoadingSkeleton } from "@/components/animations/LoadingSpinner";
import { AudioPlayer, type AudioTrack } from "@/components/AudioPlayer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchAllPlaylists, type JamendoTrack } from "@/lib/musicApi";
import {
  Music,
  ListMusic,
  ExternalLink,
} from "lucide-react";

interface Playlist {
  id: string;
  title: string;
  description: string;
  moodTags: string[];
  tracks: AudioTrack[];
}

const moodFilters = [
  { id: "all", label: "All", color: "bg-muted" },
  { id: "calm", label: "Calm", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "focus", label: "Focus", color: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "sleep", label: "Sleep", color: "bg-indigo-100 dark:bg-indigo-900/30" },
  { id: "happy", label: "Happy", color: "bg-yellow-100 dark:bg-yellow-900/30" },
  { id: "anxious", label: "Anxiety Relief", color: "bg-orange-100 dark:bg-orange-900/30" },
];

// Convert Jamendo track to AudioTrack format
function convertToAudioTrack(track: JamendoTrack): AudioTrack {
  return {
    id: track.id,
    title: track.name,
    artist: track.artist_name,
    audioUrl: track.audio,
    imageUrl: track.image,
    duration: track.duration,
    licenseUrl: track.license_ccurl,
  };
}

export default function MusicSpace() {
  const [location] = useLocation();
  const [activeMood, setActiveMood] = useState("all");
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [allTracks, setAllTracks] = useState<AudioTrack[]>([]);

  // Fetch playlists from Jamendo
  const { data: jamendoPlaylists, isLoading } = useQuery({
    queryKey: ['/music/playlists'],
    queryFn: fetchAllPlaylists,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  // Convert Jamendo playlists to our format
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

  // Handle track selection
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

  // Allow the mood controller to deep-link into a mood-specific playlist
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const mood = params.get("mood");
    const autoPlay = params.get("autoPlay") === "true";

    if (!mood && !autoPlay) return;

    const targetMood = mood && mood !== "all" ? mood : "calm";

    // Adjust filter chip
    if (mood) {
      setActiveMood(mood);
    }

    if (!autoPlay || !playlists.length) return;

    const playlistForMood = playlists.find((p) =>
      p.moodTags.includes(targetMood)
    );

    if (!playlistForMood || playlistForMood.tracks.length === 0) return;

    handlePlaylistClick(playlistForMood);
  }, [location, playlists.length]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <div className="container px-4 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold mb-2 flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" />
            Music Space
          </h1>
          <p className="text-muted-foreground">
            Calming sounds and playlists for every mood
          </p>
        </div>

        {/* Mood Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 custom-scrollbar md:mx-0 md:px-0">
          {moodFilters.map((mood) => (
            <Button
              key={mood.id}
              variant={activeMood === mood.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveMood(mood.id)}
              className="shrink-0"
              data-testid={`filter-mood-${mood.id}`}
            >
              {mood.label}
            </Button>
          ))}
        </div>

        {/* Playlists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {filteredPlaylists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="p-4 hover-elevate cursor-pointer transition-all h-full"
                onClick={() => setSelectedPlaylist(playlist)}
                data-testid={`card-playlist-${playlist.id}`}
              >
                <div className="flex gap-4 items-start">
                  {/* Album Art */}
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <ListMusic className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 truncate">{playlist.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {playlist.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {playlist.moodTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Track List */}
        {selectedPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">{selectedPlaylist.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlaylist(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-2">
                {selectedPlaylist.tracks.map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
                      allTracks[currentTrackIndex]?.id === track.id
                        ? "bg-primary/10"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => handlePlayTrack(track, selectedPlaylist)}
                    data-testid={`track-${track.id}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                      {track.imageUrl ? (
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        allTracks[currentTrackIndex]?.id === track.id && "text-primary"
                      )}>
                        {track.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </p>
                    </div>
                    {track.licenseUrl && (
                      <a
                        href={track.licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                        title="View license"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Audio Player */}
      {allTracks.length > 0 && (
        <AudioPlayer
          tracks={allTracks}
          currentTrackIndex={currentTrackIndex}
          onTrackChange={setCurrentTrackIndex}
        />
      )}
    </div>
  );
}
