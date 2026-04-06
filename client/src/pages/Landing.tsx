import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Lightbulb
} from "lucide-react";
import { Link } from "wouter";

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

const benefits = [
  {
    icon: Zap,
    title: "Instant Relief",
    stat: "92%",
    statLabel: "Feel calmer after use",
  },
  {
    icon: Target,
    title: "Personalized",
    stat: "24/7",
    statLabel: "Available anytime",
  },
  {
    icon: Lightbulb,
    title: "Evidence-Based",
    stat: "150K+",
    statLabel: "Happy users",
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-slate-900/20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 border-b border-purple-500/20 bg-gradient-to-b from-purple-950/40 to-transparent backdrop-blur-sm">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-11 h-11 rounded-full overflow-hidden shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/20 hover:ring-purple-400/40 transition-all">
            <img 
              src="/Quantum Shift.jpg" 
              alt="Lumi" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-100 via-violet-100 to-fuchsia-100 bg-clip-text text-transparent">Lumi</span>
        </motion.div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-6 font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/30 active:scale-95" data-testid="button-login">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section - Minimal and Clean */}
      <section className="relative z-10 px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto flex items-stretch gap-8 lg:gap-12">
          {/* Left: Text Content */}
          <motion.div
            className="flex flex-col items-center text-center lg:items-start lg:text-left flex-1 min-w-0 justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 mb-6 px-3 py-2 rounded-full border border-purple-400/30 bg-purple-950/40"
            >
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-sm text-purple-200">Your mental health companion</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance leading-tight drop-shadow-lg"
            >
              <span className="bg-gradient-to-r from-purple-100 via-violet-100 to-fuchsia-100 bg-clip-text text-transparent">
                Transform Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
                Mental Wellbeing
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-purple-100/75 max-w-xl mb-10 leading-relaxed font-light"
            >
              Meet Lumi, your empathetic AI companion. Get instant support with 
              <span className="text-purple-200 font-medium"> mood detection, guided exercises, and a supportive community</span> 
              — available 24/7.
            </motion.p>

            {/* CTA Buttons - Simple */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10"
            >
              <Button 
                size="lg" 
                className="text-lg px-8 py-7 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all active:scale-95 font-semibold"
                asChild
                data-testid="button-get-started"
              >
                <Link href="/login" className="flex items-center gap-2">
                  Get Started Free
                </Link>
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-7 rounded-lg border-2 border-purple-400/50 text-purple-100 hover:border-purple-400/80 hover:bg-purple-500/15 transition-all font-semibold"
                asChild
                data-testid="button-learn-more"
              >
                <a href="#features" className="flex items-center gap-2">
                  Learn More
                </a>
              </Button>
            </motion.div>

            {/* Trust Indicators - Static */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6"
            >
              {[
                { icon: Shield, label: "Private & Secure" },
                { icon: Heart, label: "Clinically Informed" },
                { icon: Users, label: "Community Driven" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <item.icon className="w-4 h-4 text-purple-300" />
                  </div>
                  <span className="text-sm text-purple-200 font-medium">{item.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Meditation Background Image */}
          <motion.div
            className="relative flex items-center justify-center flex-1 shrink-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Meditation/Yoga background image with overlay */}
            <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/Fundo de ioga de meditação _ imagem Premium gerada com IA.jpg"
                alt="Meditation and wellness"
                className="w-full h-full object-cover"
              />
              
              {/* Gradient overlay for visual hierarchy */}
              <div className="absolute inset-0 bg-gradient-to-l from-purple-900/70 via-purple-900/50 to-transparent" />
              
              {/* Decorative circles */}
              <div className="absolute top-8 right-8 w-24 h-24 rounded-full border-2 border-purple-400/40 animate-pulse" />
              <div className="absolute bottom-16 left-8 w-20 h-20 rounded-full border border-violet-400/40" />
              
              {/* Floating stat card */}
              <motion.div
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-purple-950/95 px-5 py-3 shadow-lg border border-purple-500/40 backdrop-blur-md"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section - Simple Grid */}
      <section className="relative z-10 px-6 py-14 border-t border-purple-500/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="p-8 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 via-violet-900/20 to-purple-900/30 hover:border-purple-500/40 hover:bg-purple-900/40 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/40 to-violet-500/40 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-purple-100 mb-2">{benefit.stat}</h3>
                <p className="text-purple-200/60 text-sm mb-3">{benefit.statLabel}</p>
                <p className="text-purple-100 font-semibold">{benefit.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Clean Cards */}
      <section id="features" className="relative z-10 px-6 py-20 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              Powerful Features for Your Wellness
            </h2>
            <p className="text-lg text-purple-100/70 max-w-2xl mx-auto leading-relaxed">
              Everything you need to understand, manage, and improve your mental health with personalized AI support
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="p-8 border-purple-500/20 bg-gradient-to-br from-purple-900/40 via-violet-900/20 to-purple-900/30 hover:border-purple-500/60 hover:bg-purple-900/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 h-full group cursor-pointer">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500/40 to-violet-500/40 flex items-center justify-center mb-6 group-hover:from-purple-500/50 group-hover:to-violet-500/50 transition-all">
                    <feature.icon className="w-7 h-7 text-purple-200 group-hover:text-purple-100 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-100 mb-3">{feature.title}</h3>
                  <p className="text-purple-200/70 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Simple and Focused */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-14 text-center bg-gradient-to-br from-purple-900/40 via-violet-900/30 to-fuchsia-900/40 border-purple-400/40 shadow-xl">
              <motion.div className="mb-6">
                <LumiCharacter size="md" mood="calm" className="mx-auto" />
              </motion.div>

              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-100 via-violet-100 to-fuchsia-100 bg-clip-text text-transparent">
                Start Your Journey Today
              </h2>

              <p className="text-lg text-purple-100/80 mb-8 max-w-2xl mx-auto">
                Join thousands of users experiencing real transformation with Lumi's 
                AI-powered mental health support. Your wellness journey starts here.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-6 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white border-0 shadow-lg"
                  asChild
                >
                  <Link href="/login">Start Free Trial</Link>
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-6 rounded-lg border-purple-400/40 text-purple-100 hover:border-purple-400/80 hover:bg-purple-500/10"
                >
                  View Pricing
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="relative z-20 px-6 py-14 border-t border-purple-500/20 bg-gradient-to-b from-transparent via-purple-950/30 to-purple-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-purple-400/30">
                  <img src="/Quantum Shift.jpg" alt="Lumi" className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-lg text-purple-100">Lumi</span>
              </div>
              <p className="text-purple-200/60 text-sm leading-relaxed">Your AI mental health companion, available 24/7</p>
            </div>

            <div>
              <h4 className="font-semibold text-purple-100 mb-4 text-sm uppercase tracking-wide">Product</h4>
              <ul className="space-y-3 text-purple-200/60 text-sm">
                <li><a href="#features" className="hover:text-purple-200 transition duration-200">Features</a></li>
                <li><a href="#" className="hover:text-purple-200 transition duration-200">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-200 transition duration-200">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-purple-100 mb-4 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-3 text-purple-200/60 text-sm">
                <li><a href="#" className="hover:text-purple-200 transition duration-200">About</a></li>
                <li><a href="#" className="hover:text-purple-200 transition duration-200">Blog</a></li>
                <li><a href="#" className="hover:text-purple-200 transition duration-200">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-purple-100 mb-4 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-3 text-purple-200/60 text-sm">
                <li><a href="#" className="hover:text-purple-200 transition duration-200">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-200 transition duration-200">Terms</a></li>
                <li><a href="#" className="hover:text-purple-200 transition duration-200">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-purple-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-purple-200/60">
            <p>&copy; 2025 Lumi. All rights reserved.</p>
            <p>Made with care for your wellbeing 💜</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

