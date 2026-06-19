import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("GROQ KEY:", process.env.GROQ_API_KEY);

  try {
    const { prompt } = await req.json();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    console.log("GROQ RAW:", data);

    const reply = data?.choices?.[0]?.message?.content || "No response from model";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
