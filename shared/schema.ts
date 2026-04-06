import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isGuest: boolean("is_guest").default(false),
  hasCompletedTour: boolean("has_completed_tour").default(false),
  hasConsentedCamera: boolean("has_consented_camera").default(false),
  hasConsentedMic: boolean("has_consented_mic").default(false),
  hasConsentedData: boolean("has_consented_data").default(false),
  currentMood: varchar("current_mood"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mood logs
export const moodLogs = pgTable("mood_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mood: varchar("mood").notNull(), // happy, sad, anxious, tired, stressed, neutral
  confidence: integer("confidence").default(0),
  source: varchar("source").default("manual"), // camera, manual, voice
  createdAt: timestamp("created_at").defaultNow(),
});

// Journal entries
export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title"),
  content: text("content").notNull(),
  moodTag: varchar("mood_tag"),
  gratitudeItems: text("gratitude_items").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // anxiety, motivation, wellness, creativity, challenges
  moodTag: varchar("mood_tag"),
  imageUrl: varchar("image_url"),
  upvotes: integer("upvotes").default(0),
  isFlagged: boolean("is_flagged").default(false),
  isBlurred: boolean("is_blurred").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  isFlagged: boolean("is_flagged").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User upvotes tracking
export const upvotes = pgTable("upvotes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: integer("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Music playlists
export const musicPlaylists = pgTable("music_playlists", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  moodTags: text("mood_tags").array(),
  coverImageUrl: varchar("cover_image_url"),
  tracks: jsonb("tracks").default([]),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Books/readings
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  author: varchar("author"),
  description: text("description"),
  content: text("content"),
  category: varchar("category"), // quotes, stories, readings
  coverImageUrl: varchar("cover_image_url"),
  readTime: integer("read_time"), // in minutes
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reading progress
export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  progress: integer("progress").default(0), // percentage
  lastReadAt: timestamp("last_read_at").defaultNow(),
});

// Exercises
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // breathing, meditation, grounding, stretching
  duration: integer("duration"), // in seconds
  steps: jsonb("steps").default([]),
  iconName: varchar("icon_name"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercise completions
export const exerciseCompletions = pgTable("exercise_completions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Games
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // memory, focus, puzzle
  iconName: varchar("icon_name"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Game scores
export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gameId: integer("game_id").notNull().references(() => games.id, { onDelete: "cascade" }),
  score: integer("score").default(0),
  playedAt: timestamp("played_at").defaultNow(),
});

// Voice agent conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  messages: jsonb("messages").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reports for moderation
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  postId: integer("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: integer("comment_id").references(() => comments.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: varchar("status").default("pending"), // pending, reviewed, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  moodLogs: many(moodLogs),
  journals: many(journals),
  posts: many(posts),
  comments: many(comments),
  upvotes: many(upvotes),
  readingProgress: many(readingProgress),
  exerciseCompletions: many(exerciseCompletions),
  gameScores: many(gameScores),
  conversations: many(conversations),
  reports: many(reports),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
  upvotes: many(upvotes),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  author: one(users, { fields: [comments.userId], references: [users.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id] }),
  replies: many(comments),
  upvotes: many(upvotes),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMoodLogSchema = createInsertSchema(moodLogs).omit({ id: true, createdAt: true });
export const insertJournalSchema = createInsertSchema(journals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, createdAt: true, updatedAt: true, upvotes: true, isFlagged: true, isBlurred: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, upvotes: true, isFlagged: true });
export const insertUpvoteSchema = createInsertSchema(upvotes).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reports).omit({ id: true, createdAt: true, status: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMoodLog = z.infer<typeof insertMoodLogSchema>;
export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertJournal = z.infer<typeof insertJournalSchema>;
export type Journal = typeof journals.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertUpvote = z.infer<typeof insertUpvoteSchema>;
export type Upvote = typeof upvotes.$inferSelect;
export type MusicPlaylist = typeof musicPlaylists.$inferSelect;
export type Book = typeof books.$inferSelect;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type ExerciseCompletion = typeof exerciseCompletions.$inferSelect;
export type Game = typeof games.$inferSelect;
export type GameScore = typeof gameScores.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// Mood type for type safety
export type MoodType = "happy" | "sad" | "anxious" | "tired" | "stressed" | "neutral";
export const moodTypes: MoodType[] = ["happy", "sad", "anxious", "tired", "stressed", "neutral"];

// Category type
export type CategoryType = "anxiety" | "motivation" | "wellness" | "creativity" | "challenges";
export const categoryTypes: CategoryType[] = ["anxiety", "motivation", "wellness", "creativity", "challenges"];
