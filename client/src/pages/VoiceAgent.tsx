import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { WaveformVisualizer } from "@/components/animations/WaveformVisualizer";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { speakText } from "@/lib/aiMocks";
import { cn } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Send,
  Keyboard,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SESSION_DURATION = 180; // 3 minutes

const suggestedPrompts = [
  "I'm feeling anxious today",
  "How are you?",
  "I need motivation",
  "Let's do a breathing exercise",
  "What's been on my mind",
  "I want to talk",
];

export default function VoiceAgent() {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [lumiMood, setLumiMood] = useState<"calm" | "listening" | "thinking" | "happy">("calm");
  
  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [conversationStage, setConversationStage] = useState<'opening' | 'exploring' | 'activity' | 'closing'>('opening');

  // Get current mood
  const { data: moodData } = useQuery<{ mood: string; confidence: number }>({
    queryKey: ["/api/mood/current"],
    retry: true,
  });

  const currentMood = moodData?.mood || 'neutral';

  // Session timer
  useEffect(() => {
    if (!sessionActive || timeRemaining <= 0) return;
    
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
  }, [sessionActive, timeRemaining]);

  // Update conversation stage based on time
  useEffect(() => {
    if (sessionActive) {
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
  }, [timeRemaining, sessionActive]);

  const endSession = useCallback(() => {
    setSessionActive(false);
    const closingMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Our time is almost up. Remember, I'm always here when you need me. Take care of yourself!",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, closingMsg]);
    speakText(closingMsg.content, 0.9);
    setLumiMood("calm");
  }, []);

  const getContextualResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const mood = currentMood;
    
    // Opening stage - first minute
    if (conversationStage === 'opening') {
      const moodGreetings: Record<string, string[]> = {
        happy: ["It's great to see you feeling good! What's been the highlight of your day?", "I love your energy! What's putting that smile on your face?", "You seem happy! Tell me more about what's going well."],
        sad: ["I can sense something's weighing on you. Want to share what's going on?", "I'm here with you. Take your time - what's on your mind?", "It's okay to feel how you're feeling. What's happening?"],
        anxious: ["I notice you might be feeling on edge. Let's take it easy. What's worrying you?", "I'm here to help you feel more calm. What's been on your mind?", "Take a breath with me. What's making you feel overwhelmed?"],
        stressed: ["You've got a lot on your plate. Let's talk through it. What's been toughest?", "I can hear the pressure you're under. What's been most stressful?", "Let's take a moment together. What's been most challenging?"],
        tired: ["You seem low on energy. Let's take things gently. What's been draining you?", "I notice you're feeling tired. Have you been getting enough rest?", "Let's take it easy today. What's been zapping your energy?"],
        neutral: ["How are you really feeling? Take a moment to check in with yourself.", "What's been on your mind lately? How's everything going?", "What's happening in your world? How are you feeling?"],
      };
      
      const responses = moodGreetings[mood] || moodGreetings.neutral;
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Exploring stage - second minute
    if (conversationStage === 'exploring') {
      if (lowerMessage.includes('work') || lowerMessage.includes('job')) {
        return ["That's important. How does that make you feel? Any wins recently?", "Work can be so challenging. What's one thing that's been going well?", "I hear you. Remember to take breaks - your mental health matters."][Math.floor(Math.random() * 3)];
      }
      if (lowerMessage.includes('family') || lowerMessage.includes('relationship') || lowerMessage.includes('friend')) {
        return ["Connection is so important. How are your closest relationships right now?", "Relationships can be complex. What's been most meaningful lately?", "It's okay to set boundaries. How are you navigating that?"][Math.floor(Math.random() * 3)];
      }
      
      const followUps: Record<string, string[]> = {
        happy: ["That's wonderful! What made that possible for you?", "I love hearing that! What's been the best part?", "That's really great. How can you create more of that?"],
        sad: ["I'm here for you. What would help you feel a bit better right now?", "You don't have to carry this alone. What's usually help when you're down?", "Let's find some light together. What do you need?"],
        anxious: ["That makes sense. Would you like to try something that might help?", "I understand. How about we do some breathing together?", "What's one thing you can control right now?"],
        stressed: ["That's a lot to handle. What's one thing you can let go of for now?", "You deserve a break. What helps you decompress?", "Let's prioritize - what's truly urgent?"],
        neutral: ["What matters most to you right now? What are you working toward?", "How are you taking care of yourself?", "What's one thing you'd like to improve?"],
      };
      
      return (followUps[mood] || followUps.neutral)[Math.floor(Math.random() * 3)];
    }
    
    // Activity stage - third minute
    if (conversationStage === 'activity') {
      const activityPrompts: Record<string, string[]> = {
        sad: ["Would you like to try a gentle grounding exercise together?", "How about we do some breathing? It can really help.", "Want to try something that might help? I can guide you."],
        anxious: ["Let's do some calming breath together. Want to try the 4-7-8?", "I think some gentle movement might help. A quick stretch?", "Would you like me to put on some calming music?"],
        stressed: ["Let's release some tension. Want to try a quick body scan?", "I think a quick break would help. Breathing together?", "Would you like to try a light game to take your mind off things?"],
        neutral: ["What's something you'd like to do right now? Exercise, music, or keep chatting?", "How would you like to spend our remaining time?", "What would be most helpful for you?"],
      };
      
      return (activityPrompts[mood] || activityPrompts.neutral)[Math.floor(Math.random() * 3)];
    }
    
    // Closing
    const closings = [
      "Before we wrap up - remember, taking care of your mental health is a journey. Be patient with yourself.",
      "Thank you for sharing with me. You're doing better than you think. Keep checking in.",
      "It's okay to have difficult feelings - they're part of being human. You're doing great.",
      "I appreciate you opening up today. You're stronger than you know. Take care!",
    ];
    return closings[Math.floor(Math.random() * closings.length)];
  }, [currentMood, conversationStage]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // Use the server API for smarter responses
      const response = await apiRequest("POST", "/api/voice-agent", {
        message,
        currentMood,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLumiMood("happy");
      setTimeout(() => setLumiMood("calm"), 2000);

      // Speak the response using Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.cancel(); // Cancel any ongoing speech
        window.speechSynthesis.speak(utterance); // Enabled TTS
      }
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I couldn't process that right now. Could you try again? Remember, I'm always here for you.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setLumiMood("calm");
    },
  });

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setLumiMood("thinking");
    chatMutation.mutate(text);
  }, [inputText, chatMutation]);

  const handlePromptClick = (prompt: string) => {
    setInputText(prompt);
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: prompt,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setLumiMood("thinking");
      chatMutation.mutate(prompt);
    }, 100);
  };

  const toggleListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech recognition not available",
        description: "Try typing your message instead.",
        variant: "destructive",
      });
      setShowKeyboard(true);
      return;
    }

    if (isListening) {
      setIsListening(false);
      setLumiMood("calm");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setLumiMood("listening");
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setInputText(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (inputText.trim()) {
        handleSend();
      } else {
        setLumiMood("calm");
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setLumiMood("calm");
      toast({
        title: "Couldn't hear you",
        description: "Please try speaking again or use the keyboard.",
      });
    };

    recognition.start();
  }, [isListening, inputText, handleSend, toast]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize with greeting and start session
  useEffect(() => {
    if (!hasInitialized) {
      // Start the 3-minute session
      setSessionActive(true);
      setTimeRemaining(SESSION_DURATION);
      
      const moodIntros: Record<string, string> = {
        happy: "It's wonderful to see you! What's been the highlight of your day?",
        sad: "I'm here for you. Take your time - what's on your mind?",
        anxious: "I can sense you might be feeling on edge. Let's take it easy - what's going on?",
        stressed: "You've got a lot on your plate. Let's talk through it together. What's been toughest?",
        tired: "You seem low on energy. Let's take things gently. What's been happening?",
        neutral: "Hi there! I'm Lumi. How are you feeling right now? What's been on your mind?",
      };
      
      const greeting = moodIntros[currentMood as keyof typeof moodIntros] || moodIntros.neutral;
      
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      }]);

      // Speak the greeting
      const ttsConsent = localStorage.getItem('tts-auto-play-consent');
      if (ttsConsent === 'true' && 'speechSynthesis' in window) {
        setTimeout(() => {
          speakText(greeting, 0.9);
          setIsSpeaking(true);
        }, 500);
      }

      setHasInitialized(true);
    }
  }, [hasInitialized, currentMood]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Header />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full gap-8 p-4 md:p-8">
        {/* Lumi Visualization Area - Left Column */}
        <motion.div
          className="flex-1 flex flex-col items-center justify-center super-glass rounded-[3rem] p-10 border-white/20 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          
          {/* Session Status Overlay */}
          {sessionActive && (
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-2.5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-70">Session Active</span>
              </div>
              <div className="flex items-center gap-4 bg-black/20 backdrop-blur-xl rounded-2xl px-5 py-2.5 border border-white/10">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono font-bold">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center">
            <div className="scale-125 mb-12">
              <LumiCharacter size="lg" mood={lumiMood} />
            </div>
            
            <div className="space-y-6 text-center">
              <WaveformVisualizer
                isActive={isListening || isSpeaking}
                className="scale-150"
                variant="default"
              />
              <motion.div
                key={isListening ? "listen" : isSpeaking ? "speak" : "idle"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-2 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-widest text-xs"
              >
                {isListening ? "I'm listening..." : isSpeaking ? "Lumi is speaking" : "Ready to chat"}
              </motion.div>
            </div>
          </div>

          {/* Session Progress Bottom */}
          <div className="absolute bottom-8 left-8 right-8 space-y-3">
             <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                <span>{conversationStage}</span>
                <span>{Math.round(((SESSION_DURATION - timeRemaining) / SESSION_DURATION) * 100)}%</span>
             </div>
             <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]"
                  initial={{ width: 0 }}
                  animate={{ width: `${((SESSION_DURATION - timeRemaining) / SESSION_DURATION) * 100}%` }}
                />
             </div>
          </div>
        </motion.div>

        {/* Chat Messages Area - Right Column */}
        <div className="flex-[1.5] flex flex-col super-glass rounded-[3rem] border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Conversation
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-500/10 hover:text-rose-500" onClick={endSession}>
                <MicOff className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <ScrollArea
            ref={scrollRef}
            className="flex-1 p-6"
          >
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: message.role === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-[2rem] px-6 py-4 shadow-lg transition-all",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-md"
                          : "glass-card border-white/10 rounded-tl-md text-foreground"
                      )}
                      data-testid={`message-${message.role}-${message.id}`}
                    >
                      <p className="text-base leading-relaxed">{message.content}</p>
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50",
                        message.role === "user" ? "text-right" : "text-left"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {chatMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass-card rounded-[2rem] rounded-tl-md px-6 py-4 border-white/10">
                    <LoadingSpinner variant="dots" size="sm" />
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Interaction Area */}
          <div className="p-8 border-t border-white/10 bg-white/5 backdrop-blur-xl">
            {/* Suggested Prompts */}
            {messages.length <= 2 && !showKeyboard && (
              <motion.div
                className="mb-6 flex flex-wrap gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {suggestedPrompts.slice(0, 4).map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    className="rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-xs font-bold"
                    onClick={() => handlePromptClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </motion.div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? "Lumi is listening..." : "Type your message..."}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="h-16 rounded-2xl border-none bg-primary/5 focus-visible:ring-primary text-lg px-6"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn("h-12 w-12 rounded-xl transition-all", isListening && "text-rose-500 bg-rose-500/10")}
                    onClick={toggleListening}
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-12 w-12 rounded-xl text-primary"
                    onClick={handleSend}
                    disabled={!inputText.trim() || chatMutation.isPending}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-16 w-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => {
                  if (isSpeaking) {
                    window.speechSynthesis?.cancel();
                    setIsSpeaking(false);
                  }
                }}
              >
                {isSpeaking ? (
                  <VolumeX className="w-6 h-6 text-rose-500" />
                ) : (
                  <Volume2 className="w-6 h-6 text-primary" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
