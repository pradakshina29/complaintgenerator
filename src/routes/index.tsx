import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Shield, Languages, BarChart3, Mic, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user } = useAuth();
  const ctaLink = user ? "/generator" : "/auth";

  const features = [
    { icon: Sparkles, title: "Smart Generation", desc: "Rule-based engine builds polished letters & emails tuned to your tone, severity, and audience." },
    { icon: Mic, title: "Voice Input", desc: "Dictate your issue using built-in speech recognition — perfect for quick mobile use." },
    { icon: Languages, title: "Bilingual", desc: "Switch between English and Tamil with culturally appropriate salutations and tone." },
    { icon: Shield, title: "Quality Score", desc: "Every complaint is scored 0–100 with actionable tips to make it stronger." },
    { icon: BarChart3, title: "Analytics", desc: "Track your complaints by type, severity, and tone across time." },
    { icon: FileText, title: "Export Ready", desc: "One-click copy or download as a formatted PDF letter or email." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-subtle)" }} />
        <div className="absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "var(--gradient-academic)" }} />
        <div className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full opacity-15 blur-3xl bg-accent" />

        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Final-Year Project · Smart Complaint Management
            </div>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Professional complaints,{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-academic)" }}>
                drafted in seconds
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Turn frustrations into well-structured, respectful, and actionable complaint letters or emails — for college, bank, workplace, and beyond.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to={ctaLink}>
                <Button size="lg" className="group h-12 px-8 text-base shadow-lg" style={{ boxShadow: "var(--shadow-elegant)" }}>
                  {user ? "Open Generator" : "Get Started Free"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/generator">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                  See it in action
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground">
              Everything you need
            </h2>
            <p className="mt-4 text-muted-foreground">
              A full toolkit for crafting, tracking, and improving every complaint you write.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent/50"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Ready to make your voice heard?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join in seconds — no setup, no payment. Just better complaints.
          </p>
          <Link to={ctaLink}>
            <Button size="lg" className="mt-8 h-12 px-8 text-base" style={{ boxShadow: "var(--shadow-elegant)" }}>
              {user ? "Open Generator" : "Create your first complaint"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        <p>Smart Complaint Generator · Built with Lovable Cloud</p>
      </footer>
    </div>
  );
}
