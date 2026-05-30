import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, LogOut, FileText, History, BarChart3, Sparkles } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const { location } = useRouterState();

  const links = [
    { to: "/generator", label: "Generator", icon: FileText },
    { to: "/history", label: "History", icon: History },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
  ] as const;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-bold tracking-tight">Smart Complaint</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Generator</span>
          </div>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = location.pathname.startsWith(l.to);
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent-soft text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      {user && (
        <nav className="md:hidden flex items-center justify-around border-t border-border/60 px-2 py-1">
          {links.map((l) => {
            const active = location.pathname.startsWith(l.to);
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
