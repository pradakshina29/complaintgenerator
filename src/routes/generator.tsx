import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Sparkles, Copy, Download, Save, Wand2, FileText, Mail } from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateComplaint, QUICK_TEMPLATES } from "@/lib/complaint-engine";
import type {
  ComplaintType,
  Tone,
  Severity,
  OutputFormat,
  Language,
  GeneratedComplaint,
} from "@/lib/complaint-engine";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

export const Route = createFileRoute("/generator")({
  component: GeneratorPage,
});

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

function GeneratorPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [issue, setIssue] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [complaintType, setComplaintType] = useState<ComplaintType>("College");
  const [tone, setTone] = useState<Tone>("Polite");
  const [severity, setSeverity] = useState<Severity>("Medium");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("Email");
  const [language, setLanguage] = useState<Language>("English");

  const [generated, setGenerated] = useState<GeneratedComplaint | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Voice
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;
    if (SR) {
      setVoiceSupported(true);
      const r = new SR();
      r.continuous = false;
      r.interimResults = false;
      const langMap: Record<Language, string> = {
        English: "en-US",
        Tamil: "ta-IN",
        Hindi: "hi-IN",
        Telugu: "te-IN",
        Malayalam: "ml-IN",
        Kannada: "kn-IN",
        Spanish: "es-ES",
        French: "fr-FR",
      };
      r.lang = langMap[language] || "en-US";
      r.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map((res) => res[0].transcript)
          .join(" ");
        setIssue((prev) => (prev ? prev + " " + transcript : transcript));
      };
      r.onend = () => setListening(false);
      r.onerror = (e) => {
        toast.error("Voice error: " + e.error);
        setListening(false);
      };
      recognitionRef.current = r;
    }
    return () => {
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, [language]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  function toggleVoice() {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
        toast.info(language === "Tamil" ? "தமிழில் பேசுங்கள்..." : "Listening...");
      } catch {
        toast.error("Could not start microphone");
      }
    }
  }

  function handleGenerate() {
    if (!issue.trim()) {
      toast.error("Please describe your issue first");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      const result = generateComplaint({
        issue,
        recipientName,
        senderName,
        complaintType,
        tone,
        severity,
        outputFormat,
        language,
      });
      setGenerated(result);
      setGenerating(false);
      toast.success(`Complaint generated · Score ${result.qualityScore}/100`);
    }, 400);
  }

  async function handleSave() {
    if (!generated || !user) return;
    setSaving(true);
    const { error } = await supabase.from("complaints").insert({
      user_id: user.id,
      issue,
      recipient_name: recipientName || null,
      complaint_type: complaintType,
      tone,
      severity,
      output_format: outputFormat,
      language,
      subject: generated.subject,
      body: generated.body,
      quality_score: generated.qualityScore,
      status: "Draft",
    });
    setSaving(false);
    if (error) {
      toast.error("Save failed: " + error.message);
    } else {
      toast.success("Saved to your history");
    }
  }

  function handleCopy() {
    if (!generated) return;
    const text = `Subject: ${generated.subject}\n\n${generated.body}`;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function handleDownloadPDF() {
    if (!generated) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 50;
    const maxWidth = 595 - margin * 2;
    let y = margin;
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text(`Subject: ${generated.subject}`, margin, y, { maxWidth });
    y += 30;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(generated.body, maxWidth);
    lines.forEach((line: string) => {
      if (y > 800) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 16;
    });
    doc.save(`complaint-${Date.now()}.pdf`);
    toast.success("PDF downloaded");
  }

  function handleDownloadText() {
    if (!generated) return;
    const text = `Subject: ${generated.subject}\n\n${generated.body}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaint-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold tracking-tight">Generator</h1>
          <p className="mt-2 text-muted-foreground">Describe your issue, choose tone & format, get a polished complaint.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-border bg-card p-6"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="font-serif text-xl font-bold mb-4">Complaint Details</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quick Templates</Label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => setIssue(t.value)}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent-foreground"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="issue">Your Issue *</Label>
                  {voiceSupported && (
                    <Button
                      type="button"
                      size="sm"
                      variant={listening ? "destructive" : "outline"}
                      onClick={toggleVoice}
                      className="h-7"
                    >
                      {listening ? <MicOff className="h-3.5 w-3.5 mr-1" /> : <Mic className="h-3.5 w-3.5 mr-1" />}
                      {listening ? "Stop" : "Voice"}
                    </Button>
                  )}
                </div>
                <Textarea
                  id="issue"
                  rows={5}
                  placeholder="Describe what happened in plain words. The engine will polish it."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{issue.trim().split(/\s+/).filter(Boolean).length} words</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Recipient (optional)</Label>
                  <Input placeholder="e.g. Mr. Kumar" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input placeholder="Your name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Complaint Type</Label>
                  <Select value={complaintType} onValueChange={(v) => setComplaintType(v as ComplaintType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="College">College / Education</SelectItem>
                      <SelectItem value="Bank">Bank / Finance</SelectItem>
                      <SelectItem value="Workplace">Workplace / HR</SelectItem>
                      <SelectItem value="Hospital">Hospital / Medical</SelectItem>
                      <SelectItem value="Restaurant">Restaurant / Food</SelectItem>
                      <SelectItem value="Government">Government Office</SelectItem>
                      <SelectItem value="OnlineShopping">Online Shopping</SelectItem>
                      <SelectItem value="Landlord">Landlord / Rental</SelectItem>
                      <SelectItem value="Telecom">Telecom / Internet</SelectItem>
                      <SelectItem value="Transport">Transport / Cab</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Polite">Polite</SelectItem>
                      <SelectItem value="Strict">Strict</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Tamil">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="Telugu">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="Malayalam">മലയാളം (Malayalam)</SelectItem>
                      <SelectItem value="Kannada">ಕನ್ನಡ (Kannada)</SelectItem>
                      <SelectItem value="Spanish">Español (Spanish)</SelectItem>
                      <SelectItem value="French">Français (French)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full h-11"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {generating ? "Generating..." : "Generate Complaint"}
              </Button>
            </div>
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-border bg-card p-6 flex flex-col"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                {outputFormat === "Email" ? <Mail className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                Generated Complaint
              </h2>
              {generated && (
                <Badge
                  variant="secondary"
                  className="font-mono"
                  style={{
                    backgroundColor:
                      generated.qualityScore >= 80 ? "var(--success)" : generated.qualityScore >= 60 ? "var(--warning)" : "var(--destructive)",
                    color: "var(--success-foreground)",
                  }}
                >
                  {generated.qualityScore}/100
                </Badge>
              )}
            </div>

            {!generated ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
                <Sparkles className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">Your polished complaint will appear here.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Subject</div>
                  <div className="font-medium">{generated.subject}</div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4 flex-1">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Body</div>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generated.body}</pre>
                </div>

                {generated.qualityNotes.length > 0 && (
                  <div className="rounded-lg border border-accent/30 bg-accent-soft/40 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Quality insights</div>
                    <ul className="space-y-1 text-sm">
                      {generated.qualityNotes.map((n, i) => (
                        <li key={i} className="flex gap-2"><span className="text-accent">•</span>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}><Copy className="mr-1.5 h-4 w-4" />Copy</Button>
                  <Button size="sm" variant="outline" onClick={handleDownloadPDF}><Download className="mr-1.5 h-4 w-4" />PDF</Button>
                  <Button size="sm" variant="outline" onClick={handleDownloadText}><Download className="mr-1.5 h-4 w-4" />.txt</Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="ml-auto">
                    <Save className="mr-1.5 h-4 w-4" />{saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
