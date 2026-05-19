import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupMockAuth, ensureAuthenticated, optionalAuth } from "./auth";
import { 
  chatWithLumi, 
  detectSentiment, 
  getCrisisResources, 
  getFallbackResponse,
  isOpenAIConfigured 
} from "./openaiIntegration";
import { lumiAgent } from "./geminiAgent";
import OpenAI from "openai";
import { z } from "zod";
import {
  insertMoodLogSchema,
  insertJournalSchema,
  insertPostSchema,
  insertCommentSchema,
  insertReportSchema,
  type MoodType,
} from "@shared/schema";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth routes
  setupMockAuth(app);

  // Get current authenticated user
  app.get("/api/auth/user", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user preferences
  app.patch("/api/auth/user", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.updateUser(userId, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // === MOOD ROUTES ===
  
  // Get current mood
  app.get("/api/mood/current", optionalAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moodLog = await storage.getCurrentMood(userId);
      if (moodLog) {
        res.json({ mood: moodLog.mood, confidence: moodLog.confidence });
      } else {
        res.json({ mood: "neutral", confidence: 0 });
      }
    } catch (error) {
      console.error("Error fetching current mood:", error);
      res.status(500).json({ message: "Failed to fetch mood" });
    }
  });

  // Get mood history
  app.get("/api/mood/history", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logs = await storage.getMoodLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching mood history:", error);
      res.status(500).json({ message: "Failed to fetch mood history" });
    }
  });

  // Log mood
  app.post("/api/mood", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertMoodLogSchema.parse({ ...req.body, userId });
      const moodLog = await storage.createMoodLog(data);
      res.json(moodLog);
    } catch (error) {
      console.error("Error logging mood:", error);
      res.status(400).json({ message: "Failed to log mood" });
    }
  });

  // === JOURNAL ROUTES ===

  // Get journals
  app.get("/api/journals", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getJournals(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journals:", error);
      res.status(500).json({ message: "Failed to fetch journals" });
    }
  });

  // Create journal
  app.post("/api/journals", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertJournalSchema.parse({ ...req.body, userId });
      const journal = await storage.createJournal(data);
      res.json(journal);
    } catch (error) {
      console.error("Error creating journal:", error);
      res.status(400).json({ message: "Failed to create journal" });
    }
  });

  // Update journal
  app.patch("/api/journals/:id", ensureAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const journal = await storage.updateJournal(id, req.body);
      res.json(journal);
    } catch (error) {
      console.error("Error updating journal:", error);
      res.status(400).json({ message: "Failed to update journal" });
    }
  });

  // Delete journal
  app.delete("/api/journals/:id", ensureAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJournal(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting journal:", error);
      res.status(400).json({ message: "Failed to delete journal" });
    }
  });

  // === POST ROUTES ===

  // Get posts
  app.get("/api/posts", optionalAuth, async (req: any, res) => {
    try {
      const { category, sort } = req.query;
      const posts = await storage.getPosts({
        category: category as string,
        sort: sort as string,
      });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Get trending posts
  app.get("/api/posts/trending", optionalAuth, async (req: any, res) => {
    try {
      const posts = await storage.getTrendingPosts(10);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching trending posts:", error);
      res.status(500).json({ message: "Failed to fetch trending posts" });
    }
  });

  // Get single post
  app.get("/api/posts/:id", optionalAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  // Create post
  app.post("/api/posts", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(data);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(400).json({ message: "Failed to create post" });
    }
  });

  // Upvote post
  app.post("/api/posts/:id/upvote", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      
      // Check if already upvoted
      const existing = await storage.getUserUpvote(userId, postId);
      if (existing) {
        // Remove upvote
        await storage.deleteUpvote(existing.id);
        await storage.decrementUpvotes(postId);
        return res.json({ upvoted: false });
      }
      
      // Add upvote
      await storage.createUpvote({ userId, postId });
      await storage.incrementUpvotes(postId);
      res.json({ upvoted: true });
    } catch (error) {
      console.error("Error upvoting post:", error);
      res.status(400).json({ message: "Failed to upvote post" });
    }
  });

  // === COMMENT ROUTES ===

  // Get comments for post
  app.get("/api/posts/:id/comments", ensureAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const postComments = await storage.getComments(postId);
      res.json(postComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Create comment
  app.post("/api/posts/:id/comments", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = parseInt(req.params.id);
      const data = insertCommentSchema.parse({ ...req.body, userId, postId });
      const comment = await storage.createComment(data);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Failed to create comment" });
    }
  });

  // === REPORT ROUTES ===

  // Report content
  app.post("/api/reports", ensureAuthenticated, async (req: any, res) => {
    try {
      const reporterId = req.user.claims.sub;
      const data = insertReportSchema.parse({ ...req.body, reporterId });
      const report = await storage.createReport(data);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(400).json({ message: "Failed to create report" });
    }
  });

  // === VOICE AGENT ROUTES ===

  // Chat with Lumi - Intelligent Agent with Gemini/OpenAI/Fallback
  app.post("/api/voice-agent", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, currentMood } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check sentiment for safety first
      const sentiment = detectSentiment(message);
      if (sentiment === 'concerning') {
        const crisisResponse = getCrisisResources();
        return res.json({ response: crisisResponse, sentiment, suggestedAction: { type: 'none' } });
      }

      // Update mood context in agent
      if (currentMood) {
        lumiAgent.setMood(userId, currentMood);
      }

      // Get response from agent
      const agentResponse = await lumiAgent.generateResponse(userId, message);
      
      // Log activity if suggested
      if (agentResponse.suggestedAction?.type && agentResponse.suggestedAction.type !== 'none') {
        lumiAgent.addActivity(userId, agentResponse.suggestedAction.type);
      }

      res.json({ 
        response: agentResponse.response, 
        sentiment,
        suggestedAction: agentResponse.suggestedAction,
        moodInsight: agentResponse.moodInsight,
      });
    } catch (error) {
      console.error("Error in voice agent:", error);
      res.status(500).json({ 
        response: "I'm having a moment - could you try again? I really want to hear what you have to say." 
      });
    }
  });

  // Get session time remaining
  app.get("/api/voice-agent/session", ensureAuthenticated, (req: any, res) => {
    const userId = req.user.claims.sub;
    const remainingTime = lumiAgent.getRemainingTime(userId);
    res.json({ remainingTime });
  });

  // === ANALYSIS ROUTES ===

  // Get user metrics
  app.get("/api/analysis/metrics", ensureAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const moodLogs = await storage.getMoodLogs(userId);
      const journals = await storage.getJournals(userId);

      const totalSessions = moodLogs.filter(m => m.source === "voice-agent").length;
      const activitiesCompleted = journals.length;

      res.json({
        totalSessions,
        totalTime: totalSessions * 3,
        spacesVisited: ["music", "exercises", "journal", "books", "games", "community"],
        activitiesCompleted,
        moodShift: moodLogs.slice(0, 10).map(m => ({ from: "neutral", to: m.mood })),
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  return httpServer;
}
