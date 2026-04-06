import { motion } from "framer-motion";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative">
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/3 w-80 h-80 bg-red-500/15 rounded-full blur-3xl -z-10"
        animate={{
          y: [0, 40, 0],
          x: [0, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10"
        animate={{
          y: [0, -40, 0],
          x: [0, -20, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      <ParticleField count={40} color="mixed" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-red-600/80 backdrop-blur-sm text-white">
        <div className="container px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Crisis Support</span>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6 max-w-2xl mx-auto">
        {/* Lumi Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-indigo-500/10 border-purple-200/30 dark:border-purple-800/30">
            <div className="flex items-start gap-4">
              <LumiCharacter size="md" mood="calm" />
              <div>
                <h1 className="text-xl font-bold mb-2">You're Not Alone</h1>
                <p className="text-muted-foreground">
                  I'm here with you. Whatever you're going through right now, 
                  there are people who want to help. Please reach out to one of 
                  these resources - they're available 24/7 and want to support you.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Crisis Hotlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-destructive" />
            Crisis Resources
          </h2>
          <div className="space-y-3">
            {crisisResources.map((resource, index) => (
              <Card
                key={index}
                className={cn(
                  "p-4 transition-all",
                  resource.primary && "border-destructive bg-destructive/5"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">{resource.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {resource.description}
                    </p>
                    {resource.country && (
                      <span className="text-xs text-muted-foreground">
                        {resource.country}
                      </span>
                    )}
                  </div>
                  
                  {resource.international ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={resource.number} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Find Help
                      </a>
                    </Button>
                  ) : resource.textBased ? (
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Text
                    </Button>
                  ) : (
                    <Button 
                      variant={resource.primary ? "destructive" : "outline"} 
                      size="sm"
                      asChild
                    >
                      <a href={`tel:${resource.number.replace(/[^0-9]/g, '')}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call {resource.number}
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Quick Calming Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Calming Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breathing Exercise */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Breathing Exercise</h3>
              </div>
              
              {showBreathing ? (
                <div className="flex flex-col items-center">
                  <BreathingCircle 
                    pattern="relaxing" 
                    isActive={showBreathing} 
                    size="md"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowBreathing(false)}
                    className="mt-4"
                  >
                    Stop
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowBreathing(true)}
                  data-testid="button-start-breathing"
                >
                  Start Breathing Exercise
                </Button>
              )}
            </Card>

            {/* Grounding Exercise */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">5-4-3-2-1 Grounding</h3>
              </div>
              
              <div className="space-y-2">
                {groundingSteps.map((step, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-2 rounded-lg text-sm transition-all",
                      index === currentGroundingStep
                        ? "bg-primary/10 border border-primary/30 font-medium"
                        : index < currentGroundingStep
                        ? "bg-green-50 dark:bg-green-900/20 text-muted-foreground line-through"
                        : "text-muted-foreground"
                    )}
                  >
                    {step}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setCurrentGroundingStep(0)}
                  disabled={currentGroundingStep === 0}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => setCurrentGroundingStep(prev => 
                    Math.min(prev + 1, groundingSteps.length)
                  )}
                  disabled={currentGroundingStep >= groundingSteps.length}
                  data-testid="button-next-grounding"
                >
                  Next
                </Button>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Important Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-muted/50 border-muted">
            <p className="text-sm text-muted-foreground text-center">
              Lumi is an AI companion and cannot provide emergency services. 
              If you are in immediate danger, please call your local emergency number 
              or go to the nearest emergency room.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
