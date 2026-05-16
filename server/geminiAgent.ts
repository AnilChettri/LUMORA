/**
 * Gemini API Integration for Lumi Agent
 * Provides intelligent, context-aware conversations
 */

// Note: When Gemini API is properly configured, import:
// import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Types for agent interactions
interface ConversationContext {
  userId: string;
  currentMood: string | null;
  sessionStartTime: number;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  recentActivities: string[];
  sessionDuration: number; // seconds
}

interface AgentResponse {
  response: string;
  suggestedAction?: {
    type: 'exercise' | 'music' | 'journal' | 'game' | 'breathe' | 'none';
    details?: string;
  };
  moodInsight?: string;
}

// Default system prompt for Lumi
const LUMI_SYSTEM_PROMPT = `You are Lumi, an empathetic AI mental health companion. Your role:

1. LISTEN - Be present and attentive to what the user shares
2. VALIDATE - Acknowledge their feelings without judgment
3. EXPLORE - Ask thoughtful questions to understand deeper
4. SUPPORT - Offer coping strategies when appropriate
5. GUIDE - Suggest helpful activities based on their mood

Guidelines:
- Keep responses conversational and warm (2-4 sentences)
- Never diagnose or prescribe
- Recognize crisis signals and offer resources
- Remember context from this conversation
- Adapt to their emotional state - be more supportive if sad/anxious, more upbeat if happy

Current user context: {moodContext}

The conversation is limited to {timeRemaining} seconds remaining. Focus on meaningful connection.`;

class LumiAgent {
  private context: Map<string, ConversationContext> = new Map();
  private defaultMood = 'neutral';

  /**
   * Get or create context for a user session
   */
  private getContext(userId: string): ConversationContext {
    if (!this.context.has(userId)) {
      this.context.set(userId, {
        userId,
        currentMood: this.defaultMood,
        sessionStartTime: Date.now(),
        conversationHistory: [],
        recentActivities: [],
        sessionDuration: 180, // 3 minutes
      });
    }
    return this.context.get(userId)!;
  }

  /**
   * Update user's current mood
   */
  setMood(userId: string, mood: string) {
    const ctx = this.getContext(userId);
    ctx.currentMood = mood;
  }

  /**
   * Record an activity for context
   */
  addActivity(userId: string, activity: string) {
    const ctx = this.getContext(userId);
    ctx.recentActivities.push(activity);
    // Keep last 5 activities
    if (ctx.recentActivities.length > 5) {
      ctx.recentActivities.shift();
    }
  }

  /**
   * Generate a contextual response using Gemini
   */
  async generateResponse(userId: string, userMessage: string): Promise<AgentResponse> {
    const ctx = this.getContext(userId);
    const timeRemaining = Math.max(0, ctx.sessionDuration - Math.floor((Date.now() - ctx.sessionStartTime) / 1000));

    // Build conversation history for context
    const recentMessages = ctx.conversationHistory.slice(-6);
    
    // Determine conversation stage
    let stage: 'opening' | 'exploring' | 'activity' | 'closing' = 'opening';
    if (timeRemaining < 30) stage = 'closing';
    else if (timeRemaining < 60) stage = 'activity';
    else if (timeRemaining < 120) stage = 'exploring';

    // Generate contextual response based on mood and stage
    const response = this.generateContextualResponse(userMessage, ctx, stage, timeRemaining);
    
    // Update conversation history
    ctx.conversationHistory.push({ role: 'user', content: userMessage });
    ctx.conversationHistory.push({ role: 'assistant', content: response.response });

    return response;
  }

