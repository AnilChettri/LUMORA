import type { MoodType, Post, Journal, User } from "@shared/schema";

type DemoUser = User & { tagline: string };

interface VoiceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function getTimestamp(value: Date | string | null | undefined): number {
  if (!value) return 0;
  if (value instanceof Date) {
    return value.getTime();
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

const SESSION_STORAGE_KEY = "brainimation.mockSessionUser";

const demoUsers = [
  {
    id: "user-1",
    email: "sophia@lumi.ai",
    firstName: "Sophia",
    lastName: "Ray",
    profileImageUrl: "https://i.pravatar.cc/150?img=47",
    isGuest: false,
    hasCompletedTour: true,
    hasConsentedCamera: true,
    hasConsentedMic: true,
    hasConsentedData: true,
    currentMood: "happy",
    createdAt: new Date("2024-11-02T08:30:00Z"),
    updatedAt: new Date("2025-01-22T14:10:00Z"),
    tagline: "Grounded mindfulness coach",
  },
  {
    id: "user-2",
    email: "amir@lumi.ai",
    firstName: "Amir",
    lastName: "Chen",
    profileImageUrl: "https://i.pravatar.cc/150?img=59",
    isGuest: false,
    hasCompletedTour: false,
    hasConsentedCamera: false,
    hasConsentedMic: true,
    hasConsentedData: true,
    currentMood: "stressed",
    createdAt: new Date("2024-12-18T15:05:00Z"),
    updatedAt: new Date("2025-02-05T11:40:00Z"),
    tagline: "Product designer rediscovering balance",
  },
  {
    id: "user-3",
    email: "guest@lumi.ai",
    firstName: "Guest",
    lastName: "Explorer",
    profileImageUrl: "https://i.pravatar.cc/150?img=16",
    isGuest: true,
    hasCompletedTour: false,
    hasConsentedCamera: false,
    hasConsentedMic: false,
    hasConsentedData: false,
    currentMood: "neutral",
    createdAt: new Date("2025-01-15T09:00:00Z"),
    updatedAt: new Date("2025-02-07T09:20:00Z"),
    tagline: "Try Lumi without any commitment",
  },
] as DemoUser[];

let currentUserId: string | null = null;
let moodByUser: Record<string, { mood: MoodType; confidence: number }> = {
  "user-1": { mood: "happy", confidence: 88 },
  "user-2": { mood: "stressed", confidence: 62 },
  "user-3": { mood: "neutral", confidence: 50 },
};

let journalIdCounter = 3;
let postIdCounter = 4;

let journals: Journal[] = [
  {
    id: 1,
    userId: "user-1",
    title: "Golden morning check-in",
    content:
      "Woke up with a restless mind but settled into calm after a 6-minute breathing flow. Noting the warmth from the sunrise helped.",
    moodTag: "happy",
    gratitudeItems: ["Sunlight through the window", "Morning tea", "A patient friend"],
    createdAt: new Date("2025-02-01T07:40:00Z"),
    updatedAt: new Date("2025-02-01T07:40:00Z"),
  },
  {
    id: 2,
    userId: "user-2",
    title: "Naming the tension",
    content:
      "Work sprint pushed me past comfort. I paused for five grounding breaths and listed the three things in my control.",
    moodTag: "stressed",
    gratitudeItems: ["Supportive teammate", "Lunch walk", "Soft playlist"],
    createdAt: new Date("2025-02-04T18:05:00Z"),
    updatedAt: new Date("2025-02-04T18:05:00Z"),
  },
  {
    id: 3,
    userId: "user-3",
    title: "First Lumi moment",
    content: "Tried the guided meditation. Felt surprisingly grounded afterwards.",
    moodTag: "neutral",
    gratitudeItems: ["Time for myself"],
    createdAt: new Date("2025-02-07T09:25:00Z"),
    updatedAt: new Date("2025-02-07T09:25:00Z"),
  },
];

let posts: (Post & { authorId: string })[] = [
  {
    id: 1,
    userId: "user-1",
    authorId: "user-1",
    title: "How golden-hour walks reset my nervous system",
    content:
      "When I step outside just as the light turns honey-gold, everything slows down. Sharing three breath cues that keep me present…",
    category: "wellness",
    moodTag: "happy",
    imageUrl: null,
    upvotes: 42,
    isFlagged: false,
    isBlurred: false,
    createdAt: new Date("2025-01-29T17:20:00Z"),
    updatedAt: new Date("2025-01-29T17:20:00Z"),
  },
  {
    id: 2,
    userId: "user-2",
    authorId: "user-2",
    title: "Anxiety toolkit: 5-4-3-2-1 with soundscapes",
    content:
      "Pairing grounding exercises with layered soundscapes has been my anchor lately. Here are tracks that work for me…",
    category: "anxiety",
    moodTag: "anxious",
    imageUrl: null,
    upvotes: 35,
    isFlagged: false,
    isBlurred: false,
    createdAt: new Date("2025-02-03T21:10:00Z"),
    updatedAt: new Date("2025-02-03T21:10:00Z"),
  },
  {
    id: 3,
    userId: "user-3",
    authorId: "user-3",
    title: "Celebrating a tiny win",
    content: "Shared a difficult feeling with a friend today. It felt like letting light in.",
    category: "motivation",
    moodTag: "neutral",
    imageUrl: null,
    upvotes: 18,
    isFlagged: false,
    isBlurred: false,
    createdAt: new Date("2025-02-05T12:15:00Z"),
    updatedAt: new Date("2025-02-05T12:15:00Z"),
  },
  {
    id: 4,
    userId: "user-1",
    authorId: "user-1",
    title: "Prompt: Name three glimmers you noticed today",
    content: "Mine: sunlight on the table, a gentle text, the smell of eucalyptus.",
    category: "creativity",
    moodTag: "happy",
    imageUrl: null,
    upvotes: 27,
    isFlagged: false,
    isBlurred: false,
    createdAt: new Date("2025-02-06T09:50:00Z"),
    updatedAt: new Date("2025-02-06T09:50:00Z"),
  },
];

const voiceHistory: Record<string, VoiceMessage[]> = {};

function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ message }, status);
}

