import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { speakText } from "@/lib/aiMocks";

const SESSION_DURATION = 180; // 3 minutes in seconds
const POLLING_INTERVAL = 3000; // Check mood every 3 seconds

interface MoodState {
  mood: string | null;
  confidence: number;
}

export function useVoiceSession() {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [conversationStage, setConversationStage] = useState<'opening' | 'exploring' | 'activity' | 'closing'>('opening');
  const [hasCheckedMood, setHasCheckedMood] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const moodCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current mood
  const { data: moodData } = useQuery<{ mood: string; confidence: number }>({
    queryKey: ["/api/mood/current"],
    retry: true,
    refetchInterval: POLLING_INTERVAL,
  });

  // Update mood from API
  useEffect(() => {
    if (moodData?.mood && !hasCheckedMood) {
      setCurrentMood(moodData.mood);
      setHasCheckedMood(true);
    }
  }, [moodData, hasCheckedMood]);

  // Session timer
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeRemaining]);

  // Update conversation stage based on time
  useEffect(() => {
    if (isActive) {
      if (timeRemaining > 120) {
        setConversationStage('opening');
      } else if (timeRemaining > 60) {
        setConversationStage('exploring');
      } else if (timeRemaining > 30) {
        setConversationStage('activity');
      } else {
        setConversationStage('closing');
      }
    }
  }, [timeRemaining, isActive]);

  const startSession = useCallback(() => {
    setIsActive(true);
    setTimeRemaining(SESSION_DURATION);
    setHasCheckedMood(false);
    setConversationStage('opening');
  }, []);

  const endSession = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (moodCheckRef.current) clearInterval(moodCheckRef.current);
    
    // Speak closing message
    speakText("Our time is almost up. Remember, I'm always here when you need me. Take care of yourself!", 0.9);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get contextual response based on conversation stage and detected mood
  const getContextualResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const mood = currentMood || 'neutral';
    
    if (conversationStage === 'opening') {
      // First minute - establishing connection
      const moodIntros: Record<string, string[]> = {
        happy: ["It's great to see you feeling good! What's been the highlight?", "I love your energy today! What's making you smile?", "You seem happy! What's putting that smile on your face?"],
        sad: ["I can sense something's weighing on you. Want to share what's going on?", "I'm here with you. Take your time, what's on your mind?", "You know, it's completely okay to feel how you're feeling. What's happening?"],
        anxious: ["I notice you might be feeling a bit on edge. Let's take it easy. What's worrying you?", "I'm here to help you feel more calm. What's been on your mind?", "Take a breath with me. What's making you feel overwhelmed?"],
        stressed: ["Sounds like you've got a lot on your plate. Let's talk through it. What's been toughest?", "I can hear the pressure you're under. What's been most stressful?", "Let's take a moment together. What's been most challenging lately?"],
        tired: ["You seem low on energy. Let's take things gently. What's been draining you?", "I notice you're feeling tired. Have you been getting enough rest?", "Let's take it easy today. What's been zapping your energy?"],
        neutral: ["How are you really feeling? Take a moment to check in with yourself.", "What's been on your mind lately? How's everything going?", "What's happening in your world? How are you feeling about things?"],
      };
      
      const responses = moodIntros[mood] || moodIntros.neutral;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (conversationStage === 'exploring') {
      // Second minute - deeper exploration
      if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('career')) {
        const workResponses = ["That's important. How does that make you feel? Any wins recently you're proud of?", "Work can be so challenging. What's one thing that's been going well?", "I hear you. Remember to take breaks - your mental health matters. What's been the most demanding part?"];
        return workResponses[Math.floor(Math.random() * workResponses.length)];
      }
      
      if (lowerMessage.includes('relationship') || lowerMessage.includes('family') || lowerMessage.includes('friend')) {
        const relResponses = ["Relationships can be so complex. What's been the most meaningful connection for you lately?", "Connection is so important. How are your closest relationships right now?", "It's okay to set boundaries with people. How are you navigating that?"];
        return relResponses[Math.floor(Math.random() * relResponses.length)];
      }
      
      if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('energy')) {
        return "Rest is so important for mental health. Have you been able to get good sleep lately?";
      }
      
      // General follow-up based on mood
      const followUps: Record<string, string[]> = {
        happy: ["That's wonderful! What made that possible for you?", "I love hearing that! What's been the best part of your day?", "That's really great. How can you create more of that?"],
        sad: ["I'm here for you. Would you like to try something that might help?", "You don't have to carry this alone. What would help you feel a bit better right now?", "It's okay to feel this way. Let's find some light together. What usually helps you when you're down?"],
        anxious: ["That makes sense. Let's take a breath together. What helps you feel more calm?", "I understand. Would you like to try a quick breathing exercise?", "What's one thing you can control right now? Let's focus on that."],
        stressed: ["That's a lot to handle. What's one thing you can let go of for now?", "You deserve a break. What helps you decompress?", "Let's prioritize - what's truly urgent versus what can wait?"],
        neutral: ["What matters most to you right now? What are you working toward?", "How are you taking care of yourself? Any self-care rituals?", "What's one thing you'd like to improve or change?"],
      };
      
      const responses = followUps[mood] || followUps.neutral;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (conversationStage === 'activity') {
      // Third minute - suggesting activities
      const activityPrompts: Record<string, string[]> = {
        sad: ["Would you like to try a gentle grounding exercise together? It might help you feel more steady.", "How about we do some breathing together? It can really shift how you're feeling.", "Want to try something that might help? I can guide you through a quick exercise."],
        anxious: ["Let's do some calming breath together. Want to try the 4-7-8 technique?", "I think some gentle movement might help. How about a quick stretching break?", "Would you like me to put on some calming music to help you relax?"],
        stressed: ["Let's release some tension. Want to try a quick body scan or some stretching?", "I think a quick break would help. How about we do some breathing together?", "Would you like to try a light game to take your mind off things?"],
        neutral: ["What's something you'd like to do right now? We could try an exercise, some music, or just keep chatting.", "How would you like to spend the rest of our time? I can suggest something or we can keep talking.", "What would be most helpful for you right now?"],
      };
      
      const responses = activityPrompts[mood] || activityPrompts.neutral;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Closing - final 30 seconds
    const closingResponses = [
      "Before we wrap up, remember that taking care of your mental health is a journey. Be patient with yourself.",
      "Thank you for sharing with me. You're doing better than you think. Keep checking in with yourself.",
      "Remember, it's okay to have difficult feelings. They're part of being human. You're doing great.",
      "I appreciate you opening up today. You're stronger than you know. Take care of yourself.",
    ];
    return closingResponses[Math.floor(Math.random() * closingResponses.length)];
  }, [currentMood, conversationStage]);

  return {
    isActive,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    currentMood,
    conversationStage,
    startSession,
    endSession,
    getContextualResponse,
    progress: ((SESSION_DURATION - timeRemaining) / SESSION_DURATION) * 100,
  };
}