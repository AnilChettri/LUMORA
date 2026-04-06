import { LoadingSpinner } from "@/components/animations/LoadingSpinner";

// Loading fallback component for Suspense
export function PageLoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <LoadingSpinner size="lg" variant="neural" />
                <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}