function getCurrentUser(): DemoUser | undefined {
  if (!currentUserId) return undefined;
  return demoUsers.find((user) => user.id === currentUserId);
}

function requireAuth(): DemoUser {
  const user = getCurrentUser();
  if (!user) {
    throw errorResponse("Unauthorized", 401);
  }
  return user;
}

async function readRequestBody(input: RequestInfo | URL, init?: RequestInit): Promise<string | undefined> {
  if (init?.body) {
    if (typeof init.body === "string") {
      return init.body;
    }

    if (init.body instanceof Blob) {
      return await init.body.text();
    }

    if (init.body instanceof FormData) {
      const obj: Record<string, string> = {};
      init.body.forEach((value, key) => {
        obj[key] = String(value);
      });
      return JSON.stringify(obj);
    }

    try {
      return JSON.stringify(init.body);
    } catch (error) {
      console.warn("Unable to serialise request body", error);
      return undefined;
    }
  }

  if (typeof input !== "string" && !(input instanceof URL)) {
    try {
      const cloned = input.clone();
      return await cloned.text();
    } catch (error) {
      console.warn("Unable to read request body", error);
    }
  }

  return undefined;
}

function hydrateAuthors<T extends Post>(payload: T[]): Array<T & {
  author?: {
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
  };
}> {
  return payload.map((post) => ({
    ...post,
    author: demoUsers
      .filter((user) => user.id === post.userId)
      .map((user) => ({
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl ?? null,
      }))[0],
  }));
}

async function handleAuthRoutes(pathSegments: string[], method: string, input: RequestInfo | URL, init?: RequestInit) {
  if (method === "GET" && pathSegments[2] === "demo-users") {
    const payload = demoUsers.map(({ tagline, ...user }) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      tagline,
      mood: user.currentMood,
      avatar: user.profileImageUrl,
    }));
    return jsonResponse(payload);
  }

  if (method === "GET" && pathSegments[2] === "user") {
    const user = getCurrentUser();
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    return jsonResponse(user);
  }

  if (method === "POST" && pathSegments[2] === "login") {
    const bodyText = await readRequestBody(input, init);
    const body = bodyText ? JSON.parse(bodyText) : {};
    const { userId, email } = body;

    const user = demoUsers.find((candidate) => candidate.id === userId || candidate.email === email);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    currentUserId = user.id;
    try {
      window.sessionStorage?.setItem(SESSION_STORAGE_KEY, user.id);
    } catch {
      /* noop */
    }

    return jsonResponse({ success: true, user });
  }

  if (method === "POST" && (pathSegments[2] === "logout" || pathSegments[2] === "signout")) {
    currentUserId = null;
    try {
      window.sessionStorage?.removeItem(SESSION_STORAGE_KEY);
    } catch {
      /* noop */
    }
    return jsonResponse({ success: true });
  }

  return undefined;
}

