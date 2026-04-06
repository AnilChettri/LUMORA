import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { WaveformVisualizer } from '@/components/animations/WaveformVisualizer';
import { cn } from '@/lib/utils';
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    Music,
    ExternalLink,
} from 'lucide-react';

export interface AudioTrack {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    imageUrl?: string;
    duration: number;
    licenseUrl?: string;
}

interface AudioPlayerProps {
    tracks: AudioTrack[];
    currentTrackIndex: number;
    onTrackChange: (index: number) => void;
    className?: string;
}

export function AudioPlayer({
    tracks,
    currentTrackIndex,
    onTrackChange,
    className,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(70);
    const [isMuted, setIsMuted] = useState(false);

    const currentTrack = tracks[currentTrackIndex];

    // Update audio source when track changes
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.src = currentTrack.audioUrl;
            audioRef.current.load();

            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentTrack, isPlaying]);

    // Update volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume / 100;
        }
    }, [volume, isMuted]);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(console.error);
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        onTrackChange(nextIndex);
    };

    const handlePrevious = () => {
        const prevIndex = currentTrackIndex === 0 ? tracks.length - 1 : currentTrackIndex - 1;
        onTrackChange(prevIndex);
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) return null;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className={cn(
                'fixed bottom-16 md:bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom',
                className
            )}
        >
            <audio
                ref={audioRef}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={handleNext}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <div className="max-w-7xl mx-auto p-4">
                {/* Track Info */}
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                        {currentTrack.imageUrl ? (
                            <img
                                src={currentTrack.imageUrl}
                                alt={currentTrack.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Music className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{currentTrack.title}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground truncate">
                                {currentTrack.artist}
                            </p>
                            {currentTrack.licenseUrl && (
                                <a
                                    href={currentTrack.licenseUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                    title="View license"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    CC
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevious}
                            data-testid="button-prev-track"
                        >
                            <SkipBack className="w-5 h-5" />
                        </Button>

                        <Button
                            size="icon"
                            className="w-12 h-12 rounded-full"
                            onClick={togglePlay}
                            data-testid="button-play-pause"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5 ml-0.5" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNext}
                            data-testid="button-next-track"
                        >
                            <SkipForward className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Volume */}
                    <div className="hidden sm:flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMuted(!isMuted)}
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="w-4 h-4" />
                            ) : (
                                <Volume2 className="w-4 h-4" />
                            )}
                        </Button>
                        <Slider
                            value={[isMuted ? 0 : volume]}
                            max={100}
                            step={1}
                            onValueChange={([val]) => {
                                setVolume(val);
                                setIsMuted(false);
                            }}
                            className="w-24"
                        />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-10">
                        {formatTime(currentTime)}
                    </span>
                    <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                        {formatTime(duration)}
                    </span>
                </div>

                {/* Waveform Visualizer */}
                <div className="mt-2 flex justify-center">
                    <WaveformVisualizer isActive={isPlaying} variant="minimal" barCount={40} />
                </div>
            </div>
        </motion.div>
    );
}
