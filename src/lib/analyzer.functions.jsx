import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  resumeText: z.string().min(50).max(50000),
  fileName: z.string().max(255).optional(),
});

const Lovable_AI_URL = "https://ai.gateway.Lovable.dev/v1/chat/completions";

const SYSTEM_PROMPT = `You are CareerOS AI — a hybrid of: an ATS engine, a senior tech recruiter at FAANG, a hiring manager, an executive career coach, and a LinkedIn expert.

Analyze the provided resume text rigorously. Be SPECIFIC, brutal but constructive. Cite exact phrases from the resume.

For EVERY suggestion include: WHY it matters, the HIRING IMPACT, and the FIX.

Return strict JSON ONLY (no markdown, no commentary) matching the tool schema.`;

const analysisTool = {
  type: "function",
  function: {
    name: "submit_resume_analysis",
    description: "Submit the complete resume analysis",
    parameters: {
      type: "object",
      properties: {
        scores: {
          type: "object",
          properties: {
            careerHealth: { type: "number" }, ats: { type: "number" }, resume: { type: "number" },
            jobMatch: { type: "number" }, hiringProbability: { type: "number" },
            rejectionRisk: { type: "number" }, salaryPotential: { type: "number" },
            interviewReadiness: { type: "number" },
          },
          required: ["careerHealth", "ats", "resume", "jobMatch", "hiringProbability", "rejectionRisk", "salaryPotential", "interviewReadiness"],
        },
        summary: { type: "string" },
        extracted: {
          type: "object",
          properties: {
            name: { type: "string" }, role: { type: "string" }, yearsExperience: { type: "number" },
            skills: { type: "array", items: { type: "string" } },
            education: { type: "array", items: { type: "string" } },
            projects: { type: "array", items: { type: "string" } },
            certifications: { type: "array", items: { type: "string" } },
          },
          required: ["name", "role", "yearsExperience", "skills", "education", "projects", "certifications"],
        },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        atsAnalysis: {
          type: "object",
          properties: {
            keywordDensity: { type: "number" },
            missingKeywords: { type: "array", items: { type: "string" } },
            weakKeywords: { type: "array", items: { type: "string" } },
            potentialScore: { type: "number" },
          },
          required: ["keywordDensity", "missingKeywords", "weakKeywords", "potentialScore"],
        },
        suggestions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              area: { type: "string" }, issue: { type: "string" }, why: { type: "string" },
              impact: { type: "string" }, fix: { type: "string" },
              severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
            },
            required: ["area", "issue", "why", "impact", "fix", "severity"],
          },
        },
        redFlags: {
          type: "array",
          items: {
            type: "object",
            properties: { flag: { type: "string" }, severity: { type: "string", enum: ["low", "medium", "high"] }, fix: { type: "string" } },
            required: ["flag", "severity", "fix"],
          },
        },
        aiDetection: {
          type: "object",
          properties: { aiWrittenPct: { type: "number" }, humanWrittenPct: { type: "number" }, notes: { type: "string" } },
          required: ["aiWrittenPct", "humanWrittenPct", "notes"],
        },
        roleFit: {
          type: "array",
          items: {
            type: "object",
            properties: { role: { type: "string" }, fitScore: { type: "number" }, reason: { type: "string" } },
            required: ["role", "fitScore", "reason"],
          },
        },
        salaryRange: {
          type: "object",
          properties: { currency: { type: "string" }, min: { type: "number" }, max: { type: "number" }, confidence: { type: "number" } },
          required: ["currency", "min", "max", "confidence"],
        },
        roadmap30d: { type: "array", items: { type: "string" } },
      },
      required: ["scores", "summary", "extracted", "strengths", "weaknesses", "atsAnalysis", "suggestions", "redFlags", "aiDetection", "roleFit", "salaryRange", "roadmap30d"],
    },
  },
};

export const analyzeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env.L_API_KEY;
    if (!apiKey) throw new Error("Lovable_API_KEY not configured");

    const res = await fetch(Lovable_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Analyze this resume:\n\n${data.resumeText}` },
        ],
        tools: [analysisTool],
        tool_choice: { type: "function", function: { name: "submit_resume_analysis" } },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit hit. Please wait a moment and try again.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
      console.error("AI Gateway error", res.status, text);
      throw new Error("AI analysis failed. Please try again.");
    }

    const body = await res.json();
    const toolCall = body.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("AI did not return a structured analysis.");

    let parsed;
    try { parsed = JSON.parse(toolCall.function.arguments); }
    catch { throw new Error("AI returned invalid analysis JSON."); }

    // Persist
    const { supabase, userId } = context;
    const { data: saved, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        file_name: data.fileName ?? null,
        resume_text: data.resumeText,
        career_health: Math.round(parsed?.scores?.careerHealth ?? 0),
        ats_score: Math.round(parsed?.scores?.ats ?? 0),
        result: parsed,
      })
      .select("id")
      .single();
    if (error) console.error("Save analysis failed", error);

    return { ...parsed, id: saved?.id };
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("analyses")
      .select("id, file_name, career_health, ats_score, created_at, result")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getLatestAnalysis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("analyses")
      .select("id, result, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ?? null;
  }); 