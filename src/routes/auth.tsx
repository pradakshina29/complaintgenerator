import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Authentication failed";
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "Invalid email or password.";
  if (normalized.includes("email not confirmed")) return "Please verify your email before signing in.";
  if (normalized.includes("user already registered")) return "This email is already registered. Please sign in instead.";
  if (normalized.includes("password should be at least")) return "Password must be at least 6 characters.";

  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/generator" });
    }
  }, [authLoading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-subtle)" }} />
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-academic)" }} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-serif text-3xl font-bold">Welcome</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to start drafting smart complaints</p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <AuthForm
                mode="signin"
                loading={loading}
                setLoading={setLoading}
                setActiveTab={setActiveTab}
                onSuccess={() => navigate({ to: "/generator" })}
              />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <AuthForm
                mode="signup"
                loading={loading}
                setLoading={setLoading}
                setActiveTab={setActiveTab}
                onSuccess={() => navigate({ to: "/generator" })}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  loading,
  setLoading,
  setActiveTab,
  onSuccess,
}: {
  mode: "signin" | "signup";
  loading: boolean;
  setLoading: (b: boolean) => void;
  setActiveTab: (tab: "signin" | "signup") => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resending, setResending] = useState(false);

  async function handleResendVerification() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Enter your email first.");
      return;
    }

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
      toast.success("Verification email sent. Check your inbox.");
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: trimmedName || normalizedEmail.split("@")[0] },
          },
        });
        if (error) throw error;

        if (!data.session) {
          const noIdentities = Array.isArray(data.user?.identities) && data.user.identities.length === 0;

          if (noIdentities) {
            toast.error("This email is already registered. Verify it from your inbox or resend the verification email.");
            setActiveTab("signin");
            setPassword("");
            return;
          }

          toast.success("Account created. Please verify your email, then sign in.");
          setActiveTab("signin");
          setPassword("");
          return;
        }

        toast.success("Account created! You're signed in.");
        onSuccess();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        onSuccess();
      }
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required minLength={6} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {mode === "signin" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Use your verified email and password to sign in.</p>
          <Button type="button" variant="ghost" size="sm" className="h-auto px-0 text-xs" onClick={handleResendVerification} disabled={resending || loading}>
            {resending ? "Sending verification..." : "Resend verification email"}
          </Button>
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <Mail className="mr-2 h-4 w-4" />
        {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
      </Button>
    </form>
  );
}
