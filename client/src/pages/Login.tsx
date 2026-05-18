import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, LoadingSkeleton } from "@/components/animations/LoadingSpinner";
import { AppShell } from "@/components/layout/AppShell";
import { ParticleField } from "@/components/animations/ParticleField";
import { Sparkles, Sun, ArrowRight, AlertCircle, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DemoUserPreview {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  tagline: string;
  mood?: string | null;
  avatar?: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { loginAsGuest, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const { data: demoUsers, isLoading } = useQuery<DemoUserPreview[]>({
    queryKey: ["/api/auth/demo-users"],
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });

      if (!response.ok) {
        const message = (await response.text()) || "Unable to log in";
        throw new Error(message);
      }
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/onboarding");
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-20 px-6">
      {/* Immersive Background */}
      <div className="fixed inset-0 -z-30 pointer-events-none">
         <div className="absolute inset-0 bg-slate-950" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_70%)]" />
         <div className="absolute inset-0 bg-[radial_gradient(circle_at_0%_100%,rgba(236,72,153,0.1),transparent_50%)]" />
      </div>
      
      <ParticleField count={40} color="mixed" />
      
      <div className="max-w-6xl w-full mx-auto space-y-12">
        {loginMutation.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <Alert variant="destructive" className="glass-card border-rose-500/50 bg-rose-500/10 rounded-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-medium">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : "Failed to log in. Please try again."}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div
          className="text-center space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest"
          >
            <Sun className="w-3.5 h-3.5" />
            Enter Your Sanctuary
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl font-display font-bold tracking-tight text-balance"
          >
            Choose Your <span className="gradient-text">Reflection</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Select a demo persona to explore SoulSync with pre-loaded history, 
            or start fresh as a guest.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 px-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-bold shadow-xl"
              onClick={() => loginAsGuest()}
              data-testid="button-login-guest"
            >
              <UserCircle className="w-5 h-5 mr-3" />
              Continue as Guest
            </Button>
          </motion.div>
        </motion.div>

        {/* Persona Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 md:grid-cols-3"
        >
          {isLoading ? (
            [...Array(3)].map((_, i) => (
               <Card key={i} className="p-8 glass-card border-white/10 rounded-[2.5rem] space-y-6">
                  <div className="flex items-center gap-4">
                     <LoadingSkeleton className="w-16 h-16 rounded-full" />
                     <div className="space-y-2 flex-1">
                        <LoadingSkeleton className="h-4 w-1/2" />
                        <LoadingSkeleton className="h-3 w-3/4" />
                     </div>
                  </div>
                  <LoadingSkeleton className="h-12 w-full rounded-xl" />
               </Card>
            ))
          ) : (
            demoUsers?.map((user, index) => {
              const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
              return (
                <motion.div 
                  key={user.id} 
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Card className="p-8 h-full flex flex-col glass-card border-white/10 hover:border-primary/40 transition-all duration-500 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    {/* Background Visual Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="space-y-6 flex-1 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary via-violet-600 to-indigo-600 flex items-center justify-center text-2xl text-white font-display font-bold shadow-xl ring-2 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                          {fullName ? fullName.charAt(0) : "?"}
                        </div>
                        <div className="space-y-1">
                          <p className="font-display font-bold text-2xl group-hover:text-primary transition-colors">
                            {user.firstName || "Unnamed"}
                          </p>
                          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                            {user.email?.split('@')[0]}
                          </p>
                        </div>
                      </div>

                      <p className="text-muted-foreground leading-relaxed font-medium line-clamp-3">
                        "{user.tagline}"
                      </p>

                      {user.mood && (
                        <div className="flex flex-wrap gap-2">
                           <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-full">
                             <Sparkles className="w-3 h-3 mr-2" />
                             Base State: {user.mood}
                           </Badge>
                        </div>
                      )}
                    </div>

                    <Button
                      className="mt-10 w-full h-14 rounded-2xl font-bold bg-white/5 hover:bg-primary text-foreground hover:text-white border border-white/10 hover:border-primary transition-all duration-300 shadow-xl group/btn"
                      disabled={loginMutation.isPending}
                      onClick={() => loginMutation.mutate(user.id)}
                      data-testid={`button-login-${user.id}`}
                    >
                      {loginMutation.isPending ? (
                        <LoadingSpinner size="sm" variant="dots" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Enter Sanctuary
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* Decorative Footer Element */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}