async function handleMoodRoutes(pathSegments: string[], method: string, input: RequestInfo | URL, init?: RequestInit) {
  const user = requireAuth();

  if (method === "GET" && pathSegments[2] === "current") {
    const payload = moodByUser[user.id] ?? { mood: user.currentMood as MoodType, confidence: 50 };
    return jsonResponse(payload);
  }

  if (method === "POST" && pathSegments.length === 2) {
    const bodyText = await readRequestBody(input, init);
    if (!bodyText) {
      return errorResponse("Missing mood payload", 400);
    }

    const body = JSON.parse(bodyText) as { mood: MoodType; confidence?: number };
    moodByUser[user.id] = {
      mood: body.mood,
      confidence: body.confidence ?? 75,
    };

    return jsonResponse({ success: true });
  }

  return undefined;
}

async function handleJournalRoutes(pathSegments: string[], method: string, input: RequestInfo | URL, init?: RequestInit) {
  const user = requireAuth();

  if (method === "GET" && pathSegments.length === 2) {
    const payload = journals
      .filter((journal) => journal.userId === user.id)
      .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));
    return jsonResponse(payload);
  }

  if (method === "POST" && pathSegments.length === 2) {
    const bodyText = await readRequestBody(input, init);
    if (!bodyText) {
      return errorResponse("Missing journal payload", 400);
    }

    const body = JSON.parse(bodyText) as Partial<Journal> & { title?: string; content?: string; moodTag?: string };
    journalIdCounter += 1;
    const now = new Date();

    const newJournal: Journal = {
      id: journalIdCounter,
      userId: user.id,
      title: body.title ?? "Untitled entry",
      content: body.content ?? "",
      moodTag: body.moodTag ?? user.currentMood ?? "neutral",
      gratitudeItems: Array.isArray(body.gratitudeItems) ? (body.gratitudeItems as string[]) : [],
      createdAt: now,
      updatedAt: now,
    };

    journals = [newJournal, ...journals];

    return jsonResponse(newJournal, 201);
  }

  return undefined;
}

function sortPosts(entries: Post[], sort: string): Post[] {
  if (sort === "recent") {
    return [...entries].sort((a, b) => {
      const aTime = getTimestamp(a.createdAt as Date | string | null);
      const bTime = getTimestamp(b.createdAt as Date | string | null);
      return bTime - aTime;
    });
  }

  return [...entries].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
}

async function handlePostRoutes(pathSegments: string[], method: string, input: RequestInfo | URL, init?: RequestInit) {
  const user = requireAuth();

  if (method === "GET") {
    if (pathSegments[2] === "trending") {
      const top = sortPosts(posts, "trending").slice(0, 3);
      return jsonResponse(hydrateAuthors(top));
    }

    if (pathSegments.length >= 4) {
      const category = pathSegments[2];
      const sort = pathSegments[3] ?? "trending";

      const filtered = posts.filter((post) => category === "all" || post.category === category);
      return jsonResponse(hydrateAuthors(sortPosts(filtered, sort)));
    }
  }

  if (method === "POST" && pathSegments.length === 2) {
    const bodyText = await readRequestBody(input, init);
    if (!bodyText) {
      return errorResponse("Missing post payload", 400);
    }

    const body = JSON.parse(bodyText) as Partial<Post> & { title?: string; content?: string; category?: string; moodTag?: MoodType };
    postIdCounter += 1;
    const now = new Date();

    const newPost: Post & { authorId: string } = {
      id: postIdCounter,
      userId: user.id,
      authorId: user.id,
      title: body.title ?? "Shared moment",
      content: body.content ?? "",
      category: (body.category as Post["category"]) ?? "wellness",
      moodTag: (body.moodTag as MoodType) ?? (moodByUser[user.id]?.mood ?? "neutral"),
      imageUrl: body.imageUrl ?? null,
      upvotes: 0,
      isFlagged: false,
      isBlurred: false,
      createdAt: now,
      updatedAt: now,
    };

    posts = [newPost, ...posts];

    return jsonResponse(hydrateAuthors([newPost])[0], 201);
  }

  if (method === "POST" && pathSegments.length === 4 && pathSegments[3] === "upvote") {
    const postId = Number(pathSegments[2]);
    const targetPost = posts.find((entry) => entry.id === postId);
    if (!targetPost) {
      return errorResponse("Post not found", 404);
    }

    targetPost.upvotes = (targetPost.upvotes ?? 0) + 1;
    targetPost.updatedAt = new Date();

    return jsonResponse({ success: true, upvotes: targetPost.upvotes });
  }

  return undefined;
}

