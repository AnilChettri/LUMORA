import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  users,
  moodLogs,
  journals,
  posts,
  comments,
  upvotes,
  conversations,
  reports,
  type User,
  type UpsertUser,
  type InsertMoodLog,
  type MoodLog,
  type InsertJournal,
  type Journal,
  type InsertPost,
  type Post,
  type InsertComment,
  type Comment,
  type InsertUpvote,
  type Upvote,
  type Conversation,
  type InsertReport,
  type Report,
} from "@shared/schema";
import { randomUUID } from "node:crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getMoodLogs(userId: string): Promise<MoodLog[]>;
  getCurrentMood(userId: string): Promise<MoodLog | undefined>;
  createMoodLog(moodLog: InsertMoodLog): Promise<MoodLog>;
  getJournals(userId: string): Promise<Journal[]>;
  getJournal(id: number): Promise<Journal | undefined>;
  createJournal(journal: InsertJournal): Promise<Journal>;
  updateJournal(id: number, data: Partial<Journal>): Promise<Journal | undefined>;
  deleteJournal(id: number): Promise<void>;
  getPosts(options?: { category?: string; sort?: string; limit?: number }): Promise<Post[]>;
  getTrendingPosts(limit?: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<void>;
  incrementUpvotes(postId: number): Promise<void>;
  decrementUpvotes(postId: number): Promise<void>;
  getComments(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<void>;
  incrementCommentUpvotes(commentId: number): Promise<void>;
  getUserUpvote(userId: string, postId?: number, commentId?: number): Promise<Upvote | undefined>;
  createUpvote(upvote: InsertUpvote): Promise<Upvote>;
  deleteUpvote(id: number): Promise<void>;
  getConversation(userId: string): Promise<Conversation | undefined>;
  upsertConversation(userId: string, messages: any[]): Promise<Conversation>;
  createReport(report: InsertReport): Promise<Report>;
}

class DatabaseStorage implements IStorage {
  private get client() {
    if (!db) {
      throw new Error("Database connection is not available");
    }
    return db;
  }

  async getUser(id: string) {
    const [user] = await this.client.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await this.client.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser) {
    const [user] = await this.client
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>) {
    const [user] = await this.client
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getMoodLogs(userId: string) {
    return this.client
      .select()
      .from(moodLogs)
      .where(eq(moodLogs.userId, userId))
      .orderBy(desc(moodLogs.createdAt));
  }

  async getCurrentMood(userId: string) {
    const [log] = await this.client
      .select()
      .from(moodLogs)
      .where(eq(moodLogs.userId, userId))
      .orderBy(desc(moodLogs.createdAt))
      .limit(1);
    return log;
  }

  async createMoodLog(moodLog: InsertMoodLog) {
    const [log] = await this.client.insert(moodLogs).values(moodLog).returning();
    await this.client
      .update(users)
      .set({ currentMood: moodLog.mood, updatedAt: new Date() })
      .where(eq(users.id, moodLog.userId));
    return log;
  }

  async getJournals(userId: string) {
    return this.client
      .select()
      .from(journals)
      .where(eq(journals.userId, userId))
      .orderBy(desc(journals.createdAt));
  }

  async getJournal(id: number) {
    const [journal] = await this.client.select().from(journals).where(eq(journals.id, id));
    return journal;
  }

  async createJournal(journal: InsertJournal) {
    const [entry] = await this.client.insert(journals).values(journal).returning();
    return entry;
  }

  async updateJournal(id: number, data: Partial<Journal>) {
    const [journal] = await this.client
      .update(journals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journals.id, id))
      .returning();
    return journal;
  }

  async deleteJournal(id: number) {
    await this.client.delete(journals).where(eq(journals.id, id));
  }

  async getPosts(options?: { category?: string; sort?: string; limit?: number }) {
    let query = this.client.select().from(posts).where(eq(posts.isFlagged, false));

    if (options?.sort === "trending") {
      query = query.orderBy(desc(posts.upvotes), desc(posts.createdAt)) as any;
    } else {
      query = query.orderBy(desc(posts.createdAt)) as any;
    }

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }

    return query;
  }

  async getTrendingPosts(limit = 10) {
    return this.client
      .select()
      .from(posts)
      .where(eq(posts.isFlagged, false))
      .orderBy(desc(posts.upvotes), desc(posts.createdAt))
      .limit(limit);
  }

  async getPost(id: number) {
    const [post] = await this.client.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(post: InsertPost) {
    const [newPost] = await this.client.insert(posts).values(post).returning();
    return newPost;
  }

  async updatePost(id: number, data: Partial<Post>) {
    const [post] = await this.client
      .update(posts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post;
  }

  async deletePost(id: number) {
    await this.client.delete(posts).where(eq(posts.id, id));
  }

  async incrementUpvotes(postId: number) {
    await this.client
      .update(posts)
      .set({ upvotes: sql`${posts.upvotes} + 1` })
      .where(eq(posts.id, postId));
  }

  async decrementUpvotes(postId: number) {
    await this.client
      .update(posts)
      .set({ upvotes: sql`GREATEST(${posts.upvotes} - 1, 0)` })
      .where(eq(posts.id, postId));
  }

  async getComments(postId: number) {
    return this.client
      .select()
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.isFlagged, false)))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment) {
    const [newComment] = await this.client.insert(comments).values(comment).returning();
    return newComment;
  }

  async deleteComment(id: number) {
    await this.client.delete(comments).where(eq(comments.id, id));
  }

  async incrementCommentUpvotes(commentId: number) {
    await this.client
      .update(comments)
      .set({ upvotes: sql`${comments.upvotes} + 1` })
      .where(eq(comments.id, commentId));
  }

  async getUserUpvote(userId: string, postId?: number, commentId?: number) {
    if (postId) {
      const [upvote] = await this.client
        .select()
        .from(upvotes)
        .where(and(eq(upvotes.userId, userId), eq(upvotes.postId, postId)));
      return upvote;
    }
    if (commentId) {
      const [upvote] = await this.client
        .select()
        .from(upvotes)
        .where(and(eq(upvotes.userId, userId), eq(upvotes.commentId, commentId)));
      return upvote;
    }
    return undefined;
  }

  async createUpvote(upvote: InsertUpvote) {
    const [newUpvote] = await this.client.insert(upvotes).values(upvote).returning();
    return newUpvote;
  }

  async deleteUpvote(id: number) {
    await this.client.delete(upvotes).where(eq(upvotes.id, id));
  }

  async getConversation(userId: string) {
    const [conv] = await this.client
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt))
      .limit(1);
    return conv;
  }

  async upsertConversation(userId: string, messages: any[]) {
    const existing = await this.getConversation(userId);

    if (existing) {
      const [conv] = await this.client
        .update(conversations)
        .set({ messages, updatedAt: new Date() })
        .where(eq(conversations.id, existing.id))
        .returning();
      return conv;
    }

    const [conv] = await this.client
      .insert(conversations)
      .values({ userId, messages })
      .returning();
    return conv;
  }

  async createReport(report: InsertReport) {
    const [newReport] = await this.client.insert(reports).values(report).returning();
    return newReport;
  }
}

