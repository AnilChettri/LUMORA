// Jamendo API integration for royalty-free music
// API Docs: https://developer.jamendo.com/v3.0

export interface JamendoTrack {
    id: string;
    name: string;
    artist_name: string;
    duration: number; // in seconds
    audio: string; // MP3 URL
    audiodownload: string;
    image: string; // Album art URL
    album_name: string;
    license_ccurl: string; // Creative Commons license URL
}

export interface JamendoResponse {
    headers: {
        status: string;
        results_count: number;
    };
    results: JamendoTrack[];
}

const JAMENDO_CLIENT_ID = '56d30c95'; // Public demo client ID (replace with your own)
const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';

/**
 * Fetch tracks from Jamendo by tags/mood
 */
export async function fetchTracksByMood(
    mood: string,
    limit: number = 10
): Promise<JamendoTrack[]> {
    try {
        // Map moods to Jamendo tags
        const tagMap: Record<string, string> = {
            calm: 'calm+meditation+ambient',
            focus: 'focus+concentration+study',
            sleep: 'sleep+relaxation+calm',
            happy: 'happy+uplifting+positive',
            anxious: 'calm+peaceful+meditation',
            all: 'ambient+meditation+calm',
        };

        const tags = tagMap[mood] || tagMap.all;

        const url = new URL(`${JAMENDO_BASE_URL}/tracks/`);
        url.searchParams.append('client_id', JAMENDO_CLIENT_ID);
        url.searchParams.append('format', 'json');
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('tags', tags);
        url.searchParams.append('audioformat', 'mp32'); // MP3 128kbps
        url.searchParams.append('include', 'musicinfo');
        url.searchParams.append('imagesize', '200'); // Album art size

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Jamendo API error: ${response.statusText}`);
        }

        const data: JamendoResponse = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching tracks from Jamendo:', error);
        return [];
    }
}

/**
 * Fetch a single playlist worth of tracks
 */
export async function fetchPlaylist(
    mood: string,
    playlistName: string
): Promise<{
    name: string;
    description: string;
    tracks: JamendoTrack[];
}> {
    const tracks = await fetchTracksByMood(mood, 8);

    return {
        name: playlistName,
        description: `Curated ${mood} music from Jamendo`,
        tracks,
    };
}

/**
 * Get multiple playlists for different moods
 */
export async function fetchAllPlaylists(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    mood: string;
    tracks: JamendoTrack[];
}>> {
    const moods = [
        { id: 'calm', name: 'Calm & Focus', description: 'Gentle ambient sounds for concentration' },
        { id: 'anxious', name: 'Anxiety Relief', description: 'Soothing melodies to ease your mind' },
        { id: 'sleep', name: 'Sleep Sounds', description: 'Drift off to dreamland' },
        { id: 'happy', name: 'Uplifting Vibes', description: 'Positive energy boost' },
    ];

    const playlists = await Promise.all(
        moods.map(async (mood) => {
            const tracks = await fetchTracksByMood(mood.id, 6);
            return {
                id: mood.id,
                name: mood.name,
                description: mood.description,
                mood: mood.id,
                tracks,
            };
        })
    );

    return playlists;
}