async function handleVoiceAgent(method: string, input: RequestInfo | URL, init?: RequestInit) {
  const user = requireAuth();

  if (method !== "POST") {
    return undefined;
  }

  const bodyText = await readRequestBody(input, init);
  const body = bodyText ? JSON.parse(bodyText) as { message?: string } : {};
  const message = body.message?.trim();
  if (!message) {
    return errorResponse("Please share a thought or feeling.", 400);
  }

  const history = voiceHistory[user.id] ?? [];
  const now = new Date();

  history.push({
    id: `${now.getTime()}-user`,
    role: "user",
    content: message,
    timestamp: now,
  });

  const moodDescriptor = moodByUser[user.id]?.mood ?? "neutral";
  const assistantReply = `I hear you. Let's breathe together for a moment. Notice how the light shifts, just like the way this feeling will. Because you're feeling ${moodDescriptor} energy, I'd suggest the "Golden Hour Reset" playlist or a grounding journal prompt.`;

  const assistantMessage: VoiceMessage = {
    id: `${now.getTime()}-assistant`,
    role: "assistant",
    content: assistantReply,
    timestamp: new Date(),
  };

  history.push(assistantMessage);
  voiceHistory[user.id] = history.slice(-12);

  return jsonResponse({ response: assistantReply });
}

function restoreSessionFromStorage() {
  try {
    const stored = window.sessionStorage?.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const userExists = demoUsers.some((user) => user.id === stored);
      currentUserId = userExists ? stored : null;
    }
  } catch {
    currentUserId = currentUserId ?? null;
  }
}

export function initializeMockServer() {
  if (typeof window === "undefined" || typeof window.fetch !== "function") {
    return;
  }

  if ((window as any).__BRAINIMATION_MOCK_SERVER_INITIALISED__) {
    return;
  }

  restoreSessionFromStorage();

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const rawUrl = typeof input === "string" || input instanceof URL ? input.toString() : input.url;
      const url = new URL(rawUrl, window.location?.origin ?? "http://localhost");
      const pathname = url.pathname;

      const method = (init?.method ?? (typeof input === "string" || input instanceof URL ? "GET" : input.method)).toUpperCase();

      const pathSegments = pathname.split("/").filter(Boolean);
      if (pathSegments[0] !== "api") {
        return originalFetch(input, init);
      }

      try {
        if (pathSegments[1] === "auth") {
          const response = await handleAuthRoutes(pathSegments, method, input, init);
          if (response) return response;
        }

        if (pathSegments[1] === "mood") {
          const response = await handleMoodRoutes(pathSegments, method, input, init);
          if (response) return response;
        }

        if (pathSegments[1] === "journals") {
          const response = await handleJournalRoutes(pathSegments, method, input, init);
          if (response) return response;
        }

        if (pathSegments[1] === "posts") {
          const response = await handlePostRoutes(pathSegments, method, input, init);
          if (response) return response;
        }

        if (pathSegments[1] === "voice-agent") {
          const response = await handleVoiceAgent(method, input, init);
          if (response) return response;
        }
      } catch (error) {
        if (error instanceof Response) {
          return error;
        }
        console.error("Mock server error", error);
        return errorResponse("Mock server failure", 500);
      }

      return errorResponse("Endpoint not mocked", 404);
    } catch (error) {
      console.error("Mock server runtime error", error);
      return errorResponse("Mock server failure", 500);
    }
  };

  (window as any).__BRAINIMATION_MOCK_SERVER_INITIALISED__ = true;
}

export { demoUsers };
