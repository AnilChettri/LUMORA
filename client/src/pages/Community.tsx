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
        title: "Post created!",
        description: "Your post has been shared with the community.",
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
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold mb-1">Community</h1>
            <p className="text-muted-foreground text-sm">
              Share, connect, and support each other
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-post">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create a Post</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePost)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="What's on your mind?"
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
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your thoughts..."
                            rows={5}
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
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-post-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createPostMutation.isPending}
                      data-testid="button-submit-post"
                    >
                      {createPostMutation.isPending ? (
                        <LoadingSpinner variant="dots" size="sm" />
                      ) : (
                        "Post"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-posts"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="shrink-0"
                  data-testid={`filter-category-${cat.id}`}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === "trending" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("trending")}
                data-testid="sort-trending"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Trending
              </Button>
              <Button
                variant={sortBy === "recent" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSortBy("recent")}
                data-testid="sort-recent"
              >
                <Clock className="w-4 h-4 mr-1" />
                Recent
              </Button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-3">
                    <LoadingSkeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <LoadingSkeleton className="h-4 w-1/4" />
                      <LoadingSkeleton className="h-5 w-3/4" />
                      <LoadingSkeleton className="h-16 w-full" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="h-full"
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
            <Card className="p-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to share something with the community!
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onUpvote }: { post: PostWithAuthor; onUpvote: () => void }) {
  const [isBlurred, setIsBlurred] = useState(post.isBlurred);

  const authorName = post.author
    ? `${post.author.firstName || ""} ${post.author.lastName || ""}`.trim() || "Anonymous"
    : "Anonymous";

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
        "p-4 hover-elevate transition-all h-full flex flex-col",
        isBlurred && "relative overflow-hidden"
      )}
      data-testid={`card-post-${post.id}`}
    >
      {/* Blur overlay for sensitive content */}
      {isBlurred && (
        <div className="absolute inset-0 backdrop-blur-lg bg-background/50 z-10 flex flex-col items-center justify-center p-4">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-sm text-center font-medium mb-3">
            This post may contain sensitive content
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsBlurred(false)}
            data-testid="button-reveal-post"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Anyway
          </Button>
        </div>
      )}

      {/* Author info */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author?.profileImageUrl || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{authorName}</span>
            <span className="text-xs text-muted-foreground">· {timeAgo}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="secondary" className={cn("text-xs", categoryInfo?.color)}>
              {categoryInfo?.label}
            </Badge>
            {post.moodTag && (
              <Badge variant="outline" className={cn("text-xs", moodColors[post.moodTag])}>
                {post.moodTag}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Post content */}
      <Link href={`/community/post/${post.id}`}>
        <h3 className="font-semibold mb-2 hover:text-primary cursor-pointer">
          {post.title}
        </h3>
      </Link>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-4 mt-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUpvote}
          className="gap-1 -ml-2"
          data-testid={`button-upvote-${post.id}`}
        >
          <Heart className="w-4 h-4" />
          <span>{post.upvotes || 0}</span>
        </Button>
        <Link href={`/community/post/${post.id}`}>
          <Button variant="ghost" size="sm" className="gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentCount || 0}</span>
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
