import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { useAuth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { listAnalyses } from "@/lib/analyzer.functions";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid,
} from "recharts";
import {
  FileSearch, TrendingUp, Github, Linkedin, MessageSquare, Briefcase,
  Activity, Trophy, AlertTriangle, LogOut, Sparkles, FileText, Clock,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CareerOS AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fetchList = useServerFn(listAnalyses);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchList()
      .then((d) => setRows(d ?? []))
      .catch(() => setRows([]))
      .finally(() => setBusy(false));
  }, [user, fetchList]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading your Career OS…</div>;
  }

  const latest = rows[0];
  const r = latest?.result ?? {};
  const scoreCards = [
    { label: "Career Health", value: r?.scores?.careerHealth ?? 0, icon: Activity, color: "var(--chart-1)" },
    { label: "ATS Score", value: r?.scores?.ats ?? 0, icon: FileSearch, color: "var(--chart-2)" },
    { label: "Resume", value: r?.scores?.resume ?? 0, icon: Briefcase, color: "var(--chart-3)" },
    { label: "Job Match", value: r?.scores?.jobMatch ?? 0, icon: Trophy, color: "var(--chart-4)" },
    { label: "Interview Ready", value: r?.scores?.interviewReadiness ?? 0, icon: MessageSquare, color: "var(--chart-5)" },
    { label: "Hiring Prob.", value: r?.scores?.hiringProbability ?? 0, icon: TrendingUp, color: "var(--chart-1)" },
    { label: "Salary Potential", value: r?.scores?.salaryPotential ?? 0, icon: Github, color: "var(--chart-2)" },
    { label: "Low Rejection", value: 100 - (r?.scores?.rejectionRisk ?? 0), icon: Linkedin, color: "var(--chart-3)" },
  ];

  const trendData = rows
    .slice()
    .reverse()
    .map((row, i) => ({ week: `#${i + 1}`, score: row.career_health }));

  const skillData = (r?.extracted?.skills ?? []).slice(0, 6).map((s) => ({
    skill: s.length > 10 ? s.slice(0, 10) + "…" : s,
    value: 60 + Math.floor(Math.random() * 35),
  }));

  const recs = (r?.suggestions ?? []).slice(0, 4).map((s) => ({
    t: s.fix || s.issue,
    s: s.severity === "critical" ? "high" : s.severity,
  }));

  const heroScore = r?.scores?.careerHealth ?? 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">Career Intelligence Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">Welcome back, <span className="gradient-text">{user.email?.split("@")[0]}</span></h1>
            <p className="mt-1 text-sm text-muted-foreground">Your full hiring readiness, in real time.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/interview"><Button variant="outline"><MessageSquare className="h-4 w-4" /> Mock Interview</Button></Link>
            <Link to="/analyzer"><Button variant="hero"><Sparkles className="h-4 w-4" /> New Analysis</Button></Link>
            <Button variant="ghost" size="icon" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {busy ? (
          <div className="mt-12 text-center text-sm text-muted-foreground">Loading your analyses…</div>
        ) : !latest ? (
          <div className="mt-10 glass rounded-2xl p-10 text-center shadow-elegant">
            <FileText className="mx-auto h-10 w-10 text-accent" />
            <h2 className="mt-3 text-xl font-semibold">No analyses yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Upload your first resume to populate your Career OS.</p>
            <Link to="/analyzer"><Button variant="hero" size="lg" className="mt-5"><Sparkles className="h-4 w-4" /> Analyze Resume</Button></Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-1 glass rounded-2xl p-6 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Career Health Score</p>
                <div className="relative h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "score", value: heroScore, fill: "var(--chart-1)" }]} startAngle={90} endAngle={-270}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background={{ fill: "color-mix(in oklab, var(--foreground) 8%, transparent)" }} dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl font-bold gradient-text">{Math.round(heroScore)}</p>
                    <p className="text-xs text-muted-foreground">out of 100</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground line-clamp-2">{r?.summary}</p>
              </div>

              <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Score Trend</p>
                  <p className="text-xs text-success">{rows.length} analyses</p>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 16, right: 8, bottom: 0, left: -16 }}>
                      <CartesianGrid stroke="color-mix(in oklab, var(--foreground) 6%, transparent)" vertical={false} />
                      <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                      <Line type="monotone" dataKey="score" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4, fill: "var(--chart-2)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {scoreCards.map((s) => (
                <div key={s.label} className="glass rounded-xl p-5 shadow-card transition hover:border-primary/40">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-3xl font-bold" style={{ color: s.color }}>{Math.round(s.value)}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 glass rounded-2xl p-6 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Top Skills</p>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                      <CartesianGrid stroke="color-mix(in oklab, var(--foreground) 6%, transparent)" vertical={false} />
                      <XAxis dataKey="skill" stroke="var(--muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--chart-1)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass rounded-2xl p-6 shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Top Recommendations</p>
                <ul className="mt-3 space-y-3 text-sm">
                  {recs.length === 0 && <li className="text-muted-foreground text-xs">No recommendations yet.</li>}
                  {recs.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg border border-border/40 p-3">
                      <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${r.s === "high" ? "text-destructive" : "text-warning"}`} />
                      <span className="text-xs">{r.t}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/analyzer"><Button variant="hero" className="mt-4 w-full">Run new analysis</Button></Link>
              </div>
            </div>

            <div className="mt-6 glass rounded-2xl p-6 shadow-card">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent Analyses</p>
              <div className="mt-3 divide-y divide-border/40">
                {rows.map((row) => (
                  <div key={row.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-accent" />
                      <div>
                        <p className="text-sm font-medium">{row.file_name ?? "Untitled resume"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {new Date(row.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Health <b className="text-foreground">{row.career_health}</b></span>
                      <span>ATS <b className="text-foreground">{row.ats_score}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}