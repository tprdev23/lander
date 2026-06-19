import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "No text provided" }, { status: 400 });
  }

  const prompt = `Extract these 4 fields from the job posting below. Return ONLY a JSON object, nothing else, no markdown.

{"title":"job title here","company":"company name here","location":"location here","salary":"salary here or empty string"}

Rules:
- For salary: look for any pay, compensation, or salary mention including ranges like £30,000-£38,000
- For location: include city and whether remote/hybrid/in-person if mentioned
- If a field is not found, use empty string

Job posting:
${text}`;

  try {
    const res = await fetch(`${BASE_URL}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    const reply: string = data.reply || "";

    const match = reply.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in response");

    const parsed = JSON.parse(match[0]);

    return NextResponse.json({
      title: parsed.title || "",
      company: parsed.company || "",
      location: parsed.location || "",
      salary: parsed.salary || "",
      description: text,
    });
  } catch {
    return NextResponse.json({
      title: "",
      company: "",
      location: "",
      salary: "",
      description: text,
    });
  }
}