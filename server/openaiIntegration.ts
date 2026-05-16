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

  const lowerMessage = userMessage.toLowerCase();

  const responses: Record<string, string[]> = {
    greeting: [
      "Hi there! It's nice to hear from you. How are you feeling today?",
      "Hello! I'm here to listen. What's on your mind?",
      "Hey! Great to see you. What's going on?",
      "Hi! How's your day going?",
    ],
    moodCheck: [
      "I'm here for you. Would you like to share more about what you're feeling?",
      "That sounds interesting. How does that make you feel?",
      "I appreciate you telling me. What's been the highlight of your day?",
    ],
    gratitude: [
      "That's wonderful to hear! What are you grateful for today?",
      "Having a gratitude practice can really shift your perspective. What went well?",
      "It's great that you recognize the positive. Want to explore that more?",
    ],
    breathing: [
      "Let's try 4-7-8 breathing: inhale for 4, hold for 7, exhale for 8. Want me to guide you through it?",
      "Breathing can calm your nervous system. Try box breathing: 4 counts in, 4 hold, 4 out, 4 hold.",
      "Great idea! Let's do some mindful breathing together.",
    ],
    anxious: [
      "I hear you. Anxiety can feel overwhelming. Let's take a moment together. Would you like a breathing exercise?",
      "When you're anxious, your breath is your anchor. Want to try the 4-7-8 technique with me?",
      "It's okay to feel anxious. Let's work through this together. Want to try a grounding exercise?",
    ],
    sad: [
      "I'm here with you. It's okay to feel sad. Would you like to talk about it or try something gentle?",
      "I'm sorry you're going through this. Sometimes when we're sad, a small movement or breath can help. Want to try?",
      "I hear you. Would you like to try the 5-4-3-2-1 grounding exercise to feel more steady?",
    ],
    stressed: [
      "Stress can feel heavy. Let's release some tension. Want to try a quick body scan or breathing exercise?",
      "When stress builds up, our body holds it. Would you like to try some gentle stretching or breathing?",
      "I understand stress can be overwhelming. Let's take a step back together. What's one thing you can let go of?",
    ],
    tired: [
      "Rest is important. Would you like to try our sleep prep meditation or some calming music?",
      "You're low on energy. Let's be gentle with yourself today. Want to listen to something soothing?",
      "Tiredness tells us our body needs rest. Want me to put on some calming sounds or guide a short rest?",
    ],
    angry: [
      "I hear that you're frustrated. It's a valid feeling. Would you like to talk it through or try a releasing exercise?",
      "Anger is a signal about what matters to you. Let's channel it constructively. Want to try some movement?",
      "I can hear the frustration. Sometimes a few deep breaths can help process this. Want to try?",
    ],
    happy: [
      "That's wonderful! I love that you're feeling good. What's making you happy today?",
      "It's great to see your positive energy! Want to capture this feeling in your journal or share with the community?",
      "That's awesome! Enjoy this feeling. Is there something you'd like to do to celebrate or extend this?",
    ],
    exercise: [
      "Movement is great for your mood! We have breathing exercises, grounding techniques, and more in our Practices space.",
      "Exercise releases endorphins. Want me to guide you through a quick exercise or direct you to our Practices?",
      "Physical activity can really help. Let's find something that matches your energy level.",
    ],
    sleep: [
      "Sleep is foundational for mental health. Try our sleep prep meditation to wind down gently.",
      "Let's prepare for restful sleep. Want me to guide you through a relaxation or put on sleep sounds?",
      "A good routine helps your body know it's time to rest. Want to try our sleep prep exercise?",
    ],
    journal: [
      "Journaling can help you process thoughts. Want me to suggest a prompt or take you to your journal?",
      "Writing can be very therapeutic. What's on your mind that you'd like to explore?",
      "Your journal is a safe space. Want to write about today or explore a prompt?",
    ],
    community: [
      "Connecting with others can be so supportive. Our community is here for you. Want to share or listen?",
      "You're not alone in this. Our community has people who understand. Want to join the conversation?",
      "Sharing and listening helps us feel connected. Would you like to visit our community space?",
    ],
    music: [
      "Music can shift your mood! Want me to play something calming or energizing based on how you feel?",
      "We have curated soundscapes for different moods. What kind of sounds would help you right now?",
      "Let's find some music that matches what you need. Want calming, energizing, or something else?",
    ],
    games: [
      "Games can be a fun way to take a break and shift your focus. Want to try our bubble popper or memory game?",
      "Sometimes a light game helps reset your mind. Want to try something playful?",
      "A little play can go a long way! Want me to take you to our Play space?",
    ],
    books: [
      "Reading can be a wonderful escape or learning opportunity. Want to explore our Stories space?",
      "Books can transport us and teach us. Want me to show you what's available in our library?",
      "Let's find something inspiring to read. What kind of stories interest you?",
    ],
    help: [
      "I'm here to help! I can guide you to exercises, chat with you, or just listen. What do you need?",
      "You can ask me about breathing, journaling, music, or just talk. How can I support you?",
      "I'm your mental health companion. Tell me what would be most helpful right now.",
    ],
    thanks: [
      "You're welcome! I'm always here for you. Anything else on your mind?",
      "Of course! Helping you is what I'm here for. Let me know if you need anything else.",
      "Happy to help! Feel free to reach out anytime.",
    ],
    goodbye: [
      "Take care! Remember, I'm always here when you need me. Bye for now!",
      "Goodbye! Don't forget to be kind to yourself today. See you next time!",
      "Bye for now! Remember to check in with yourself throughout the day.",
    ],
  };

  if (lowerMessage.match(/hello|hi|hey|greet|good morning|good afternoon|good evening/)) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  }
  
  if (lowerMessage.match(/how are you|how do you feel|what's up|how's it going/)) {
    return responses.moodCheck[Math.floor(Math.random() * responses.moodCheck.length)];
  }
  
  if (lowerMessage.match(/thank|thanks|appreciate|grateful/)) {
    return responses.thanks[Math.floor(Math.random() * responses.thanks.length)];
  }
  
  if (lowerMessage.match(/bye|goodbye|see you|later|gotta go/)) {
    return responses.goodbye[Math.floor(Math.random() * responses.goodbye.length)];
  }

  if (lowerMessage.match(/help|what can you do|what do you do/)) {
    return responses.help[Math.floor(Math.random() * responses.help.length)];
  }

  if (lowerMessage.match(/breath|breathe|inhale|exhale|4-7-8|box breath/)) {
    return responses.breathing[Math.floor(Math.random() * responses.breathing.length)];
  }

  if (lowerMessage.match(/anxious|anxiety|worried|worry|nervous|panic/)) {
    return responses.anxious[Math.floor(Math.random() * responses.anxious.length)];
  }

  if (lowerMessage.match(/sad|down|unhappy|misserable|hopeless/)) {
    return responses.sad[Math.floor(Math.random() * responses.sad.length)];
  }

  if (lowerMessage.match(/stress|stressed|overwhelm|frustrat/)) {
    return responses.stressed[Math.floor(Math.random() * responses.stressed.length)];
  }

  if (lowerMessage.match(/tired|exhausted|sleepy|drowsy|fatigue/)) {
    return responses.tired[Math.floor(Math.random() * responses.tired.length)];
  }

  if (lowerMessage.match(/angry|mad|annoyed|frustrat/)) {
    return responses.angry[Math.floor(Math.random() * responses.angry.length)];
  }

  if (lowerMessage.match(/happy|great|good|awesome|amazing|wonderful|excited|joy/)) {
    return responses.happy[Math.floor(Math.random() * responses.happy.length)];
  }

  if (lowerMessage.match(/exercise|move|walk|workout|stretch|activity/)) {
    return responses.exercise[Math.floor(Math.random() * responses.exercise.length)];
  }

  if (lowerMessage.match(/sleep|tired|rest|bed|night|bedtime|insomnia/)) {
    return responses.sleep[Math.floor(Math.random() * responses.sleep.length)];
  }

  if (lowerMessage.match(/journal|write|diary|reflect|thoughts/)) {
    return responses.journal[Math.floor(Math.random() * responses.journal.length)];
  }

  if (lowerMessage.match(/community|share|others|people|connect|alone/)) {
    return responses.community[Math.floor(Math.random() * responses.community.length)];
  }

  if (lowerMessage.match(/music|sound|listen|playlist|ambient/)) {
    return responses.music[Math.floor(Math.random() * responses.music.length)];
  }

  if (lowerMessage.match(/game|play|bubble|memory|fun/)) {
    return responses.games[Math.floor(Math.random() * responses.games.length)];
  }

  if (lowerMessage.match(/book|read|story|article/)) {
    return responses.books[Math.floor(Math.random() * responses.books.length)];
  }

  const defaultResponses = [
    "I'm here to listen and support you. Can you tell me more about what you're feeling?",
    "That sounds important. How is that affecting you?",
    "I appreciate you sharing that with me. What would help you feel better right now?",
    "Thank you for opening up. Would you like to try something to help with that?",
    "I'm here for you. What's on your mind?",
    "Let's explore this together. What would be helpful for you right now?",
    "I hear you. Would you like to try an activity or keep talking?",
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY && getClient() !== null;
}
