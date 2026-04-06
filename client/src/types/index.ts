// User & Authentication
export interface User {
    id: number;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
}

export interface AuthResponse {
    user: User;
    token?: string;
}

// Mood Detection
export type MoodType = 'happy' | 'sad' | 'anxious' | 'tired' | 'stressed' | 'neutral' | 'calm';

export interface MoodDetectionResult {
    id: number;
    userId: number;
    mood: MoodType;
    confidence: number;
    imageUrl?: string;
    createdAt: Date;
}

// Community & Posts
export type CategoryType = 'anxiety' | 'motivation' | 'wellness' | 'creativity' | 'challenges';

export interface Post {
    id: number;
    userId: number;
    title: string;
    content: string;
    category: CategoryType;
    moodTag?: MoodType;
    upvotes: number;
    isBlurred?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PostWithAuthor extends Post {
    author?: {
        firstName?: string | null;
        lastName?: string | null;
        profileImageUrl?: string | null;
    };
    commentCount?: number;
}

// Journal
export interface JournalEntry {
    id: number;
    userId: number;
    title: string;
    content: string;
    moodTag?: MoodType;
    createdAt: Date;
    updatedAt: Date;
}

// Exercises
export interface Exercise {
    id: string;
    title: string;
    description: string;
    duration: number; // in seconds
    category: 'breathing' | 'meditation' | 'movement' | 'mindfulness';
    steps: ExerciseStep[];
}

export interface ExerciseStep {
    id: string;
    instruction: string;
    duration: number;
    type: 'breathe' | 'hold' | 'relax' | 'move';
}

// Voice Agent
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Common UI Props
export interface LoadingState {
    isLoading: boolean;
    error?: string | null;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
}
