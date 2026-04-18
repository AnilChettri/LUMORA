import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { AppShell } from "@/components/layout/AppShell";
import { ParticleField } from "@/components/animations/ParticleField";
import { Sparkles, Sun, ArrowRight, AlertCircle } from "lucide-react";
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
      setLocation("/");
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });


  return (
    <AppShell showNav={false} showCrisisButton={false}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 -z-20" />
      
      {/* Animated gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -z-10"
        animate={{
          y: [0, 40, 0],
          x: [0, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl -z-10"
        animate={{
          y: [0, -40, 0],
          x: [0, -20, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      <ParticleField count={50} color="mixed" />
      
      <section className="relative z-10 px-6 pt-16 pb-20 md:pt-24">
        <div className="max-w-5xl mx-auto">
          {loginMutation.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {loginMutation.error instanceof Error
                    ? loginMutation.error.message
                    : "Failed to log in. Please try again."}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
          <motion.div
            className="text-center max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-rose-400/20 border border-white/20 text-sm text-amber-900/80 dark:text-amber-100/80 backdrop-blur"
            >
              <Sun className="w-4 h-4" />
              Step into your golden-hour space
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl md:text-5xl font-display font-bold tracking-tight text-balance"
            >
              Choose a Lumi companion to explore the experience
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg text-muted-foreground"
            >
              Sign in instantly with one of our demo personas. You can always switch later to see the journey from a different perspective.
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 grid gap-6 md:grid-cols-3"
          >
            {isLoading && (
              <motion.div variants={itemVariants} className="md:col-span-3 flex justify-center py-12">
                <LoadingSpinner size="lg" variant="neural" />
              </motion.div>
            )}

            {!isLoading && !demoUsers?.length && (
              <motion.div variants={itemVariants} className="md:col-span-3 py-12">
                <Card className="p-8 text-center border-dashed border-white/10 bg-white/5">
                  <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">We couldn't load the demo companions.</p>
                  <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/auth/demo-users"] })}>
                    Try Again
                  </Button>
                </Card>
              </motion.div>
            )}

            {!isLoading && demoUsers?.map((user) => {
              const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
              return (
                <motion.div key={user.id} variants={itemVariants}>
                  <Card className="p-6 h-full flex flex-col justify-between glass-card border-white/20 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center text-white font-semibold shadow-inner">
                          {fullName ? fullName.charAt(0) : "?"}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-lg text-foreground/90">
                            {fullName || "Unnamed"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {user.tagline}
                      </p>

                      {user.mood && (
                        <Badge variant="secondary" className="gap-1">
                          <Sparkles className="w-3 h-3" />
                          Current mood: {user.mood}
                        </Badge>
                      )}
                    </div>

                    <Button
                      className="mt-6 w-full gap-2"
                      size="lg"
                      disabled={loginMutation.isPending}
                      onClick={() => loginMutation.mutate(user.id)}
                      data-testid={`button-login-${user.id}`}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" variant="dots" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Enter as {user.firstName}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </AppShell>
  );
}
