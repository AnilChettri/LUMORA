/**
 * OpenAI Integration for Voice Agent
 * Handles conversation with ChatGPT using context awareness
 */

import OpenAI from 'openai';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationContext {
  userId: string;
  userMood?: string;
  recentActivities?: string[];
  messages: ConversationMessage[];
}

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

/**
 * System prompt for Lumi - Mental Health Companion
 */
const LUMI_SYSTEM_PROMPT = `You are Lumi, a compassionate and supportive mental health companion AI. Your role is to:

1. Listen empathetically to users' feelings and concerns
2. Provide evidence-based coping strategies and wellness techniques
3. Offer suggestions for exercises, meditation, or breathing techniques
4. Encourage journaling and reflection
5. Support users in connecting with the community when appropriate
6. Recognize when professional help might be needed and gently suggest seeking support
7. Maintain a warm, non-judgmental tone
8. Use short, conversational responses (1-3 sentences usually)
9. Never provide medical diagnosis or prescription medications
10. Always prioritize user safety and well-being

Remember:
- You're a supportive companion, not a replacement for professional mental health care
- Be genuine and warm in your responses
- Ask clarifying questions when needed
- Celebrate user achievements and progress
- Offer practical, actionable suggestions`;

/**
 * Chat with OpenAI using conversation history
 */
export async function chatWithLumi(
  message: string,
  context: ConversationContext
): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return getFallbackResponse(message);
    }

    // Build conversation messages
    const messages: ConversationMessage[] = [
      {
        role: 'system',
        content: LUMI_SYSTEM_PROMPT,
      },
      ...context.messages,
      {
        role: 'user',
        content: message,
      },
    ];

    // Call OpenAI API
    const openaiClient = getClient();
    if (!openaiClient) {
      return getFallbackResponse(message);
    }

    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 150,
      top_p: 0.9,
      frequency_penalty: 0.6,
      presence_penalty: 0.5,
    });

    const assistantMessage = response.choices[0]?.message?.content;
    
    if (!assistantMessage) {
      return getFallbackResponse(message);
    }

    return assistantMessage;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getFallbackResponse(message);
  }
}

/**
 * Detect sentiment from user message
 */
export function detectSentiment(message: string): 'positive' | 'neutral' | 'concerning' {
  const concerningKeywords = [
    'suicide', 'harm', 'die', 'death', 'kill', 'hurt myself',
    'can\'t take it', 'give up', 'hopeless', 'worthless',
  ];
  
  const positiveKeywords = [
    'great', 'wonderful', 'amazing', 'happy', 'love', 'best',
    'excited', 'grateful', 'blessed', 'thankful',
  ];

  const lowerMessage = message.toLowerCase();

  // Check for concerning keywords
  for (const keyword of concerningKeywords) {
    if (lowerMessage.includes(keyword)) {
      return 'concerning';
    }
  }

  // Check for positive keywords
  for (const keyword of positiveKeywords) {
    if (lowerMessage.includes(keyword)) {
      return 'positive';
    }
  }

  return 'neutral';
}

/**
 * Get crisis resources if concerning sentiment detected
 */
export function getCrisisResources(): string {
  return `I'm concerned about what you shared. Please reach out for professional support:

🆘 National Suicide Prevention Lifeline: 988 (US)
🆘 Crisis Text Line: Text HOME to 741741
🆘 International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

You matter, and help is available. Would you like to talk to someone right now?`;
}

/**
 * Fallback response when OpenAI is not available
 */
export function getFallbackResponse(userMessage: string): string {
  const sentiment = detectSentiment(userMessage);
  
  if (sentiment === 'concerning') {
    return getCrisisResources();
  }

  // Simple rule-based responses
  const responses: Record<string, string[]> = {
    greeting: [
      "Hi there! It's nice to hear from you. How are you feeling today?",
      "Hello! I'm here to listen. What's on your mind?",
    ],
    breathing: [
      "Great idea! Let's try the 4-7-8 breathing technique: breathe in for 4 counts, hold for 7, exhale for 8. Repeat 4 times.",
      "Breathing exercises can really help. Try box breathing: in-4, hold-4, out-4, hold-4.",
    ],
    exercise: [
      "Movement is wonderful for your mood. A gentle walk or stretching can help release tension.",
      "Exercise boosts your mood! Even a 10-minute walk can make a difference.",
    ],
    sleep: [
      "Good sleep is crucial for mental health. Try our sleep prep meditation before bed.",
      "Tired? Let's help you rest well. A calming routine helps prepare your body for sleep.",
    ],
    journal: [
      "Journaling is a wonderful way to process your thoughts and feelings. Try writing freely without judgment.",
      "Getting your thoughts on paper can be really healing. What would you like to explore?",
    ],
    community: [
      "Connecting with others can be really supportive. Our community is here to listen and understand.",
      "Sharing your experience might help you feel less alone. Would you like to share with the community?",
    ],
  };

  // Detect topic and provide response
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.match(/hello|hi|hey|greet/)) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  }
  if (lowerMessage.match(/breath|anxious|panic|calm/)) {
    return responses.breathing[Math.floor(Math.random() * responses.breathing.length)];
  }
  if (lowerMessage.match(/exercise|move|walk|active/)) {
    return responses.exercise[Math.floor(Math.random() * responses.exercise.length)];
  }
  if (lowerMessage.match(/sleep|tired|rest|bed|night/)) {
    return responses.sleep[Math.floor(Math.random() * responses.sleep.length)];
  }
  if (lowerMessage.match(/journal|write|diary|reflect/)) {
    return responses.journal[Math.floor(Math.random() * responses.journal.length)];
  }
  if (lowerMessage.match(/community|share|others|people/)) {
    return responses.community[Math.floor(Math.random() * responses.community.length)];
  }

  // Default response
  const defaultResponses = [
    "I'm here to listen and support you. Can you tell me more about what you're feeling?",
    "That sounds important. How is that affecting you?",
    "I appreciate you sharing that with me. What would help you feel better right now?",
    "Thank you for opening up. Would you like to try something to help with that?",
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && getClient() !== null;
}
