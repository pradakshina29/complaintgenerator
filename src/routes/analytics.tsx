import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Sparkles, TrendingUp, FileText, Award, AlertTriangle } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

interface Row {
  complaint_type: string;
  tone: string;
  severity: string;
  language: string;
  status: string;
  quality_score: number;
  created_at: string;
}

const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
];

function AnalyticsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("complaints")
        .select("complaint_type,tone,severity,language,status,quality_score,created_at")
        .order("created_at", { ascending: true });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [user]);

  const stats = useMemo(() => {
    const total = rows.length;
    const avgScore = total ? Math.round(rows.reduce((s, r) => s + r.quality_score, 0) / total) : 0;
    const high = rows.filter((r) => r.severity === "High").length;
    const resolved = rows.filter((r) => r.status === "Resolved").length;
    return { total, avgScore, high, resolved };
  }, [rows]);

  const byType = useMemo(() => groupCount(rows, "complaint_type"), [rows]);
  const byTone = useMemo(() => groupCount(rows, "tone"), [rows]);
  const bySeverity = useMemo(() => groupCount(rows, "severity"), [rows]);
  const byStatus = useMemo(() => groupCount(rows, "status"), [rows]);
  const trend = useMemo(() => {
    const map = new Map<string, { date: string; count: number; score: number; n: number }>();
    rows.forEach((r) => {
      const d = new Date(r.created_at).toISOString().slice(0, 10);
      const cur = map.get(d) ?? { date: d, count: 0, score: 0, n: 0 };
      cur.count += 1; cur.score += r.quality_score; cur.n += 1;
      map.set(d, cur);
    });
    return Array.from(map.values())
      .map((v) => ({ date: v.date.slice(5), count: v.count, avgScore: Math.round(v.score / v.n) }))
      .slice(-14);
  }, [rows]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 animate-pulse text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-2 text-muted-foreground">Insights from your complaint history.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No data yet. Generate complaints to see analytics.</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
              <KPI icon={FileText} label="Total" value={stats.total} />
              <KPI icon={Award} label="Avg Score" value={`${stats.avgScore}/100`} />
              <KPI icon={AlertTriangle} label="High Severity" value={stats.high} />
              <KPI icon={TrendingUp} label="Resolved" value={stats.resolved} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="By Complaint Type">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byType}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="By Severity">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={bySeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {bySeverity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="By Tone">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={byTone}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="By Status">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {byStatus.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="lg:col-span-2">
                <ChartCard title="Activity & Quality Trend (last 14 active days)">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                      <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                      <Line yAxisId="left" type="monotone" dataKey="count" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4 }} name="Complaints" />
                      <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 4 }} name="Avg Score" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function groupCount(rows: Row[], key: keyof Row) {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = String(r[key]);
    map.set(k, (map.get(k) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function KPI({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="mt-2 font-serif text-3xl font-bold">{value}</div>
    </motion.div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="font-serif text-lg font-bold mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}
