import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight, Brain, FileSearch, Target, Trophy, Briefcase, Sparkles,
  TrendingUp, Shield, Zap, Github, Linkedin, MessageSquare, GitBranch,
  Check, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareerOS AI — Your Personal AI Recruiter & Career Coach" },
      { name: "description", content: "Analyze your resume, GitHub, LinkedIn, interview readiness, hiring probability, salary potential and career roadmap — powered by AI." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: FileSearch, title: "Resume X-Ray", desc: "ATS score, keyword density, action verbs, achievement quality and bullet-level rewrites — with hiring impact attached to every suggestion." },
  { icon: Target, title: "Job Description Matcher", desc: "Paste any JD. Get match %, missing skills, weak areas, hiring recommendation and exactly what to add." },
  { icon: Brain, title: "Recruiter Simulator", desc: "An AI recruiter reviews your profile and tells you why they'd hire or reject you — in their own words." },
  { icon: Shield, title: "Red Flag Detector", desc: "Catch generic summaries, buzzword overload, missing metrics, gaps and weak leadership evidence before recruiters do." },
  { icon: Github, title: "GitHub Analyzer", desc: "Repo complexity, README quality, commit cadence and deployment links — scored like a hiring manager." },
  { icon: Linkedin, title: "LinkedIn Optimizer", desc: "Headline, About, Featured, Skills and activity scored for recruiter visibility and personal branding." },
  { icon: MessageSquare, title: "Mock Interview AI", desc: "Voice-enabled AI interviewer. Behavioral, technical, system design, follow-ups — with scored feedback." },
  { icon: TrendingUp, title: "Salary & Rejection Predictor", desc: "Predicts your market salary, offer probability and the precise reasons rejection risk is what it is." },
  { icon: GitBranch, title: "Personalized Roadmap", desc: "30/60/90/180-day plans with priority, impact, difficulty and curated resources for each skill." },
];

const stats = [
  { v: "21+", l: "AI Intelligence Modules" },
  { v: "94%", l: "Avg ATS Score Lift" },
  { v: "3.7×", l: "Interview Callback Rate" },
  { v: "180d", l: "Roadmap Horizon" },
];

const testimonials = [
  { name: "Aarav Mehta", role: "SDE Intern → Google", text: "Went from 6% callback rate to 4 interviews in 2 weeks. The recruiter simulator was brutal — and exactly what I needed." },
  { name: "Priya Sharma", role: "Frontend Engineer", text: "It told me my GitHub looked like a student's. I fixed 3 READMEs and my LinkedIn DMs from recruiters tripled." },
  { name: "Daniel Okafor", role: "ML Engineer", text: "The mock interview scored my answers harder than any human. Got the offer on the second real interview." },
];

const pricing = [
  { name: "Explorer", price: "Free", desc: "Test the waters", features: ["Resume Analyzer", "ATS Score", "5 AI analyses / month", "Basic Roadmap"], cta: "Start free", highlight: false },
  { name: "Pro", price: "$19", suffix: "/mo", desc: "Most popular for job seekers", features: ["Everything in Explorer", "Unlimited analyses", "Recruiter Simulator", "Mock Interviews", "JD Matcher", "GitHub + LinkedIn Score"], cta: "Go Pro", highlight: true },
  { name: "Career OS", price: "$49", suffix: "/mo", desc: "For senior + ambitious", features: ["Everything in Pro", "AI Career Coach 24/7", "Salary intelligence", "Custom 180-day roadmap", "Priority AI models", "1:1 onboarding"], cta: "Upgrade", highlight: false },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" aria-hidden />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} aria-hidden />
        <div className="container relative mx-auto px-6 pt-24 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Powered by GPT-5 + Gemini intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
            className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            Your personal AI <span className="gradient-text">recruiter</span>,<br />
            career coach & interview mentor.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Analyze your resume, GitHub, LinkedIn, interview readiness, hiring probability,
            salary potential and full career roadmap — in one operating system.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link to="/analyzer">
              <Button variant="hero" size="lg" className="h-12 px-7">
                Analyze Resume <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="glass" size="lg" className="h-12 px-7">
                Start Career Audit
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="glass rounded-2xl p-2 shadow-elegant">
              <div className="rounded-xl bg-background/60 p-6 md:p-10">
                <div className="grid gap-6 md:grid-cols-3">
                  {[
                    { label: "Career Health", value: 86, color: "var(--chart-1)" },
                    { label: "ATS Score", value: 92, color: "var(--chart-2)" },
                    { label: "Hiring Probability", value: 74, color: "var(--chart-3)" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border/40 bg-card/40 p-5 text-left">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
                      <p className="mt-1 text-4xl font-bold" style={{ color: s.color }}>{s.value}<span className="text-lg text-muted-foreground">/100</span></p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${s.value}%` }}
                          transition={{ duration: 1.2, delay: 0.6 }}
                          className="h-full rounded-full"
                          style={{ background: s.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="border-y border-border/40 bg-card/20">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-4xl font-bold gradient-text">{s.v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Intelligence Stack</p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Not a resume reviewer.<br />
            <span className="gradient-text">A recruiter brain.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            21 modules that combine ATS software, recruiters, hiring managers, career coaches,
            interviewers, and LinkedIn & portfolio experts.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="group relative overflow-hidden rounded-2xl glass p-6 shadow-card transition hover:border-primary/40 hover:shadow-glow"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold md:text-5xl">Loved by people who got hired.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass rounded-2xl p-7 shadow-card">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-accent text-sm font-bold text-primary-foreground">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container mx-auto px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Pricing</p>
          <h2 className="mt-3 text-4xl font-bold md:text-5xl">Invest in the next 10 years of your career.</h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pricing.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-8 shadow-card ${p.highlight
                ? "glass border-2 border-primary/50 shadow-glow"
                : "glass"}`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-bold">{p.price}</span>
                {p.suffix && <span className="text-sm text-muted-foreground">{p.suffix}</span>}
              </div>
              <Link to="/auth">
                <Button variant={p.highlight ? "hero" : "outline"} className="mt-6 w-full">
                  {p.cta}
                </Button>
              </Link>
              <ul className="mt-7 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl glass p-12 text-center shadow-elegant">
          <div className="absolute inset-0 opacity-50" style={{ background: "var(--gradient-hero)" }} aria-hidden />
          <div className="relative">
            <Trophy className="mx-auto mb-4 h-10 w-10 text-warning" />
            <h2 className="text-3xl font-bold md:text-4xl">Stop guessing. Start getting hired.</h2>
            <p className="mt-3 text-muted-foreground">Upload your resume in 60 seconds. Get your full Career Health Score.</p>
            <Link to="/analyzer">
              <Button variant="hero" size="lg" className="mt-7 h-12 px-7">
                Analyze my resume <Zap className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
