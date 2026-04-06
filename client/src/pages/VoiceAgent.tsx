import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { WaveformVisualizer } from "@/components/animations/WaveformVisualizer";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  Mic,
  MicOff,
  Send,
  Keyboard,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedPrompts = [
  "I'm feeling anxious today",
  "Help me relax",
  "I need motivation",
  "Let's do a breathing exercise",
  "Tell me something positive",
  "I want to talk about my day",
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

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/voice-agent", { message });
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

  // Initialize with greeting and auto-start conversation
  useEffect(() => {
    if (!hasInitialized) {
      const greeting = "Hi there! I'm Lumi, your mental health companion. How are you feeling today? You can talk to me about anything - I'm here to listen and support you.";
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      }]);

      // Only auto-speak if user has previously interacted (better UX)
      // TTS will be available via the volume button
      const ttsConsent = localStorage.getItem('tts-auto-play-consent');
      if (ttsConsent === 'true' && 'speechSynthesis' in window) {
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(greeting);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          window.speechSynthesis.speak(utterance);
        }, 500);
      }

      setHasInitialized(true);
    }
  }, [hasInitialized]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Lumi Character Area */}
        <motion.div
          className="flex flex-col items-center justify-center py-8 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <LumiCharacter size="lg" mood={lumiMood} />
          <WaveformVisualizer
            isActive={isListening || isSpeaking}
            className="mt-4"
            variant="default"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap the mic to talk"}
          </p>
        </motion.div>

        {/* Chat Messages */}
        <ScrollArea
          ref={scrollRef}
          className="flex-1 px-4 pb-4"
        >
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    )}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {chatMutation.isPending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                  <LoadingSpinner variant="dots" size="sm" />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        {messages.length <= 2 && !showKeyboard && (
          <motion.div
            className="px-4 pb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Try saying:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.slice(0, 4).map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handlePromptClick(prompt)}
                  data-testid={`button-prompt-${prompt.substring(0, 10)}`}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-background/95 backdrop-blur-sm safe-bottom">
          {showKeyboard ? (
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputText.trim() || chatMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setShowKeyboard(false)}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowKeyboard(true)}
                data-testid="button-show-keyboard"
              >
                <Keyboard className="w-5 h-5" />
              </Button>

              <motion.button
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                  isListening
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                )}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                data-testid="button-voice-toggle"
              >
                {isListening ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </motion.button>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  if (isSpeaking) {
                    window.speechSynthesis?.cancel();
                    setIsSpeaking(false);
                  }
                }}
              >
                {isSpeaking ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
