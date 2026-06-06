import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Lovable_AI_URL = "https://ai.gateway.Lovable.dev/v1/chat/completions";

async function callAI(messages, tools, toolName) {
  const apiKey = process.env.Lovable_API_KEY;
  if (!apiKey) throw new Error("Lovable_API_KEY not configured");
  const res = await fetch(Lovable_AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      ...(tools ? { tools, tool_choice: toolName ? { type: "function", function: { name: toolName } } : "auto" } : {}),
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limit hit. Wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    const t = await res.text();
    console.error("AI error", res.status, t);
    throw new Error("AI request failed.");
  }
  return res.json();
}

export const startInterview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      role: z.string().min(2).max(120),
      level: z.enum(["intern", "junior", "mid", "senior", "staff"]),
      interviewType: z.enum(["behavioral", "technical", "system-design", "mixed"]),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const year = new Date().getFullYear();
    const sys = `You are a senior interviewer at a top-tier tech company (FAANG / unicorn startup) in ${year} conducting a ${data.interviewType} interview for a ${data.level} ${data.role}.

Ask ONE sharp, ROLE-SPECIFIC opening question that reflects what is ACTUALLY being asked in ${year} interviews for this role. Cover trending and relevant topics such as:
- Modern frameworks, tools and patterns currently in demand for a ${data.role} (e.g. for engineers: React Server Components, Next.js App Router, edge runtimes, RSC streaming, LLM integration, RAG, vector DBs, agentic workflows, TypeScript inference, observability; for PMs: AI product strategy, north-star metrics, GenAI feature scoping; for data: LLM evals, RAG pipelines, feature stores).
- Real production scenarios (scaling, debugging, trade-offs, incidents) — not textbook trivia.
- Behavioral: ownership, ambiguity, conflict, recent impact (use STAR-friendly prompts).
- System design (if applicable): real systems used in ${year} (chat apps with AI, real-time feeds, multi-tenant SaaS, recommendation systems).

Calibrate difficulty to ${data.level}. Be concise (max 2 sentences). No preamble, no greeting — just the question.`;
    const ai = await callAI([
      { role: "system", content: sys },
      { role: "user", content: "Start the interview." },
    ]);
    const question = ai.choices?.[0]?.message?.content?.trim() ?? "Tell me about a challenging project you led recently.";

    const { data: session, error } = await supabase
      .from("interview_sessions")
      .insert({ user_id: userId, role: data.role, level: data.level, interview_type: data.interviewType, status: "active" })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await supabase.from("interview_turns").insert({
      session_id: session.id, user_id: userId, idx: 0, question,
    });

    return { sessionId: session.id, question };
  });

const feedbackTool = {
  type: "function",
  function: {
    name: "submit_feedback",
    parameters: {
      type: "object",
      properties: {
        score: { type: "number", description: "0-100" },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        idealAnswer: { type: "string" },
        nextQuestion: { type: "string", description: "The next interview question" },
        shouldEnd: { type: "boolean" },
      },
      required: ["score", "strengths", "weaknesses", "idealAnswer", "nextQuestion", "shouldEnd"],
    },
  },
};

export const submitAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      sessionId: z.string().uuid(),
      turnId: z.string().uuid(),
      answer: z.string().min(1).max(8000),
    }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: session } = await supabase
      .from("interview_sessions")
      .select("id, role, level, interview_type")
      .eq("id", data.sessionId)
      .single();
    if (!session) throw new Error("Session not found");

    const { data: turns } = await supabase
      .from("interview_turns")
      .select("idx, question, answer, score")
      .eq("session_id", data.sessionId)
      .order("idx", { ascending: true });

    const turnCount = turns?.length ?? 1;
    const current = turns?.find((t) => t.idx === (turns.length - 1));

    const year = new Date().getFullYear();
    const sys = `You are a senior interviewer in ${year} at a top-tier tech company evaluating a ${session.level} ${session.role} (${session.interview_type} round).

1. Score the candidate's latest answer (0-100) using STAR / clarity / technical depth / real-world judgement.
2. List 2-4 strengths and 2-4 weaknesses citing their EXACT words.
3. Provide a tight, modern ideal answer (3-5 sentences) reflecting how a strong ${year} candidate would respond.
4. Ask the NEXT question — it MUST be:
   - Relevant and trending for ${session.role} interviews in ${year} (modern stack, real production scenarios, AI/LLM integration where appropriate, current best practices — NOT outdated trivia).
   - A natural progression: deeper follow-up if their answer was weak; a new high-signal topic if strong.
   - Varied across rounds (mix behavioral, technical depth, system design, trade-offs, debugging, leadership) so the candidate is fully stress-tested.
   - Calibrated to ${session.level} level and the ${session.interview_type} round type.
5. Set shouldEnd=true after question 6 unless the candidate is clearly underperforming and needs one more probe.

Be specific, fair, and brutally honest. Never repeat a topic already covered.`;

    const history = (turns ?? [])
      .map((t) => `Q${t.idx + 1}: ${t.question}\nA${t.idx + 1}: ${t.idx === turnCount - 1 ? data.answer : (t.answer ?? "")}`)
      .join("\n\n");

    const ai = await callAI(
      [
        { role: "system", content: sys },
        { role: "user", content: `Interview so far:\n\n${history}\n\nScore the latest answer and ask the next question.` },
      ],
      [feedbackTool],
      "submit_feedback",
    );

    const tc = ai.choices?.[0]?.message?.tool_calls?.[0];
    if (!tc?.function?.arguments) throw new Error("AI did not return feedback.");
    const parsed = JSON.parse(tc.function.arguments);

    await supabase
      .from("interview_turns")
      .update({
        answer: data.answer,
        score: Math.round(parsed.score),
        feedback: { strengths: parsed.strengths, weaknesses: parsed.weaknesses, idealAnswer: parsed.idealAnswer },
      })
      .eq("id", data.turnId);

    const ended = parsed.shouldEnd || turnCount >= 6;

    let nextTurn = null;
    if (!ended) {
      const { data: inserted } = await supabase
        .from("interview_turns")
        .insert({ session_id: data.sessionId, user_id: userId, idx: turnCount, question: parsed.nextQuestion })
        .select("id, idx, question")
        .single();
      nextTurn = inserted;
    } else {
      const scores = (turns ?? []).map((t) => (t.idx === turnCount - 1 ? parsed.score : t.score ?? 0));
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length));
      await supabase
        .from("interview_sessions")
        .update({ status: "completed", overall_score: overall, summary: parsed.idealAnswer.slice(0, 400) })
        .eq("id", data.sessionId);
    }

    return {
      feedback: { score: parsed.score, strengths: parsed.strengths, weaknesses: parsed.weaknesses, idealAnswer: parsed.idealAnswer },
      next: nextTurn,
      ended,
    };
  });

export const getInterviewSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ sessionId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: session } = await context.supabase
      .from("interview_sessions").select("*").eq("id", data.sessionId).single();
    const { data: turns } = await context.supabase
      .from("interview_turns").select("*").eq("session_id", data.sessionId).order("idx");
    return { session, turns: turns ?? [] };
  }); 
  