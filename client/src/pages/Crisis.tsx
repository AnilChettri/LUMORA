import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { BreathingCircle } from "@/components/animations/BreathingCircle";
import { ParticleField } from "@/components/animations/ParticleField";
import { cn } from "@/lib/utils";
import {
  Phone,
  MessageCircle,
  Heart,
  ArrowLeft,
  ExternalLink,
  Shield,
  Wind,
  Users,
} from "lucide-react";
import { useState } from "react";

const crisisResources = [
  {
    name: "National Suicide Prevention Lifeline",
    number: "988",
    description: "24/7 crisis support",
    country: "USA",
    primary: true,
  },
  {
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    description: "Text-based crisis support",
    country: "USA",
    textBased: true,
  },
  {
    name: "SAMHSA National Helpline",
    number: "1-800-662-4357",
    description: "Mental health & substance abuse support",
    country: "USA",
  },
  {
    name: "International Association for Suicide Prevention",
    number: "https://www.iasp.info/resources/Crisis_Centres/",
    description: "Find resources in your country",
    international: true,
  },
];

const groundingSteps = [
  "Look around and name 5 things you can see",
  "Notice 4 things you can touch or feel",
  "Listen for 3 sounds around you",
  "Identify 2 things you can smell",
  "Notice 1 thing you can taste",
];

export default function Crisis() {
  const [showBreathing, setShowBreathing] = useState(false);
  const [currentGroundingStep, setCurrentGroundingStep] = useState(0);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Immersive Soothing Background */}
      <div className="fixed inset-0 -z-20 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-br from-rose-950/20 via-slate-950 to-indigo-950/20" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.08),transparent_60%)]" />
         <div className="absolute inset-0 bg-[radial_gradient(circle_at_bottom,rgba(99,102,241,0.08),transparent_60%)]" />
      </div>
      
      <ParticleField count={30} color="mixed" />
      
      {/* Clean Header */}
      <header className="sticky top-0 z-50 bg-rose-600/10 backdrop-blur-xl border-b border-rose-500/20 text-white">
        <div className="container px-4 h-16 flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-xl font-bold hover:bg-white/10 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return
            </Button>
          </Link>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/30">
            <Shield className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-rose-100">Immediate Support</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
             <Heart className="w-5 h-5 text-rose-400 fill-current" />
          </div>
        </div>
      </header>

      <div className="container px-4 py-12 max-w-2xl mx-auto space-y-10">
        {/* Lumi Message - Highly Immersive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 super-glass border-rose-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 blur-[60px] -z-10" />
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
              <div className="shrink-0 p-4 rounded-[2rem] bg-white/5 border border-white/10 shadow-inner">
                 <LumiCharacter size="lg" mood="calm" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-display font-bold leading-tight">I Am <span className="text-rose-400">With You.</span></h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Deep breaths. You are in a safe space. No matter how dark it feels, there is a path forward. 
                  Reach out to these specialized teams—they are waiting to hold space for you right now.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Crisis Hotlines - Urgent Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between px-2">
             <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
               <Phone className="w-4 h-4" />
               National Support Lines
             </h2>
             <Badge className="bg-rose-500 text-white animate-pulse border-none px-3">24/7 Available</Badge>
          </div>

          <div className="space-y-4">
            {crisisResources.map((resource, index) => (
              <Card
                key={index}
                className={cn(
                  "p-6 glass-card border-white/10 hover:border-rose-500/40 transition-all duration-500 rounded-[2rem] group",
                  resource.primary && "border-rose-500/30 bg-rose-500/5"
                )}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xl font-display font-bold group-hover:text-rose-400 transition-colors">{resource.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resource.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{resource.country || "Global"}</span>
                       {resource.textBased && <Badge variant="outline" className="text-[9px] border-rose-500/20 text-rose-400">TEXT ONLY</Badge>}
                    </div>
                  </div>
                  
                  <div className="shrink-0">
                    {resource.international ? (
                      <Button className="rounded-xl h-12 px-6 font-bold bg-white/5 hover:bg-white/10 border-white/10" asChild>
                        <a href={resource.number} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Sites
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        className={cn(
                          "rounded-xl h-14 px-8 font-bold shadow-lg shadow-rose-500/10 hover:scale-105 transition-transform",
                          resource.primary ? "bg-rose-600 hover:bg-rose-500" : "bg-white/5 hover:bg-white/10"
                        )}
                        asChild
                      >
                        <a href={`tel:${resource.number.replace(/[^0-9]/g, '')}`}>
                          <Phone className="w-5 h-5 mr-3 fill-current" />
                          {resource.number}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Immediate Grounding Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-2">
             <Wind className="w-4 h-4" />
             Instant Grounding
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breathing Exercise */}
            <Card className="p-8 glass-card border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[320px] text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold">Guided Breath</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Restore Balance</p>
              </div>
              
              {showBreathing ? (
                <div className="flex flex-col items-center space-y-8">
                  <BreathingCircle 
                    pattern="relaxing" 
                    isActive={showBreathing} 
                    size="lg"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowBreathing(false)}
                    className="rounded-full text-rose-400 font-bold hover:bg-rose-500/10"
                  >
                    Finish Session
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full h-14 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20"
                  onClick={() => setShowBreathing(true)}
                  data-testid="button-start-breathing"
                >
                  <Wind className="w-5 h-5 mr-3" />
                  Begin Breathing
                </Button>
              )}
            </Card>

            {/* Grounding Exercise */}
            <Card className="p-8 glass-card border-white/10 rounded-[2.5rem] flex flex-col space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-display font-bold">5-4-3-2-1 Technique</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Connect to Presence</p>
              </div>
              
              <div className="flex-1 space-y-2.5">
                {groundingSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: index === currentGroundingStep ? 1 : (index < currentGroundingStep ? 0.3 : 0.1),
                      scale: index === currentGroundingStep ? 1 : 0.98,
                    }}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all duration-500",
                      index === currentGroundingStep
                        ? "bg-primary/10 border-primary/30 shadow-md"
                        : "bg-white/5 border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                       <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", index === currentGroundingStep ? "bg-primary text-white" : "bg-white/10")}>
                          {5 - index}
                       </div>
                       <span className="text-sm font-medium">{step}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  className="flex-1 rounded-xl font-bold h-12"
                  onClick={() => setCurrentGroundingStep(0)}
                  disabled={currentGroundingStep === 0}
                >
                  Reset
                </Button>
                <Button
                  className="flex-1 rounded-xl font-bold h-12 bg-white/10 hover:bg-white/20"
                  onClick={() => setCurrentGroundingStep(prev => 
                    Math.min(prev + 1, groundingSteps.length)
                  )}
                  disabled={currentGroundingStep >= groundingSteps.length}
                  data-testid="button-next-grounding"
                >
                  {currentGroundingStep >= groundingSteps.length ? "Completed" : "Next Sense"}
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-4 py-8"
        >
          <div className="w-12 h-1 bg-white/10 mx-auto rounded-full" />
          <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-sm mx-auto italic">
            Lumi is an AI companion and cannot provide emergency services. 
            If you are in immediate danger, please use the links above or visit your nearest emergency facility.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
