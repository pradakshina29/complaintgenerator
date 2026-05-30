import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = React.createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

async function ensureProfile(user: User) {
  const displayName =
    typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim().length > 0
      ? user.user_metadata.display_name.trim()
      : user.email?.split("@")[0] ?? null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return;

  if (!profile) {
    await supabase.from("profiles").insert({
      user_id: user.id,
      display_name: displayName,
    });
    return;
  }

  if (!profile.display_name && displayName) {
    await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const applySession = (sess: Session | null) => {
      if (!mounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      applySession(sess);
      if (sess?.user) {
        void ensureProfile(sess.user);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        applySession(data.session);
        if (data.session?.user) {
          void ensureProfile(data.session.user);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return <Ctx.Provider value={{ user, session, loading, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return React.useContext(Ctx);
}
