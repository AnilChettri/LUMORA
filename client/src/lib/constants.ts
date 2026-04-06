// Route paths
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    MOOD: '/mood',
    VOICE: '/voice',
    EXERCISES: '/exercises',
    COMMUNITY: '/community',
    JOURNAL: '/journal',
    MUSIC: '/music',
    BOOKS: '/books',
    GAMES: '/games',
    CRISIS: '/crisis',
} as const;

// API endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/login',
        LOGOUT: '/api/logout',
        REGISTER: '/api/register',
    },
    MOOD: '/api/mood-detection',
    VOICE_AGENT: '/api/voice-agent',
    POSTS: '/api/posts',
    JOURNAL: '/api/journal',
} as const;

// Mood tags
export const MOOD_TAGS = {
    HAPPY: 'happy',
    SAD: 'sad',
    ANXIOUS: 'anxious',
    TIRED: 'tired',
    STRESSED: 'stressed',
    NEUTRAL: 'neutral',
    CALM: 'calm',
} as const;

// Category types
export const CATEGORIES = {
    ANXIETY: 'anxiety',
    MOTIVATION: 'motivation',
    WELLNESS: 'wellness',
    CREATIVITY: 'creativity',
    CHALLENGES: 'challenges',
} as const;

// Animation durations (ms)
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
} as const;

// Breakpoints (matches Tailwind)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    THEME: 'theme',
    USER_PREFERENCES: 'user-preferences',
    ONBOARDING_COMPLETE: 'onboarding-complete',
} as const;
