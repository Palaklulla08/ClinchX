import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { startInterview, submitAnswer } from "@/lib/interview.functions";
import { toast } from "sonner";
import {
  MessageSquare, Mic, MicOff, Loader2, Send, Sparkles, CheckCircle2,
  AlertCircle, Trophy, RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/interview")({
  head: () => ({ meta: [{ title: "Mock Interview AI — CareerOS AI" }] }),
  component: InterviewPage,
});

function InterviewPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const start = useServerFn(startInterview);
  const submit = useServerFn(submitAnswer);

  const [role, setRole] = useState("Frontend Engineer");
  const [level, setLevel] = useState("mid");
  const [type, setType] = useState("mixed");

  const [sessionId, setSessionId] = useState(null);
  const [turns, setTurns] = useState([]);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [ended, setEnded] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [turns, busy]);

  async function handleStart() {
    setBusy(true);
    try {
      const r = await start({ data: { role, level, interviewType: type } });
      setSessionId(r.sessionId);
      setTurns([{ id: "first", idx: 0, question: r.question }]);
    } catch (e) {
      toast.error(e?.message ?? "Failed to start");
    } finally {
      setBusy(false);
    }
  }

  async function ensureFirstTurnId(sid) {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.from("interview_turns").select("id, idx, question").eq("session_id", sid).order("idx");
    if (data) setTurns(data.map((t) => ({ id: t.id, idx: t.idx, question: t.question })));
  }
  useEffect(() => { if (sessionId) ensureFirstTurnId(sessionId); }, [sessionId]);

  async function handleSubmit() {
    if (!sessionId || !answer.trim() || busy) return;
    const current = turns[turns.length - 1];
    if (!current?.id) return;
    setBusy(true);
    try {
      const r = await submit({ data: { sessionId, turnId: current.id, answer: answer.trim() } });
      setTurns((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], answer: answer.trim(), feedback: r.feedback };
        if (r.next) updated.push({ id: r.next.id, idx: r.next.idx, question: r.next.question });
        return updated;
      });
      setAnswer("");
      if (r.ended) setEnded(true);
    } catch (e) {
      toast.error(e?.message ?? "Failed to submit");
    } finally {
      setBusy(false);
    }
  }

  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice not supported in this browser"); return; }
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = "en-US"; r.continuous = true; r.interimResults = true;
    r.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setAnswer((prev) => prev + " " + t);
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }

  function reset() {
    setSessionId(null); setTurns([]); setAnswer(""); setEnded(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;

  const overallScore = turns.filter(t => t.feedback).length
    ? Math.round(turns.filter(t => t.feedback).reduce((a, t) => a + t.feedback.score, 0) / turns.filter(t => t.feedback).length)
    : 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-6 py-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">Mock Interview AI</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Practice with an AI interviewer that scores every answer.</h1>
        </div>

        {!sessionId && (
          <div className="mt-8 glass rounded-2xl p-8 shadow-elegant max-w-2xl">
            <p className="text-sm text-muted-foreground">Configure your mock interview. The AI will ask role-specific questions and give you brutal, actionable feedback.</p>
            <div className="mt-6 grid gap-4">
              <div>
                <Label>Target role</Label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Backend Engineer" className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Level</Label>
                  <select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-border bg-card px-3 text-sm">
                    <option value="intern">Intern</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="staff">Staff+</option>
                  </select>
                </div>
                <div>
                  <Label>Type</Label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-border bg-card px-3 text-sm">
                    <option value="mixed">Mixed</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="technical">Technical</option>
                    <option value="system-design">System Design</option>
                  </select>
                </div>
              </div>
            </div>
            <Button onClick={handleStart} disabled={busy} variant="hero" size="lg" className="mt-6 h-12 w-full">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Starting…</> : <><Sparkles className="h-4 w-4" /> Start interview</>}
            </Button>
          </div>
        )}

        {sessionId && (
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="glass rounded-2xl p-6 shadow-card">
              <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto space-y-5 pr-2">
                {turns.map((t) => (
                  <div key={t.idx} className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gradient-primary shadow-glow">
                        <MessageSquare className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 rounded-xl border border-border/40 bg-card/40 p-4">
                        <p className="text-xs text-muted-foreground">Interviewer · Q{t.idx + 1}</p>
                        <p className="mt-1 text-sm">{t.question}</p>
                      </div>
                    </div>
                    {t.answer && (
                      <div className="flex gap-3 pl-12">
                        <div className="flex-1 rounded-xl border border-primary/30 bg-primary/5 p-4">
                          <p className="text-xs text-muted-foreground">You</p>
                          <p className="mt-1 text-sm whitespace-pre-wrap">{t.answer}</p>
                        </div>
                      </div>
                    )}
                    {t.feedback && (
                      <div className="ml-12 rounded-xl border border-border/40 p-4 text-sm">
                        <div className="flex items-center justify-between">
                          <p className="text-xs uppercase tracking-wider text-accent">AI Feedback</p>
                          <span className="rounded-full gradient-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{Math.round(t.feedback.score)}/100</span>
                        </div>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" /> Strengths</p>
                            <ul className="mt-1 space-y-1">{t.feedback.strengths.map((s, i) => <li key={i} className="text-xs">• {s}</li>)}</ul>
                          </div>
                          <div>
                            <p className="flex items-center gap-1 text-xs text-destructive"><AlertCircle className="h-3 w-3" /> Improve</p>
                            <ul className="mt-1 space-y-1">{t.feedback.weaknesses.map((s, i) => <li key={i} className="text-xs">• {s}</li>)}</ul>
                          </div>
                        </div>
                        <div className="mt-3 rounded-lg bg-card/60 p-3">
                          <p className="text-xs text-muted-foreground">Ideal answer</p>
                          <p className="mt-1 text-xs text-foreground/90">{t.feedback.idealAnswer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {busy && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pl-12">
                    <Loader2 className="h-4 w-4 animate-spin" /> AI is thinking…
                  </div>
                )}
              </div>

              {!ended ? (
                <div className="mt-5 border-t border-border/40 pt-4">
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={4}
                    placeholder="Type your answer or use voice…"
                    disabled={busy}
                    className="w-full rounded-xl border border-border bg-card/40 p-3 text-sm focus:outline-none focus:border-primary"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={toggleMic} disabled={busy}>
                      {listening ? <><MicOff className="h-4 w-4" /> Stop</> : <><Mic className="h-4 w-4" /> Voice</>}
                    </Button>
                    <Button variant="hero" size="sm" className="ml-auto" onClick={handleSubmit} disabled={busy || !answer.trim()}>
                      <Send className="h-4 w-4" /> Submit answer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-success/40 bg-success/10 p-5 text-center">
                  <Trophy className="mx-auto h-8 w-8 text-warning" />
                  <p className="mt-2 font-semibold">Interview complete</p>
                  <p className="text-sm text-muted-foreground">Overall score: {overallScore}/100</p>
                  <Button variant="hero" className="mt-4" onClick={reset}>
                    <RotateCcw className="h-4 w-4" /> Start new interview
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="glass rounded-2xl p-5 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Session</p>
                <p className="mt-2 text-sm font-semibold">{role}</p>
                <p className="text-xs text-muted-foreground capitalize">{level} · {type}</p>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Live score</p>
                  <p className="text-3xl font-bold gradient-text">{overallScore}</p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full gradient-primary transition-all" style={{ width: `${overallScore}%` }} />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">Question {turns.length} of ~6</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}