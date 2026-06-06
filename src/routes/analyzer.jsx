import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { extractPdfText } from "@/lib/pdf";
import { analyzeResume } from "@/lib/analyzer.functions";
import { toast } from "sonner";
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle, AlertCircle,
  Sparkles, TrendingUp, Target, ShieldAlert,
} from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

export const Route = createFileRoute("/analyzer")({
  head: () => ({ meta: [{ title: "Resume Analyzer — CareerOS AI" }] }),
  component: Analyzer,
});

function Analyzer() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const runAnalysis = useServerFn(analyzeResume);

  const [file, setFile] = useState(null);
  const [stage, setStage] = useState("idle");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  async function handleAnalyze() {
    if (!file) return;
    try {
      setStage("parsing");
      const text = await extractPdfText(file);
      if (text.length < 100) throw new Error("Couldn't extract enough text from the PDF.");
      setStage("analyzing");
      const result = await runAnalysis({ data: { resumeText: text.slice(0, 50000), fileName: file.name } });
      setAnalysis(result);
      setStage("done");
      toast.success("Analysis complete");
    } catch (e) {
      toast.error(e?.message ?? "Analysis failed");
      setStage("idle");
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-6 py-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">Resume Analyzer</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Drop in your resume. Get recruiter-grade feedback.</h1>
        </div>

        {!analysis && (
          <div className="mt-8 glass rounded-2xl p-10 text-center shadow-elegant">
            <label className="cursor-pointer">
              <input
                type="file" accept="application/pdf" className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={stage !== "idle"}
              />
              <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border/60 p-10 transition hover:border-primary/60 hover:bg-card/40">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary shadow-glow">
                  <Upload className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">{file ? file.name : "Click to upload your resume"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF only • max 10MB</p>
                </div>
              </div>
            </label>

            <Button onClick={handleAnalyze} disabled={!file || stage !== "idle"} variant="hero" size="lg" className="mt-6 h-12 px-8">
              {stage === "parsing" && <><Loader2 className="h-4 w-4 animate-spin" /> Reading PDF…</>}
              {stage === "analyzing" && <><Loader2 className="h-4 w-4 animate-spin" /> Recruiter AI analyzing…</>}
              {stage === "idle" && <><Sparkles className="h-4 w-4" /> Analyze Resume</>}
            </Button>

            <div className="mt-8 grid gap-4 text-left text-sm md:grid-cols-3">
              {[
                { i: FileText, t: "ATS-grade extraction", d: "Skills, projects, experience, certifications" },
                { i: Target, t: "21 intelligence dimensions", d: "From keyword density to recruiter verdict" },
                { i: TrendingUp, t: "Quantified impact", d: "Every fix tied to hiring outcome" },
              ].map((x) => (
                <div key={x.t} className="rounded-xl border border-border/40 p-4">
                  <x.i className="h-4 w-4 text-accent" />
                  <p className="mt-2 font-medium">{x.t}</p>
                  <p className="text-xs text-muted-foreground">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysis && <AnalysisView a={analysis} onReset={() => { setAnalysis(null); setFile(null); setStage("idle"); }} />}
      </div>
      <Footer />
    </div>
  );
}

function ScoreRing({ value, label, color }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="relative h-28">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="68%" outerRadius="100%" data={[{ value, fill: color }]} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: "color-mix(in oklab, var(--foreground) 8%, transparent)" }} dataKey="value" cornerRadius={20} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>{Math.round(value)}</span>
        </div>
      </div>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function sevColor(s) {
  if (s === "critical" || s === "high") return "text-destructive border-destructive/40 bg-destructive/10";
  if (s === "medium") return "text-warning border-warning/40 bg-warning/10";
  return "text-muted-foreground border-border bg-muted/40";
}

function AnalysisView({ a, onReset }) {
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{a.extracted.name || "Your Resume"}</h2>
          <p className="text-sm text-muted-foreground">Target role: <span className="text-foreground">{a.extracted.role}</span> · {a.extracted.yearsExperience} yrs experience</p>
        </div>
        <Button variant="outline" onClick={onReset}>Analyze another</Button>
      </div>

      <div className="glass rounded-2xl p-6 shadow-card">
        <p className="text-xs uppercase tracking-wider text-accent">Recruiter Verdict</p>
        <p className="mt-2 text-lg">{a.summary}</p>
      </div>

      {/* Scores */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <ScoreRing value={a.scores.careerHealth} label="Career Health" color={colors[0]} />
        <ScoreRing value={a.scores.ats} label="ATS Score" color={colors[1]} />
        <ScoreRing value={a.scores.resume} label="Resume" color={colors[2]} />
        <ScoreRing value={a.scores.hiringProbability} label="Hire Prob." color={colors[3]} />
        <ScoreRing value={a.scores.jobMatch} label="Job Match" color={colors[4]} />
        <ScoreRing value={a.scores.interviewReadiness} label="Interview" color={colors[0]} />
        <ScoreRing value={a.scores.salaryPotential} label="Salary Potential" color={colors[1]} />
        <ScoreRing value={100 - a.scores.rejectionRisk} label="Low Rejection" color={colors[2]} />
      </div>

      {/* ATS panel */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">ATS Optimization</p>
            <span className="text-xs text-success">Potential: {a.atsAnalysis.potentialScore}/100</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Current ATS</p>
              <p className="text-3xl font-bold text-foreground">{a.scores.ats}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Keyword density</p>
              <p className="text-3xl font-bold text-foreground">{a.atsAnalysis.keywordDensity}%</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Missing keywords</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {a.atsAnalysis.missingKeywords.map((k) => <span key={k} className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs">{k}</span>)}
            </div>
          </div>
          {a.atsAnalysis.weakKeywords.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-warning">Weak keywords</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.atsAnalysis.weakKeywords.map((k) => <span key={k} className="rounded-md border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs">{k}</span>)}
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Extracted Profile</p>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Skills</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {a.extracted.skills.slice(0, 18).map((s) => <span key={s} className="rounded-md border border-border bg-card/60 px-2 py-0.5 text-xs">{s}</span>)}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Projects</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-foreground/80">{a.extracted.projects.slice(0, 4).map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Education</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-foreground/80">{a.extracted.education.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & weaknesses */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 shadow-card">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-success"><CheckCircle2 className="h-4 w-4" /> Strengths</p>
          <ul className="mt-3 space-y-2 text-sm">
            {a.strengths.map((s, i) => <li key={i} className="flex gap-2"><span className="text-success">✓</span><span>{s}</span></li>)}
          </ul>
        </div>
        <div className="glass rounded-2xl p-6 shadow-card">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-destructive"><AlertCircle className="h-4 w-4" /> Weaknesses</p>
          <ul className="mt-3 space-y-2 text-sm">
            {a.weaknesses.map((w, i) => <li key={i} className="flex gap-2"><span className="text-destructive">✗</span><span>{w}</span></li>)}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      <div className="glass rounded-2xl p-6 shadow-card">
        <p className="text-xs uppercase tracking-wider text-accent">Improvement Suggestions</p>
        <div className="mt-4 space-y-3">
          {a.suggestions.map((s, i) => (
            <div key={i} className={`rounded-xl border p-4 ${sevColor(s.severity)}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{s.area}</p>
                <span className="rounded-full border border-current/40 px-2 py-0.5 text-[10px] uppercase tracking-widest">{s.severity}</span>
              </div>
              <p className="mt-2 text-sm text-foreground/90"><b>Issue:</b> {s.issue}</p>
              <p className="mt-1 text-sm text-foreground/80"><b>Why it matters:</b> {s.why}</p>
              <p className="mt-1 text-sm text-foreground/80"><b>Hiring impact:</b> {s.impact}</p>
              <p className="mt-1 text-sm text-foreground"><b>Fix:</b> {s.fix}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Red flags */}
      {a.redFlags.length > 0 && (
        <div className="glass rounded-2xl p-6 shadow-card">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-warning"><ShieldAlert className="h-4 w-4" /> Red Flags</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {a.redFlags.map((r, i) => (
              <div key={i} className={`rounded-xl border p-3 text-sm ${sevColor(r.severity)}`}>
                <p className="font-semibold text-foreground">{r.flag}</p>
                <p className="mt-1 text-xs text-foreground/80">{r.fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role fit + Salary */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Best Role Fit</p>
          <div className="mt-3 space-y-2">
            {a.roleFit.map((r, i) => (
              <div key={i} className="rounded-lg border border-border/40 p-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold">{r.role}</p>
                  <span className="text-primary">{r.fitScore}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full gradient-primary" style={{ width: `${r.fitScore}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6 shadow-card">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Salary Estimate</p>
          <p className="mt-3 text-4xl font-bold gradient-text">
            {a.salaryRange.currency} {a.salaryRange.min.toLocaleString()} – {a.salaryRange.max.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Confidence: {a.salaryRange.confidence}%</p>
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI-written detection</p>
            <div className="mt-2 flex gap-3 text-sm">
              <div className="flex-1 rounded-lg border border-border/40 p-3"><p className="text-xs text-muted-foreground">AI</p><p className="text-xl font-bold text-warning">{a.aiDetection.aiWrittenPct}%</p></div>
              <div className="flex-1 rounded-lg border border-border/40 p-3"><p className="text-xs text-muted-foreground">Human</p><p className="text-xl font-bold text-success">{a.aiDetection.humanWrittenPct}%</p></div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{a.aiDetection.notes}</p>
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="glass rounded-2xl p-6 shadow-card">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent"><TrendingUp className="h-4 w-4" /> 30-Day Roadmap</p>
        <ol className="mt-4 space-y-2">
          {a.roadmap30d.map((step, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-border/40 p-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}