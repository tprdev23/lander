import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LANDER_PROMPTS } from "@/lib/ai";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { action, cvText } = await req.json();
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const desc = job.description ?? "";
  const prompts: Record<string, string> = {
    summarise:          LANDER_PROMPTS.summarise(job.title, job.company, desc),
    interviewQuestions: LANDER_PROMPTS.interviewQuestions(job.title, job.company, desc),
    talkingPoints:      LANDER_PROMPTS.talkingPoints(job.title, job.company, desc),
    coverLetter:        LANDER_PROMPTS.coverLetter(job.title, job.company, desc, cvText),
    cvSuggestions:      LANDER_PROMPTS.cvSuggestions(job.title, job.company, desc, cvText ?? ""),
    outreachMessage:    LANDER_PROMPTS.outreachMessage(job.title, job.company, desc),
    followUpEmail:      LANDER_PROMPTS.followUpEmail(job.title, job.company),
    thankYouEmail:      LANDER_PROMPTS.thankYouEmail(job.title, job.company),
    recruiterOutreach:  LANDER_PROMPTS.recruiterOutreach(job.title, job.company, desc),
  };

  const prompt = prompts[action];
  if (!prompt) return NextResponse.json({ error: "Unknown action" }, { status: 400 });

  const res = await fetch(`${BASE_URL}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  return NextResponse.json({ reply: data.reply });
}