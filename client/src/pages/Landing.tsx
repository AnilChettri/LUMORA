import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LumiCharacter } from "@/components/animations/LumiCharacter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Brain, 
  Music, 
  Heart, 
  Users, 
  Mic, 
  PenLine,
  Shield,
  Sparkles,
  Zap,
  Target,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: Brain,
    title: "Mood Detection",
    description: "AI-powered emotional awareness with camera-based mood analysis",
  },
  {
    icon: Mic,
    title: "Voice Companion",
    description: "Talk to Lumi anytime for empathetic, supportive conversations",
  },
  {
    icon: Music,
    title: "Calming Music",
    description: "Mood-based playlists and sounds to help you relax",
  },
  {
    icon: Heart,
    title: "Guided Exercises",
    description: "Breathing, meditation, and grounding techniques",
  },
  {
    icon: Users,
    title: "Safe Community",
    description: "Connect with others in a supportive, moderated space",
  },
  {
    icon: PenLine,
    title: "Journaling",
    description: "Express your thoughts and track your emotional journey",
  },
];


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Landing() {
  const { loginAsGuest } = useAuth();
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Global Background Elements */}
      <div className="fixed inset-0 -z-30 pointer-events-none">
         <div className="absolute inset-0 bg-slate-950" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(139,92,246,0.15),transparent_50%)]" />
         <div className="absolute inset-0 bg-[radial_gradient(circle_at_100%_100%,rgba(236,72,153,0.1),transparent_50%)]" />
      </div>

      {/* Header - Floating Island Style */}
      <header className="fixed top-6 left-0 right-0 z-50 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-2 pl-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-xl ring-2 ring-primary/20">
              <img src="/Quantum Shift.jpg" alt="Lumi" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">SoulSync</span>
          </motion.div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-[1.25rem] px-8 font-bold h-12 shadow-lg shadow-primary/20">
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Immersive Layout */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mental Health Reinvented
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-7xl xl:text-8xl font-display font-bold leading-[1.1] tracking-tight"
            >
              Find Your <br />
              <span className="gradient-text">Inner Balance</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground max-w-xl leading-relaxed font-medium"
            >
              Experience the future of wellbeing with Lumi, your AI sanctuary. 
              Real-time empathy, scientific grounding, and a community that cares.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Button 
                size="lg" 
                className="h-16 px-10 rounded-[1.5rem] bg-primary text-white font-bold text-lg shadow-2xl shadow-primary/30 group"
                asChild
              >
                <Link href="/login" className="flex items-center gap-3">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 px-10 rounded-[1.5rem] border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-bold text-lg"
                onClick={() => loginAsGuest()}
              >
                Try as Guest
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              variants={itemVariants}
              className="pt-8 flex flex-wrap justify-center lg:justify-start gap-8"
            >
              {[
                { icon: Shield, label: "End-to-End Private" },
                { icon: Zap, label: "Real-time AI Empathy" },
                { icon: Target, label: "Goal Oriented" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-white/10 relative group">
               <img
                 src="/Fundo de ioga de meditação _ imagem Premium gerada com IA.jpg"
                 alt="Sanctuary"
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
               
               {/* Floating Glass Widget */}
               <motion.div
                 className="absolute bottom-10 left-10 right-10 p-6 glass-card border-white/20 rounded-[2.5rem] shadow-2xl"
                 animate={{ y: [0, -10, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                        <Heart className="w-6 h-6 text-primary fill-current" />
                     </div>
                     <div>
                        <p className="text-sm font-bold uppercase tracking-widest opacity-60">Session Pulse</p>
                        <p className="text-xl font-display font-bold">Resonant & Calm</p>
                     </div>
                     <div className="ml-auto flex gap-1">
                        {[1,2,3,4].map(i => <div key={i} className={cn("w-1 h-4 bg-primary/40 rounded-full", i===2 && "h-8 bg-primary", i===3 && "h-6")} />)}
                     </div>
                  </div>
               </motion.div>
            </div>
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] -z-10 animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Features - Grid Refinement */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto space-y-20">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
               Built for Your <span className="gradient-text">Emotional Evolution</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
               A comprehensive suite of tools designed to meet you exactly where you are.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="p-10 glass-card border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 rounded-[2.5rem] group h-full flex flex-col space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500">
                    <feature.icon className="w-8 h-8 text-primary group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-2xl font-display font-bold">{feature.title}</h3>
                     <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Final Conversion */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-16 text-center super-glass border-primary/20 rounded-[4rem] shadow-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
              
              <div className="relative z-10 space-y-10">
                <div className="w-24 h-24 mx-auto rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                   <LumiCharacter size="lg" mood="calm" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
                    Your Peace is <span className="text-primary">Waiting.</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    Join the community of seekers finding balance every day with SoulSync.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="h-16 px-12 rounded-2xl bg-primary text-white font-bold text-lg shadow-2xl shadow-primary/30"
                    asChild
                  >
                    <Link href="/login">Initialize Journey</Link>
                  </Button>

                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-16 px-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-bold text-lg"
                  >
                    View Experience
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer - Elegant & Minimal */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full overflow-hidden shadow-xl ring-2 ring-primary/20">
                  <img src="/Quantum Shift.jpg" alt="Lumi" className="w-full h-full object-cover" />
               </div>
               <span className="font-display font-bold text-xl tracking-tight">SoulSync</span>
            </div>
            <p className="text-muted-foreground leading-relaxed font-medium">Elevating human consciousness through empathetic technology.</p>
          </div>

          {[
             { title: "Platform", links: ["Features", "Neuroscience", "Security"] },
             { title: "Sanctuary", links: ["Community", "Resources", "Crisis Support"] },
             { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Compliance"] }
          ].map((col) => (
             <div key={col.title} className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">{col.title}</h4>
                <ul className="space-y-4">
                   {col.links.map(link => (
                      <li key={link}><a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">{link}</a></li>
                   ))}
                </ul>
             </div>
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
           <p>&copy; 2025 SoulSync. Neural Design Enabled.</p>
           <p>Made with 💜 for a better world</p>
        </div>
      </footer>
    </div>
  );
}

