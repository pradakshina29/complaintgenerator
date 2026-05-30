import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Eye, Sparkles, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

interface ComplaintRow {
  id: string;
  issue: string;
  recipient_name: string | null;
  complaint_type: string;
  tone: string;
  severity: string;
  output_format: string;
  language: string;
  subject: string;
  body: string;
  quality_score: number;
  status: string;
  created_at: string;
}

function HistoryPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<ComplaintRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const fetchRows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data ?? []) as ComplaintRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchRows();
  }, [user]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this complaint?")) return;
    const { error } = await supabase.from("complaints").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      setRows((r) => r.filter((x) => x.id !== id));
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status updated");
      setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    }
  }

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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-tight">History</h1>
            <p className="mt-2 text-muted-foreground">{rows.length} complaint{rows.length === 1 ? "" : "s"} saved</p>
          </div>
          <Link to="/generator">
            <Button>New Complaint</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">No complaints yet. Create your first one!</p>
            <Link to="/generator">
              <Button className="mt-4">Get Started</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {rows.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline">{r.complaint_type}</Badge>
                      <Badge variant="outline">{r.tone}</Badge>
                      <Badge variant={r.severity === "High" ? "destructive" : "secondary"}>{r.severity}</Badge>
                      <Badge variant="outline">{r.output_format}</Badge>
                      <Badge variant="outline">{r.language}</Badge>
                      <span className="ml-auto text-xs font-mono text-muted-foreground">
                        Score {r.quality_score}/100
                      </span>
                    </div>
                    <h3 className="font-medium truncate">{r.subject}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.issue}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Select value={r.status} onValueChange={(v) => handleStatusChange(r.id, v)}>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Sent">Sent</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />View</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-serif">{r.subject}</DialogTitle>
                      </DialogHeader>
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed mt-2">{r.body}</pre>
                    </DialogContent>
                  </Dialog>

                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)} className="ml-auto text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
