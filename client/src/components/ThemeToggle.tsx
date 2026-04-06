import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      data-testid="button-theme-toggle"
      className="relative overflow-hidden"
    >
      <span
        aria-hidden
        className="block h-full w-full rounded-md bg-gradient-to-br from-muted/60 to-muted/40 transition-colors dark:from-muted/30 dark:to-muted/10"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