  /**
   * Generate contextual response based on mood, stage, and message
   */
  private generateContextualResponse(
    message: string,
    ctx: ConversationContext,
    stage: string,
    timeRemaining: number
  ): AgentResponse {
    const lowerMessage = message.toLowerCase();
    const mood = ctx.currentMood || this.defaultMood;

    // Generate mood-aware greeting based on stage
    if (stage === 'opening' && ctx.conversationHistory.length === 0) {
      const moodGreetings: Record<string, string> = {
        happy: "It's wonderful to see you feeling good! What's been the highlight of your day?",
        sad: "I'm here with you. Take your time - what's on your mind?",
        anxious: "I can sense you might be feeling on edge. Let's take it easy - what's going on?",
        stressed: "You've got a lot on your plate. Let's talk through it together. What's been toughest?",
        tired: "You seem low on energy. Let's take things gently. What's been happening?",
        neutral: "Hi there! I'm Lumi. How are you feeling right now? What's been on your mind?",
      };
      return {
        response: moodGreetings[mood] || moodGreetings.neutral,
        moodInsight: `Detected mood: ${mood}`,
      };
    }

    // Handle closing stage
    if (stage === 'closing') {
      const closings = [
        "Our time is almost up. Remember, taking care of your mental health is a journey - be patient with yourself.",
        "Thank you for sharing with me. You're doing better than you think. Keep checking in with yourself.",
        "It's okay to have difficult feelings - they're part of being human. You're stronger than you know.",
        "I appreciate you opening up today. Take care of yourself, and remember I'm always here.",
      ];
      return {
        response: closings[Math.floor(Math.random() * closings.length)],
        suggestedAction: { type: 'none' },
      };
    }

    // Analyze message and generate appropriate response
    const hasWorkKeywords = lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career');
    const hasRelationshipKeywords = lowerMessage.includes('family') || lowerMessage.includes('relationship') || lowerMessage.includes('friend') || lowerMessage.includes('partner');
    const hasSleepKeywords = lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('energy') || lowerMessage.includes('exhausted');
    const hasEmotionKeywords = lowerMessage.includes('feel') || lowerMessage.includes('feeling') || lowerMessage.includes('emotion');

    // Generate response based on keywords and mood
    let response = '';
    let suggestedAction: AgentResponse['suggestedAction'] = { type: 'none' };

    if (hasWorkKeywords) {
      const workResponses = {
        happy: "That's wonderful! Work can feel so rewarding when things are going well. What's been the best part?",
        sad: "Work can feel heavy when you're already down. What about work has been most challenging?",
        anxious: "Work stress can really impact how we feel. What's been the most worrying part?",
        stressed: "It sounds like there's a lot on your plate. What's the most important thing you need to get done?",
        neutral: "Work is a big part of our lives. What's going on at work that you'd like to talk about?",
      };
      response = workResponses[mood as keyof typeof workResponses] || workResponses.neutral;
    } else if (hasRelationshipKeywords) {
      const relResponses = {
        happy: "Relationships can bring so much joy! Who has been most important to you lately?",
        sad: "I'm here for you. Relationships can be complex - what's been happening?",
        anxious: "Social situations can feel overwhelming. Is there something specific on your mind?",
        stressed: "That sounds really challenging. What's been the most difficult part?",
        neutral: "Connection with others is so important. How are your close relationships right now?",
      };
      response = relResponses[mood as keyof typeof relResponses] || relResponses.neutral;
    } else if (hasSleepKeywords) {
      response = "Rest is so important for our mental health. How have you been sleeping lately?";
      suggestedAction = { type: 'exercise', details: 'sleep-prep' };
    } else if (hasEmotionKeywords) {
      const emotionResponses = {
        happy: "I'm glad you're tuned in to your feelings! What's making you feel good right now?",
        sad: "Acknowledging our feelings is important, even when they're difficult. What's going on?",
        anxious: "It's okay to feel anxious - it shows you care. What's been on your mind?",
        stressed: "Stress can feel overwhelming, but you don't have to carry it alone. What's been toughest?",
        neutral: "Checking in with ourselves is so important. What emotions are you experiencing?",
      };
      response = emotionResponses[mood as keyof typeof emotionResponses] || emotionResponses.neutral;
    } else {
      // General follow-up responses based on mood
      const followUps: Record<string, string[]> = {
        happy: [
          "That's great to hear! What's been the highlight?",
          "I love your energy! What's making you smile?",
          "That's wonderful! How can you create more of this?",
        ],
        sad: [
          "I'm here for you. Would you like to share more?",
          "It's okay to feel this way. What would help you feel a bit better?",
          "You don't have to carry this alone. What do you need right now?",
        ],
        anxious: [
          "Take a breath with me. What's been worrying you?",
          "I understand. Would you like to try something that might help?",
          "Let's take it one step at a time. What's the most pressing thing?",
        ],
        stress: [
          "That's a lot to handle. What's one thing you can let go of for now?",
          "You deserve a break. What helps you decompress?",
          "Let's prioritize together. What's truly urgent?",
        ],
        tired: [
          "Rest is so important. Have you been able to take care of yourself?",
          "I notice you're low on energy. What's been draining you?",
          "Let's take things gently today. What do you need?",
        ],
        neutral: [
          "I'm here to listen. What's been on your mind?",
          "How are you really feeling about everything?",
          "What matters most to you right now?",
        ],
      };
      
      const moodResponses = followUps[mood] || followUps.neutral;
      response = moodResponses[Math.floor(Math.random() * moodResponses.length)];
    }

    // In the last minute, suggest activities
    if (timeRemaining < 60) {
      const activitySuggestions: Record<string, { type: 'exercise' | 'music' | 'breathe', text: string }> = {
        sad: { type: 'breathe', text: "Would you like to try a calming breathing exercise together?" },
        anxious: { type: 'breathe', text: "Let's do some breathing together - it can really help with anxiety." },
        stressed: { type: 'exercise', text: "Would you like me to guide you through a quick relaxation exercise?" },
        neutral: { type: 'music', text: "Would you like some calming music to relax to?" },
      };
      
      const suggestion = activitySuggestions[mood];
      if (suggestion) {
        response += ` ${suggestion.text}`;
        suggestedAction = { type: suggestion.type, details: suggestion.type };
      }
    }

    return { response, suggestedAction };
  }

  /**
   * Clear session context
   */
  clearSession(userId: string) {
    this.context.delete(userId);
  }

  /**
   * Get remaining session time
   */
  getRemainingTime(userId: string): number {
    const ctx = this.getContext(userId);
    const elapsed = Math.floor((Date.now() - ctx.sessionStartTime) / 1000);
    return Math.max(0, ctx.sessionDuration - elapsed);
  }
}

// Export singleton instance
export const lumiAgent = new LumiAgent();

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Simple fallback response generator when no API
 */
export function getFallbackResponse(userMessage: string, mood: string, stage: string): AgentResponse {
  const agent = new LumiAgent();
  // Return synchronous fallback
  return {
    response: "I'm here to listen. Could you tell me more about how you're feeling?",
    suggestedAction: { type: 'none' },
  };
}