type Collections = {
  users: User[];
  moodLogs: MoodLog[];
  journals: Journal[];
  posts: Post[];
  comments: Comment[];
  upvotes: Upvote[];
  conversations: Conversation[];
  reports: Report[];
};

class InMemoryStorage implements IStorage {
  private data: Collections;
  private journalId = 1;
  private postId = 1;
  private commentId = 1;
  private moodLogId = 1;
  private upvoteId = 1;
  private conversationId = 1;
  private reportId = 1;

  private getTimestamp(value: Date | string | null | undefined): number {
    if (!value) return 0;
    if (value instanceof Date) return value.getTime();
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  constructor() {
    const now = new Date();
    const demoUser: User = {
      id: "demo-1",
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
      createdAt: now,
      updatedAt: now,
    };

    this.data = {
      users: [demoUser],
      moodLogs: [
        {
          id: this.moodLogId++,
          userId: demoUser.id,
          mood: "happy",
          confidence: 88,
          source: "manual",
          createdAt: new Date(now.getTime() - 60 * 60 * 1000),
        },
      ],
      journals: [
        {
          id: this.journalId++,
          userId: demoUser.id,
          title: "Golden morning check-in",
          content:
            "Woke up with a restless mind but settled into calm after a 6-minute breathing flow. Noting the warmth from the sunrise helped.",
          moodTag: "happy",
          gratitudeItems: ["Sunlight through the window", "Morning tea", "A patient friend"],
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
      ],
      posts: [
        {
          id: this.postId++,
          userId: demoUser.id,
          title: "How golden-hour walks reset my nervous system",
          content:
            "When I step outside just as the light turns honey-gold, everything slows down. Sharing three breath cues that keep me present…",
          category: "wellness",
          moodTag: "happy",
          imageUrl: null,
          upvotes: 42,
          isFlagged: false,
          isBlurred: false,
          createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
          updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        },
      ],
      comments: [],
      upvotes: [],
      conversations: [],
      reports: [],
    };
  }

  private ensureUser(id: string) {
    const existing = this.data.users.find((u) => u.id === id);
    if (!existing) {
      const now = new Date();
      const fallback: User = {
        id,
        email: `${id}@example.com`,
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
        isGuest: false,
        hasCompletedTour: false,
        hasConsentedCamera: false,
        hasConsentedMic: false,
        hasConsentedData: false,
        currentMood: "neutral",
        createdAt: now,
        updatedAt: now,
      };
      this.data.users.push(fallback);
      return fallback;
    }
    return existing;
  }

  async getUser(id: string) {
    return this.data.users.find((user) => user.id === id);
  }

  async getUserByEmail(email: string) {
    return this.data.users.find((user) => user.email === email);
  }

  async upsertUser(userData: UpsertUser) {
    const id = userData.id ?? randomUUID();
    const now = new Date();
    const existing = await this.getUser(id);
    if (existing) {
      Object.assign(existing, {
        ...userData,
        id,
        updatedAt: now,
      });
      return existing;
    }

    const created: User = {
      id,
      email: userData.email ?? `${id}@example.com`,
      firstName: userData.firstName ?? "Demo",
      lastName: userData.lastName ?? "User",
      profileImageUrl: userData.profileImageUrl ?? null,
      isGuest: userData.isGuest ?? false,
      hasCompletedTour: userData.hasCompletedTour ?? false,
      hasConsentedCamera: userData.hasConsentedCamera ?? false,
      hasConsentedMic: userData.hasConsentedMic ?? false,
      hasConsentedData: userData.hasConsentedData ?? false,
      currentMood: (userData.currentMood as User["currentMood"]) ?? "neutral",
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(created);
    return created;
  }

  async updateUser(id: string, data: Partial<User>) {
    const user = await this.getUser(id);
    if (!user) return undefined;
    Object.assign(user, data, { updatedAt: new Date() });
    return user;
  }

  async getMoodLogs(userId: string) {
    return this.data.moodLogs
      .filter((log) => log.userId === userId)
      .sort((a, b) => this.getTimestamp(b.createdAt) - this.getTimestamp(a.createdAt));
  }

  async getCurrentMood(userId: string) {
    return (await this.getMoodLogs(userId))[0];
  }

  async createMoodLog(moodLog: InsertMoodLog) {
    const log: MoodLog = {
      id: this.moodLogId++,
      userId: moodLog.userId,
      mood: moodLog.mood,
      confidence: moodLog.confidence ?? 0,
      source: moodLog.source ?? "manual",
      createdAt: new Date(),
    };
    this.data.moodLogs.push(log);
    const user = await this.getUser(moodLog.userId);
    if (user) {
      user.currentMood = moodLog.mood as User["currentMood"];
      user.updatedAt = new Date();
    }
    return log;
  }

  async getJournals(userId: string) {
    return this.data.journals
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => this.getTimestamp(b.createdAt) - this.getTimestamp(a.createdAt));
  }

  async getJournal(id: number) {
    return this.data.journals.find((entry) => entry.id === id);
  }

  async createJournal(journal: InsertJournal) {
    const entry: Journal = {
      id: this.journalId++,
      userId: journal.userId,
      title: journal.title ?? "Untitled entry",
      content: journal.content ?? "",
      moodTag: journal.moodTag ?? null,
      gratitudeItems: journal.gratitudeItems ?? [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.journals.unshift(entry);
    return entry;
  }

  async updateJournal(id: number, data: Partial<Journal>) {
    const journal = await this.getJournal(id);
    if (!journal) return undefined;
    Object.assign(journal, data, { updatedAt: new Date() });
    return journal;
  }

  async deleteJournal(id: number) {
    this.data.journals = this.data.journals.filter((entry) => entry.id !== id);
  }

  private filterPosts(options?: { category?: string; sort?: string; limit?: number }) {
    let results = this.data.posts.filter((post) => !post.isFlagged);
    if (options?.category) {
      results = results.filter((post) => post.category === options.category);
    }
    if (options?.sort === "trending") {
      results = [...results].sort((a, b) => {
        if ((b.upvotes ?? 0) === (a.upvotes ?? 0)) {
          return this.getTimestamp(b.createdAt) - this.getTimestamp(a.createdAt);
        }
        return (b.upvotes ?? 0) - (a.upvotes ?? 0);
      });
    } else {
      results = [...results].sort((a, b) => this.getTimestamp(b.createdAt) - this.getTimestamp(a.createdAt));
    }
    if (options?.limit) {
      results = results.slice(0, options.limit);
    }
    return results;
  }

  async getPosts(options?: { category?: string; sort?: string; limit?: number }) {
    return this.filterPosts(options);
  }

  async getTrendingPosts(limit = 10) {
    return this.filterPosts({ sort: "trending", limit });
  }

  async getPost(id: number) {
    return this.data.posts.find((post) => post.id === id);
  }

  async createPost(post: InsertPost) {
    this.ensureUser(post.userId);
    const entry: Post = {
      id: this.postId++,
      userId: post.userId,
      title: post.title ?? "Shared moment",
      content: post.content ?? "",
      category: post.category ?? "wellness",
      moodTag: post.moodTag ?? null,
      imageUrl: post.imageUrl ?? null,
      upvotes: 0,
      isFlagged: false,
      isBlurred: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.posts.unshift(entry);
    return entry;
  }

  async updatePost(id: number, data: Partial<Post>) {
    const post = await this.getPost(id);
    if (!post) return undefined;
    Object.assign(post, data, { updatedAt: new Date() });
    return post;
  }

  async deletePost(id: number) {
    this.data.posts = this.data.posts.filter((post) => post.id !== id);
  }

  async incrementUpvotes(postId: number) {
    const post = await this.getPost(postId);
    if (post) {
      post.upvotes = (post.upvotes ?? 0) + 1;
      post.updatedAt = new Date();
    }
  }

  async decrementUpvotes(postId: number) {
    const post = await this.getPost(postId);
    if (post) {
      post.upvotes = Math.max((post.upvotes ?? 0) - 1, 0);
      post.updatedAt = new Date();
    }
  }

  async getComments(postId: number) {
    return this.data.comments
      .filter((comment) => comment.postId === postId && !comment.isFlagged)
      .sort((a, b) => this.getTimestamp(b.createdAt) - this.getTimestamp(a.createdAt));
  }

  async createComment(comment: InsertComment) {
    const entry: Comment = {
      id: this.commentId++,
      postId: comment.postId!,
      userId: comment.userId,
      parentId: comment.parentId ?? null,
      content: comment.content ?? "",
      upvotes: 0,
      isFlagged: false,
      createdAt: new Date(),
    };
    this.data.comments.unshift(entry);
    return entry;
  }

  async deleteComment(id: number) {
    this.data.comments = this.data.comments.filter((comment) => comment.id !== id);
  }

  async incrementCommentUpvotes(commentId: number) {
    const comment = this.data.comments.find((c) => c.id === commentId);
    if (comment) {
      comment.upvotes = (comment.upvotes ?? 0) + 1;
    }
  }

  async getUserUpvote(userId: string, postId?: number, commentId?: number) {
    return this.data.upvotes.find((upvote) => {
      if (postId) {
        return upvote.userId === userId && upvote.postId === postId;
      }
      if (commentId) {
        return upvote.userId === userId && upvote.commentId === commentId;
      }
      return false;
    });
  }

  async createUpvote(upvote: InsertUpvote) {
    const entry: Upvote = {
      id: this.upvoteId++,
      userId: upvote.userId,
      postId: upvote.postId ?? null,
      commentId: upvote.commentId ?? null,
      createdAt: new Date(),
    };
    this.data.upvotes.push(entry);
    if (entry.postId) {
      await this.incrementUpvotes(entry.postId);
    }
    return entry;
  }

  async deleteUpvote(id: number) {
    const entry = this.data.upvotes.find((u) => u.id === id);
    if (entry?.postId) {
      await this.decrementUpvotes(entry.postId);
    }
    this.data.upvotes = this.data.upvotes.filter((u) => u.id !== id);
  }

  async getConversation(userId: string) {
    return this.data.conversations
      .filter((conv) => conv.userId === userId)
      .sort((a, b) => this.getTimestamp(b.updatedAt) - this.getTimestamp(a.updatedAt))[0];
  }

  async upsertConversation(userId: string, messages: any[]) {
    const existing = await this.getConversation(userId);
    if (existing) {
      existing.messages = messages as any;
      existing.updatedAt = new Date();
      return existing;
    }

    const entry: Conversation = {
      id: this.conversationId++,
      userId,
      messages: messages as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.conversations.push(entry);
    return entry;
  }

  async createReport(report: InsertReport) {
    const entry: Report = {
      id: this.reportId++,
      reporterId: report.reporterId,
      postId: report.postId ?? null,
      commentId: report.commentId ?? null,
      reason: report.reason ?? "",
      status: "pending",
      createdAt: new Date(),
    };
    this.data.reports.push(entry);
    return entry;
  }
}

export const storage: IStorage = db ? new DatabaseStorage() : new InMemoryStorage();
