import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
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
  ArrowRight,
  ChevronRight,
  Play,
  Star,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: Brain,
    title: "Mood Detection",
    description: "AI-powered emotional awareness with real-time mood analysis",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Mic,
    title: "Voice Companion",
    description: "Talk to Lumi anytime for empathetic, supportive conversations",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Music,
    title: "Calming Music",
    description: "Mood-based playlists and ambient sounds to help you relax",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Heart,
    title: "Guided Exercises",
    description: "Breathing, meditation, and grounding techniques",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Users,
    title: "Safe Community",
    description: "Connect with others in a supportive, moderated space",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: PenLine,
    title: "Journaling",
    description: "Express your thoughts and track your emotional journey",
    color: "from-indigo-500 to-blue-500",
  },
];

const steps = [
  {
    number: "01",
    title: "Check In",
    description: "Share how you're feeling with a quick mood check or talk to Lumi",
  },
  {
    number: "02",
    title: "Explore",
    description: "Discover personalized tools, exercises, and content tailored to you",
  },
  {
    number: "03",
    title: "Grow",
    description: "Track your progress, build healthy habits, and evolve emotionally",
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
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } 
  },
};

const floatAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const pulseGlow = {
  boxShadow: [
    "0 0 20px rgba(139, 92, 246, 0.3)",
    "0 0 40px rgba(139, 92, 246, 0.5)",
    "0 0 20px rgba(139, 92, 246, 0.3)",
  ],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

function AnimatedBackground() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  
  return (
    <div className="fixed inset-0 -z-30 pointer-events-none overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-slate-950"
        style={{ y: y1 }}
      />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(139,92,246,0.2),transparent_50%)]"
        style={{ y: y2 }}
      />
      <motion.div 
        className="absolute inset-0 bg-[radial_gradient(circle_at_100%_100%,rgba(236,72,153,0.15),transparent_50%)]"
        style={{ y: useTransform(scrollY, [0, 1000], [0, 100]) }}
      />
      <motion.div 
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

function FloatingParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute w-2 h-2 bg-white/20 rounded-full"
      initial={{ opacity: 0, y: 100 }}
      animate={{ 
        opacity: [0, 1, 0],
        y: [100, -100],
        x: [0, Math.random() * 50 - 25],
      }}
      transition={{ 
        duration: 8, 
        repeat: Infinity, 
        delay,
        ease: "linear",
      }}
    />
  );
}

function MorphingBlob() {
  return (
    <motion.div
      className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl"
      style={{
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.6))",
      }}
      animate={{
        borderRadius: ["60% 40% 30% 70%", "30% 60% 70% 40%", "60% 40% 30% 70%"],
        scale: [1, 1.1, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function HeroVisual() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)] border border-white/10 relative group">
          <motion.img
            src="/Fundo de ioga de meditação _ imagem Premium gerada com IA.jpg"
            alt="Sanctuary"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          
          <motion.div
            className="absolute bottom-10 left-10 right-10 p-6 glass-card border-white/20 rounded-[2.5rem] shadow-2xl"
            animate={floatAnimation}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Heart className="w-6 h-6 text-primary fill-current" />
              </motion.div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">Session Pulse</p>
                <p className="text-xl font-display font-bold">Resonant & Calm</p>
              </div>
              <motion.div 
                className="ml-auto flex gap-1 items-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {[1,2,3,4].map((i) => (
                  <motion.div
                    key={i}
                    className={cn("w-1 bg-primary/40 rounded-full", i === 2 && "bg-primary")}
                    animate={{ 
                      height: [16, i === 2 ? 32 : 24, 16],
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                    style={{ height: i === 2 ? 32 : i === 3 ? 24 : 16 }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0], index: number }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
      <Card className="p-8 glass-card border-white/10 hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 rounded-[2.5rem] group h-full flex flex-col space-y-5 relative overflow-hidden">
        <motion.div 
          className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500", feature.color)}
        />
        
        <motion.div 
          className={cn(
            "w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden",
            "group-hover:scale-110 transition-transform duration-500"
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500", feature.color)} />
          <div className="relative z-10">
            <feature.icon className="w-8 h-8 text-primary" />
          </div>
        </motion.div>
        
        <div className="space-y-3 relative z-10">
          <motion.h3 
            className="text-2xl font-display font-bold"
            whileHover={{ color: "hsl(var(--primary))" }}
          >
            {feature.title}
          </motion.h3>
          <p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
        </div>
        
        <motion.div 
          className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ x: -10 }}
          whileHover={{ x: 0 }}
        >
          <span className="text-sm font-bold">Learn more</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </motion.div>
      </Card>
    </motion.div>
  );
}

