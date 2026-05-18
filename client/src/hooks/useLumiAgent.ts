import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AgentMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SuggestedAction {
  type: 'exercise' | 'music' | 'journal' | 'game' | 'breathe' | 'none';
  details?: string;
}

const SESSION_DURATION = 180;

interface UseLumiAgentReturn {
  messages: AgentMessage[];
  isSpeaking: boolean;
  isListening: boolean;
  timeRemaining: number;
  currentMood: string | null;
  isSessionActive: boolean;
  sendMessage: (message: string) => void;
  startSession: () => void;
  endSession: () => void;
}

export function useLumiAgent(): UseLumiAgentReturn {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const { data: moodData } = useQuery<{ mood: string; confidence: number }>({
    queryKey: ["/api/mood/current"],
  });

  useEffect(() => {
    if (moodData?.mood) {
      setCurrentMood(moodData.mood);
    }
  }, [moodData]);

  useEffect(() => {
    if (!isSessionActive || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSessionActive, timeRemaining]);

  const speakText = useCallback((text: string, rate: number = 0.9) => {
    if (synthRef.current && 'speechSynthesis' in window) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.5, Math.min(2, rate));
      utterance.pitch = 1.05;
      utterance.volume = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Delay slightly to ensure previous cancel finishes
      setTimeout(() => {
        synthRef.current?.speak(utterance);
      }, 50);
    }
  }, []);

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/voice-agent", {
        message,
        currentMood,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMsg: AgentMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      speakText(data.response, 0.9);
    },
    onError: () => {
      const errorMsg: AgentMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble responding. Could you try again?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    },
  });

  const sendMessage = useCallback((message: string) => {
    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    sendMutation.mutate(message);
  }, [sendMutation]);

  const startSession = useCallback(() => {
    setIsSessionActive(true);
    setTimeRemaining(SESSION_DURATION);
    setMessages([]);

    const moodGreetings: Record<string, string> = {
      happy: "It's wonderful to see you! What's been the highlight of your day?",
      sad: "I'm here for you. Take your time - what's on your mind?",
      anxious: "I can sense you might be feeling on edge. Let's take it easy - what's going on?",
      stressed: "You've got a lot on your plate. Let's talk through it together. What's been toughest?",
      tired: "You seem low on energy. Let's take things gently. What's been happening?",
      neutral: "Hi there! I'm Lumi. How are you feeling right now? What's been on your mind?",
    };

    const moodKey = currentMood || 'neutral';
    const greeting = moodGreetings[moodKey] || moodGreetings.neutral;
    
    const welcomeMsg: AgentMessage = {
      id: "welcome",
      role: "assistant",
      content: greeting,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
    speakText(greeting, 0.9);
  }, [currentMood, speakText]);

  const endSession = useCallback(() => {
    setIsSessionActive(false);
    
    const closings = [
      "Our time is up. Remember, taking care of your mental health is a journey. I'm always here when you need me. Take care!",
      "Thank you for sharing with me today. You're doing better than you think. Keep checking in with yourself!",
      "It's okay to have difficult feelings - they're part of being human. You're stronger than you know. Take care!",
    ];
    
    const closingMsg: AgentMessage = {
      id: "closing",
      role: "assistant",
      content: closings[Math.floor(Math.random() * closings.length)],
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, closingMsg]);
    speakText(closingMsg.content, 0.9);
  }, [speakText]);

  return {
    messages,
    isSpeaking,
    isListening,
    timeRemaining,
    currentMood,
    isSessionActive,
    sendMessage,
    startSession,
    endSession,
  };
}