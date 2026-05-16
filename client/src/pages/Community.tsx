import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { LoadingSpinner, LoadingSkeleton } from "@/components/animations/LoadingSpinner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post, CategoryType, MoodType } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Heart,
  Plus,
  TrendingUp,
  Clock,
  Filter,
  Search,
  AlertTriangle,
  Flag,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

const categories: { id: CategoryType | "all"; label: string; color: string }[] = [
  { id: "all", label: "All", color: "bg-muted" },
  { id: "anxiety", label: "Anxiety", color: "bg-orange-100 dark:bg-orange-900/30" },
  { id: "motivation", label: "Motivation", color: "bg-green-100 dark:bg-green-900/30" },
  { id: "wellness", label: "Wellness", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "creativity", label: "Creativity", color: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "challenges", label: "Challenges", color: "bg-red-100 dark:bg-red-900/30" },
];

const moodColors: Record<string, string> = {
  happy: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  sad: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  anxious: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200",
  tired: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
  stressed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
};

const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().min(10, "Content must be at least 10 characters").max(5000),
  category: z.enum(["anxiety", "motivation", "wellness", "creativity", "challenges"]),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostWithAuthor extends Post {
  author?: {
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
  };
  commentCount?: number;
}

export default function Community() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<CategoryType | "all">("all");
  const [sortBy, setSortBy] = useState<"trending" | "recent">("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "wellness",
    },
  });

  const { data: posts, isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts", activeCategory, sortBy],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      return apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Post shared with the world!",
        description: "Your voice matters, and the community is listening.",
      });
    },
    onError: () => {
      toast({
        title: "Couldn't create post",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const upvoteMutation = useMutation({
    mutationFn: async (postId: number) => {
      return apiRequest("POST", `/api/posts/${postId}/upvote`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const handleCreatePost = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  const filteredPosts = posts?.filter((post) => {
    if (activeCategory !== "all" && post.category !== activeCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Header />

      <div className="container px-4 py-12 max-w-7xl mx-auto space-y-12">
        {/* Community Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                <Heart className="w-4 h-4 fill-current" />
                SoulSync Hub
             </div>
             <h1 className="text-5xl font-display font-bold tracking-tight">
                Our <span className="gradient-text">Community</span>
             </h1>
             <p className="text-muted-foreground text-lg max-w-xl">
                A safe, anonymous space to share your journey, offer support, and grow together in empathy.
             </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-14 px-8 rounded-2xl font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform" data-testid="button-create-post">
                <Plus className="w-5 h-5 mr-2" />
                Share Your Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl glass-card border-white/20 p-8 rounded-[2.5rem]">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-display font-bold">New Community Post</DialogTitle>
                <p className="text-sm text-muted-foreground">Your post will be shared anonymously within the community.</p>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePost)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Give your thoughts a name..."
                            className="h-12 rounded-xl bg-primary/5 border-primary/10 focus-visible:ring-primary"
                            {...field}
                            data-testid="input-post-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What's truly on your mind today?"
                            rows={6}
                            className="rounded-2xl bg-primary/5 border-primary/10 focus-visible:ring-primary resize-none"
                            {...field}
                            data-testid="input-post-content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Topic Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl bg-primary/5 border-primary/10">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-white/20 bg-background/95 backdrop-blur-xl">
                            <SelectItem value="anxiety">Anxiety</SelectItem>
                            <SelectItem value="motivation">Motivation</SelectItem>
                            <SelectItem value="wellness">Wellness</SelectItem>
                            <SelectItem value="creativity">Creativity</SelectItem>
                            <SelectItem value="challenges">Challenges</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-xl font-bold"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Discard
                    </Button>
                    <Button
                      type="submit"
                      className="h-12 px-8 rounded-xl font-bold bg-primary"
                      disabled={createPostMutation.isPending}
                      data-testid="button-submit-post"
                    >
                      {createPostMutation.isPending ? (
                        <LoadingSpinner variant="dots" size="sm" />
                      ) : (
                        "Post to Feed"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search & Navigation Bar */}
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between p-2 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto p-2 no-scrollbar">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "rounded-xl px-6 font-bold h-12 transition-all",
                  activeCategory === cat.id ? "bg-primary shadow-lg shadow-primary/20" : "hover:bg-primary/10"
                )}
                data-testid={`filter-category-${cat.id}`}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto px-4 lg:px-0">
             <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-12 rounded-xl bg-white/5 border-white/10 focus-visible:ring-primary w-full"
                />
             </div>
             <div className="w-px h-10 bg-white/10 hidden lg:block" />
             <div className="flex items-center gap-2">
                <Button
                  variant={sortBy === "trending" ? "secondary" : "ghost"}
                  size="icon"
                  className={cn("h-12 w-12 rounded-xl transition-all", sortBy === "trending" && "bg-primary/10 text-primary")}
                  onClick={() => setSortBy("trending")}
                >
                  <TrendingUp className="w-5 h-5" />
                </Button>
                <Button
                  variant={sortBy === "recent" ? "secondary" : "ghost"}
                  size="icon"
                  className={cn("h-12 w-12 rounded-xl transition-all", sortBy === "recent" && "bg-primary/10 text-primary")}
                  onClick={() => setSortBy("recent")}
                >
                  <Clock className="w-5 h-5" />
                </Button>
             </div>
          </div>
        </div>

        {/* Feed Grid */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-8 glass-card border-white/20 rounded-[2.5rem] space-y-4">
                  <div className="flex gap-4">
                    <LoadingSkeleton className="w-12 h-12 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                      <LoadingSkeleton className="h-4 w-1/3" />
                      <LoadingSkeleton className="h-6 w-full" />
                      <LoadingSkeleton className="h-24 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <PostCard
                      post={post}
                      onUpvote={() => upvoteMutation.mutate(post.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="py-20 text-center space-y-6 max-w-md mx-auto"
            >
              <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                 <MessageCircle className="w-12 h-12 text-primary/40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-bold">Silenced Echoes</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The silence is profound, but it's an opportunity for your voice to lead the way. Share first.
                </p>
              </div>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="h-12 px-8 rounded-xl font-bold bg-primary shadow-xl shadow-primary/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start the Conversation
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onUpvote }: { post: PostWithAuthor; onUpvote: () => void }) {
  const [isBlurred, setIsBlurred] = useState(post.isBlurred);

  const authorName = post.author
    ? `${post.author.firstName || ""} ${post.author.lastName || ""}`.trim() || "SoulSync Member"
    : "Anonymous Soul";

  const initials = authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const categoryInfo = categories.find((c) => c.id === post.category);
  const timeAgo = getTimeAgo(new Date(post.createdAt!));

  return (
    <Card
      className={cn(
        "p-8 glass-card border-white/20 hover:border-primary/40 transition-all duration-500 rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col group h-full",
        isBlurred && "relative overflow-hidden"
      )}
      data-testid={`card-post-${post.id}`}
    >
      {/* Sensitive Content Mask */}
      {isBlurred && (
        <div className="absolute inset-0 backdrop-blur-[40px] bg-background/60 z-20 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
             <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold font-display">Tread Carefully</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This message has been flagged for potentially sensitive themes. Your wellbeing is priority.
            </p>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="rounded-xl font-bold h-12 px-8 border-white/10 hover:bg-white/10"
            onClick={() => setIsBlurred(false)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Unveil Wisdom
          </Button>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="relative">
          <Avatar className="w-14 h-14 rounded-2xl border-2 border-primary/20 shadow-lg">
            <AvatarImage src={post.author?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center overflow-hidden">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
             <span className="font-display font-bold text-lg group-hover:text-primary transition-colors">{authorName}</span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-[10px] font-bold uppercase tracking-widest border-none px-2 py-0.5", categoryInfo?.color)}>
              {categoryInfo?.label}
            </Badge>
            {post.moodTag && (
              <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full", moodColors[post.moodTag])}>
                {post.moodTag}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Text Content */}
      <div className="flex-1 space-y-4 mb-8">
        <Link href={`/community/post/${post.id}`}>
          <h3 className="text-2xl font-display font-bold leading-tight hover:text-primary transition-colors cursor-pointer">
            {post.title}
          </h3>
        </Link>
        <p className="text-muted-foreground leading-relaxed line-clamp-4">
          {post.content}
        </p>
      </div>

      {/* Engagement Footer */}
      <div className="pt-6 border-t border-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onUpvote}
            className="flex items-center gap-2.5 text-muted-foreground hover:text-rose-500 transition-all group/btn"
            data-testid={`button-upvote-${post.id}`}
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/btn:bg-rose-500/10 transition-colors">
               <Heart className={cn("w-5 h-5 transition-all", post.upvotes ? "fill-rose-500 text-rose-500" : "group-hover/btn:scale-110")} />
            </div>
            <span className="text-sm font-bold">{post.upvotes || 0}</span>
          </button>
          
          <Link href={`/community/post/${post.id}`} className="flex items-center gap-2.5 text-muted-foreground hover:text-primary transition-all group/btn">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover/btn:bg-primary/10 transition-colors">
               <MessageCircle className="w-5 h-5 group-hover/btn:scale-110" />
            </div>
            <span className="text-sm font-bold">{post.commentCount || 0}</span>
          </Link>
        </div>

        <Link href={`/community/post/${post.id}`}>
           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all">
              <ChevronRight className="w-5 h-5" />
           </Button>
        </Link>
      </div>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