function StepCard({ step, index }: { step: typeof steps[0], index: number }) {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.6 }}
    >
      <motion.div 
        className="absolute -left-4 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {step.number}
      </motion.div>
      <div className="pl-16">
        <h3 className="text-2xl font-display font-bold mb-2">{step.title}</h3>
        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const { loginAsGuest } = useAuth();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const headerY = useTransform(scrollY, [0, 100], [0, -20]);
  
  const stats = [
    { label: "Active Users", value: "50K+" },
    { label: "Sessions Completed", value: "1M+" },
    { label: "Mood Improvements", value: "87%" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <AnimatedBackground />
      
      {[...Array(5)].map((_, i) => (
        <FloatingParticle key={i} delay={i * 1.5} />
      ))}

      <motion.header 
        className="fixed top-6 left-0 right-0 z-50 px-6"
        style={{ y: headerY, opacity: headerOpacity }}
      >
        <motion.div 
          className="max-w-6xl mx-auto flex items-center justify-between p-2 pl-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-xl ring-2 ring-primary/20">
              <img src="/Quantum Shift.jpg" alt="Lumi" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">SoulSync</span>
          </motion.div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ThemeToggle />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-[1.25rem] px-8 font-bold h-12 shadow-lg shadow-primary/20">
                <Link href="/login">Log in</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.header>

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
              whileHover={{ scale: 1.05 }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </motion.span>
              Mental Health Reinvented
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-6xl md:text-7xl xl:text-8xl font-display font-bold leading-[1.1] tracking-tight"
            >
              Find Your <br />
              <motion.span 
                className="gradient-text"
                initial={{ backgroundPosition: "0% 50%" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Inner Balance
              </motion.span>
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
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="h-16 px-10 rounded-[1.5rem] bg-primary text-white font-bold text-lg shadow-2xl shadow-primary/30 group"
                  asChild
                >
                  <Link href="/login" className="flex items-center gap-3">
                    Start Your Journey
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-16 px-10 rounded-[1.5rem] border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-bold text-lg"
                  onClick={() => loginAsGuest()}
                >
                  Try as Guest
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="pt-8 flex flex-wrap justify-center lg:justify-start gap-8"
            >
              {[
                { icon: Shield, label: "End-to-End Private" },
                { icon: Zap, label: "Real-time AI Empathy" },
                { icon: Target, label: "Goal Oriented" },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="flex items-center gap-3 cursor-pointer"
                  whileHover={{ scale: 1.05, x: 5 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 hover:border-primary/30 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <HeroVisual />
        </div>
      </section>

      <motion.section 
        className="py-10 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="flex flex-wrap justify-center gap-12 md:gap-20"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                variants={itemVariants}
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className="text-4xl md:text-5xl font-display font-bold gradient-text"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 + 0.5 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto space-y-20">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 relative overflow-hidden">
        <MorphingBlob />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            className="text-center space-y-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
              How It <span className="gradient-text">Works</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <StepCard key={step.number} step={step} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
          >
            <Card className="p-16 text-center super-glass border-primary/20 rounded-[4rem] shadow-3xl relative overflow-hidden">
              <motion.div 
                className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              <div className="relative z-10 space-y-10">
                <motion.div 
                  className="w-24 h-24 mx-auto rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner cursor-pointer"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                   <LumiCharacter size="lg" mood="calm" />
                </motion.div>

                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
                    Your Peace is <span className="text-primary">Waiting.</span>
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                    Join the community of seekers finding balance every day with SoulSync.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg" 
                      className="h-16 px-12 rounded-2xl bg-primary text-white font-bold text-lg shadow-2xl shadow-primary/30"
                      asChild
                    >
                      <Link href="/login">Initialize Journey</Link>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="h-16 px-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-bold text-lg"
                    >
                      View Experience
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <motion.footer 
        className="py-20 px-6 border-t border-white/5"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
               <div className="w-10 h-10 rounded-full overflow-hidden shadow-xl ring-2 ring-primary/20">
                  <img src="/Quantum Shift.jpg" alt="Lumi" className="w-full h-full object-cover" />
               </div>
               <span className="font-display font-bold text-xl tracking-tight">SoulSync</span>
            </motion.div>
            <p className="text-muted-foreground leading-relaxed font-medium">Elevating human consciousness through empathetic technology.</p>
          </motion.div>

          {[
             { title: "Platform", links: ["Features", "Neuroscience", "Security"] },
             { title: "Sanctuary", links: ["Community", "Resources", "Crisis Support"] },
             { title: "Legal", links: ["Privacy Policy", "Terms of Use", "Compliance"] }
          ].map((col, colIndex) => (
             <motion.div 
               key={col.title} 
               className="space-y-6"
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: colIndex * 0.1 }}
             >
                 <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">{col.title}</h4>
                 <ul className="space-y-4">
                    {col.links.map((link, linkIndex) => (
                       <motion.li 
                         key={link}
                         whileHover={{ x: 5 }}
                       >
                         <a href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">{link}</a>
                       </motion.li>
                    ))}
                 </ul>
              </motion.div>
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
           <p>&copy; 2025 SoulSync. Neural Design Enabled.</p>
           <motion.p 
             className="flex items-center gap-2"
             whileHover={{ scale: 1.05 }}
           >
             Made with 
             <motion.span
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ duration: 1.5, repeat: Infinity }}
             >
               💜
             </motion.span>
             for a better world
           </motion.p>
        </div>
      </motion.footer>
    </div>
  );
}