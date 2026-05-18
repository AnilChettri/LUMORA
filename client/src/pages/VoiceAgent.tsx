import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { WaveformVisualizer } from "@/components/animations/WaveformVisualizer";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { SpaceTour } from "@/components/SpaceTour";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { MoodType } from "@shared/schema";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  ArrowRight,
  X,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SESSION_DURATION = 180;
const SKIP_PROMPT_TIME = 20;

export default function VoiceAgent() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { completeOnboarding } = useOnboarding();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const params = new URLSearchParams(location?.split("?")[1] || "");
  const isOnboarding = params.get("onboarding") === "true";
  const initialMoodParam = params.get("initialMood");

  const [showSpaceTour, setShowSpaceTour] = useState(false);
  const [initialMood, setInitialMood] = useState<string>(initialMoodParam || "neutral");
  const [verifiedMood, setVerifiedMood] = useState<string>(initialMoodParam || "neutral");

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lumiMood, setLumiMood] = useState<"calm" | "listening" | "thinking" | "happy">("calm");
  const [sessionActive, setSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [skipPromptShown, setSkipPromptShown] = useState(false);
  const [conversationEnded, setConversationEnded] = useState(false);

  const { data: moodData } = useQuery<{ mood: string; confidence: number }>({
    queryKey: ["/api/mood/current"],
    retry: true,
  });

  const currentMood = moodData?.mood || initialMood;

  useEffect(() => {
    if (moodData?.mood) {
      setInitialMood(moodData.mood);
    }
  }, [moodData]);

  useEffect(() => {
    if (!sessionActive || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          endSession();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive, timeRemaining]);

  useEffect(() => {
    if (!sessionActive || conversationEnded || skipPromptShown) return;

    const elapsed = SESSION_DURATION - timeRemaining;

    if (elapsed >= SKIP_PROMPT_TIME && timeRemaining > 0) {
      setSkipPromptShown(true);
      setShowEndPopup(true);
    }
  }, [timeRemaining, sessionActive, conversationEnded, skipPromptShown]);

  const speak = useCallback((text: string, callback?: () => void) => {
    if (!('speechSynthesis' in window)) {
      if (callback) callback();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };

    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Speech not supported", description: "Use keyboard instead" });
      return;
    }

    setIsListening(true);
    setLumiMood("listening");
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      finalTranscript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript);
      } else {
        setLumiMood("calm");
        speak("I didn't catch that. Could you try again?");
        setTimeout(() => startListening(), 100);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setLumiMood("calm");
    };

    recognition.start();
  }, [speak, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setLumiMood("calm");
  }, []);

  const sendMessage = useCallback((text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setLumiMood("thinking");

    chatMutation.mutate(text);
  }, []);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/voice-agent", {
        message,
        currentMood,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLumiMood("happy");
      setTimeout(() => setLumiMood("calm"), 2000);

      speak(data.response, () => {
        if (!conversationEnded) {
          setTimeout(() => startListening(), 500);
        }
      });
    },
    onError: () => {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble understanding. Could you try again?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speak("I'm having trouble understanding. Could you try again?", () => {
        if (!conversationEnded) {
          setTimeout(() => startListening(), 500);
        }
      });
    },
  });

  const handleSend = useCallback(() => {
    if (!inputText.trim() || chatMutation.isPending) return;
    if (recognitionRef.current) recognitionRef.current.abort();
    sendMessage(inputText.trim());
    setInputText("");
  }, [inputText, chatMutation.isPending, sendMessage]);

  const endSession = useCallback(() => {
    if (conversationEnded) return;
    setConversationEnded(true);
    setSessionActive(false);
    stopSpeaking();

    const userMessages = messages.filter(m => m.role === "user").map(m => m.content.toLowerCase());
    let analyzedMood: MoodType = currentMood as MoodType;

    if (userMessages.some(m => m.includes("happy") || m.includes("good") || m.includes("great"))) {
      analyzedMood = "happy";
    } else if (userMessages.some(m => m.includes("sad") || m.includes("down") || m.includes("bad"))) {
      analyzedMood = "sad";
    } else if (userMessages.some(m => m.includes("anxious") || m.includes("worried") || m.includes("nervous"))) {
      analyzedMood = "anxious";
    } else if (userMessages.some(m => m.includes("tired") || m.includes("exhausted"))) {
      analyzedMood = "tired";
    } else if (userMessages.some(m => m.includes("stress") || m.includes("overwhelm"))) {
      analyzedMood = "stressed";
    }

    setVerifiedMood(analyzedMood);

    apiRequest("POST", "/api/mood", { mood: analyzedMood, confidence: 85, source: "voice-agent" })
      .then(() => queryClient.invalidateQueries({ queryKey: ["/api/mood/current"] }));

    const goodbyeMsg = "Our session is complete. It was wonderful talking with you. Now let me guide you through some wellness spaces designed for your mood. Take care of yourself!";
    const agentMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: "assistant",
      content: goodbyeMsg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, agentMessage]);

    speak(goodbyeMsg, () => {
      setTimeout(() => {
        if (isOnboarding) {
          completeOnboarding();
        }
        setShowSpaceTour(true);
      }, 1500);
    });
  }, [messages, currentMood, isOnboarding, completeOnboarding, speak, stopSpeaking, setLocation, conversationEnded]);

  const handleContinue = () => {
    setShowEndPopup(false);
    speak("Let's continue our conversation. Tell me more about how you're feeling.", () => {
      setTimeout(() => startListening(), 500);
    });
  };

  const handleEndNow = () => {
    setShowEndPopup(false);
    endSession();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!hasInitialized && currentMood) {
      setSessionActive(true);
      setTimeRemaining(SESSION_DURATION);

      const greeting = `Hi there! I'm Lumi. I detected you're feeling ${currentMood}. Let's have a meaningful conversation. Tell me, what's been on your mind lately?`;

      setMessages([{
        id: "welcome",
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      }]);

      setHasInitialized(true);

      speak(greeting, () => {
        setTimeout(() => startListening(), 800);
      });

      navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
        toast({ title: "Microphone access recommended", description: "Enable mic for voice chat" });
      });
    }
  }, [hasInitialized, currentMood, speak, startListening, toast]);

  if (showSpaceTour) {
    return (
      <SpaceTour
        key={`tour-${Date.now()}`}
        initialMood={initialMood}
        verifiedMood={verifiedMood}
        onComplete={() => {
          setShowSpaceTour(false);
          setLocation("/");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full gap-8 p-4 md:p-8">
        <motion.div
          className="flex-1 flex flex-col items-center justify-center super-glass rounded-[3rem] p-10 border-white/20 shadow-2xl relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
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

            <WaveformVisualizer
              isActive={isListening || isSpeaking}
              className="scale-150"
              variant="default"
            />

            <motion.div
              key={isListening ? "listen" : isSpeaking ? "speak" : "idle"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 px-6 py-2 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-widest text-xs"
            >
              {isListening ? "I'm listening..." : isSpeaking ? "Speaking..." : "Ready"}
            </motion.div>
          </div>

          <div className="absolute bottom-8 left-8 right-8">
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${((SESSION_DURATION - timeRemaining) / SESSION_DURATION) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <div className="flex-[1.5] flex flex-col super-glass rounded-[3rem] border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Conversation with Lumi
            </h2>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-500/10 hover:text-rose-500" onClick={endSession}>
              <MicOff className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea ref={scrollRef} className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-[2rem] px-6 py-4 shadow-lg",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "glass-card border-white/10 rounded-tl-md"
                    )}
                  >
                    <p className="text-base leading-relaxed">{message.content}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-50">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {chatMutation.isPending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="glass-card rounded-[2rem] rounded-tl-md px-6 py-4 border-white/10">
                    <LoadingSpinner variant="dots" size="sm" />
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          <div className="p-8 border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={isListening ? "Listening..." : "Type your message..."}
                  className="h-16 rounded-2xl border-none bg-primary/5 text-lg px-6"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn("h-12 w-12 rounded-xl transition-all", isListening && "text-rose-500 bg-rose-500/10")}
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
                className="h-16 w-16 rounded-2xl"
                onClick={() => isSpeaking ? stopSpeaking() : (() => {
                  const lastMsg = [...messages].reverse().find(m => m.role === 'assistant');
                  if (lastMsg) speak(lastMsg.content);
                })()}
              >
                {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEndPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="bg-slate-900 border-purple-500/30 rounded-3xl p-8 max-w-md mx-4">
                <div className="flex items-center justify-between mb-6">
                  <LumiCharacter size="md" mood="listening" />
                  <Button variant="ghost" size="icon" onClick={handleContinue}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-4">
                  Skip Voice Agent?
                </h3>
                <p className="text-white/60 text-center mb-8">
                  You've been chatting for 20 seconds. Would you like to skip the voice agent and go directly to the wellness spaces?
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleEndNow}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-white/20 text-white/70 font-bold"
                  >
                    Skip Voice Agent
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    onClick={handleContinue}
                    className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                  >
                    Continue Chat
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}