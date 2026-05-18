// Music API integration - Radio Browser + local generation
// Uses local Web Audio API as primary fallback, Radio Browser for streaming

export interface MusicTrack {
    id: string;
    name: string;
    artist_name: string;
    duration: number;
    audio: string;
    image: string;
    album_name: string;
    isLocal?: boolean;
    source: 'radio' | 'local';
    isStream?: boolean;
}

// Radio Browser API - free, no key required
const RADIO_MIRRORS = [
    'https://de1.api.radio-browser.info/json',
    'https://at1.api.radio-browser.info/json',
    'https://fr1.api.radio-browser.info/json',
    'https://nl1.api.radio-browser.info/json'
];

const RADIO_API = RADIO_MIRRORS[Math.floor(Math.random() * RADIO_MIRRORS.length)];

// Tag mappings for different moods
const moodToTags: Record<string, string> = {
    calm: 'ambient,meditation,chill,lounge',
    sleep: 'sleep,relaxation,ambient,sleep',
    anxious: 'calm,peaceful,meditation,ambient',
    happy: 'happy,upbeat,pop,positive',
    focus: 'focus,study,ambient,classical',
};

// Get local generated ambient tracks (always works)
function getLocalTracksForMood(mood: string): MusicTrack[] {
    const localTracks: Record<string, MusicTrack[]> = {
        calm: [
            { id: 'local-calm-1', name: 'Peaceful Waters', artist_name: 'SoulSync', duration: 180, audio: 'local://calm', image: '', album_name: 'Calm Collection', isLocal: true, source: 'local' },
            { id: 'local-calm-2', name: 'Gentle Breeze', artist_name: 'SoulSync', duration: 180, audio: 'local://calm', image: '', album_name: 'Calm Collection', isLocal: true, source: 'local' },
        ],
        sleep: [
            { id: 'local-sleep-1', name: 'Night Sky', artist_name: 'SoulSync', duration: 300, audio: 'local://sleep', image: '', album_name: 'Sleep Sounds', isLocal: true, source: 'local' },
            { id: 'local-sleep-2', name: 'Deep Rest', artist_name: 'SoulSync', duration: 300, audio: 'local://sleep', image: '', album_name: 'Sleep Sounds', isLocal: true, source: 'local' },
        ],
        anxious: [
            { id: 'local-anxious-1', name: 'Ease Your Mind', artist_name: 'SoulSync', duration: 200, audio: 'local://anxious', image: '', album_name: 'Anxiety Relief', isLocal: true, source: 'local' },
        ],
        happy: [
            { id: 'local-happy-1', name: 'Good Energy', artist_name: 'SoulSync', duration: 180, audio: 'local://happy', image: '', album_name: 'Uplifting Vibes', isLocal: true, source: 'local' },
        ],
        focus: [
            { id: 'local-focus-1', name: 'Concentration', artist_name: 'SoulSync', duration: 180, audio: 'local://focus', image: '', album_name: 'Focus Mode', isLocal: true, source: 'local' },
        ],
    };
    return localTracks[mood] || localTracks.calm;
}

// Fetch from Radio Browser API
async function fetchFromRadioBrowser(mood: string, limit: number): Promise<MusicTrack[]> {
    try {
        const tags = moodToTags[mood] || moodToTags.calm;
        const tagList = tags.split(',')[0]; // Use first tag for search
        
        const url = `${RADIO_API}/stations/bytag/${tagList}?limit=${limit}&hidebroken=true&order=votes&reverse=true`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Radio API error');
        
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) return [];
        
        return data
            .filter((station: any) => station.url_resolved && station.url_resolved.startsWith('http'))
            .slice(0, limit)
            .map((station: any) => ({
                id: `radio-${station.stationuuid}`,
                name: station.name,
                artist_name: station.tags || station.country || 'Radio Station',
                duration: 0, // Live stream - no duration
                audio: station.url_resolved || station.url,
                image: station.favicon || '',
                album_name: station.country || 'Radio',
                source: 'radio' as const,
                isStream: true,
            }));
    } catch (e) {
        console.log('Radio Browser unavailable:', e);
        return [];
    }
}

/**
 * Fetch tracks for a mood
 */
export async function fetchTracksByMood(mood: string, limit: number = 8): Promise<MusicTrack[]> {
    // First try Radio Browser API
    const radioTracks = await fetchFromRadioBrowser(mood, limit);
    
    // If Radio Browser works, use those
    if (radioTracks.length > 0) {
        return radioTracks;
    }
    
    // Fall back to local generated ambient sounds
    return getLocalTracksForMood(mood);
}

/**
 * Fetch all playlists for different moods
 */
export async function fetchAllPlaylists(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    mood: string;
    tracks: MusicTrack[];
    isLocalFallback?: boolean;
}>> {
    const moods = [
        { id: 'calm', name: 'Calm & Focus', description: 'Gentle ambient sounds for concentration' },
        { id: 'anxious', name: 'Anxiety Relief', description: 'Soothing melodies to ease your mind' },
        { id: 'sleep', name: 'Sleep Sounds', description: 'Drift off to dreamland' },
        { id: 'happy', name: 'Uplifting Vibes', description: 'Positive energy boost' },
    ];

    const playlists = await Promise.all(
        moods.map(async (mood) => {
            const tracks = await fetchTracksByMood(mood.id, 8);
            const isLocalFallback = tracks.every(t => t.source === 'local');

            return {
                id: mood.id,
                name: mood.name,
                description: mood.description,
                mood: mood.id,
                tracks,
                isLocalFallback,
            };
        })
    );

    return playlists;
}

// Keep for compatibility
export function getLocalTracks(mood: string): MusicTrack[] {
    return getLocalTracksForMood(mood);
}