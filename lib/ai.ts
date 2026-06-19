const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function callAI(prompt: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    throw new Error(`AI call failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.reply as string;
}

export function buildLanderPrompt(role: string, jobTitle: string, company: string, description: string, extra?: string): string {
  return `You are Lander, an expert job coach who is warm, encouraging, and laser-focused on helping people land their dream jobs. You give specific, tailored advice — never generic.

Job: ${jobTitle} at ${company}

Job Description:
${description}

${extra ? `Additional context:\n${extra}\n` : ""}

Your task: ${role}

Format your response clearly with sections and bullet points where helpful. Be specific to this exact job and company.`;
}

export const LANDER_PROMPTS = {
  summarise: (title: string, company: string, desc: string) =>
    buildLanderPrompt(
      "Summarise this job in 3–5 bullet points. Highlight: key responsibilities, required skills, seniority level, and one standout thing about this role or company.",
      title, company, desc
    ),

  interviewQuestions: (title: string, company: string, desc: string) =>
    buildLanderPrompt(
      `Generate 10 likely interview questions for this specific role. Group them into: Technical/Skills Questions, Behavioural Questions, and Culture Fit Questions. For each question, add a brief tip on how to approach the answer.`,
      title, company, desc
    ),

  talkingPoints: (title: string, company: string, desc: string) =>
    buildLanderPrompt(
      `Suggest 6 strong talking points the candidate should weave into their interview. These should highlight the skills and experiences that align most with THIS job. For each talking point, explain why it matters for this specific role.`,
      title, company, desc
    ),

  coverLetter: (title: string, company: string, desc: string, cvText?: string) =>
    buildLanderPrompt(
      `Write a compelling, tailored cover letter for this job. It should be professional yet warm, 3–4 paragraphs, and highlight how the candidate's background matches this specific role. Do not use clichés like "I am writing to apply". Start with a hook.`,
      title, company, desc,
      cvText ? `Candidate CV:\n${cvText}` : undefined
    ),

  cvSuggestions: (title: string, company: string, desc: string, cvText: string) =>
    buildLanderPrompt(
      `Review the candidate's CV and suggest 5–8 specific improvements to better match this job. For each suggestion, explain: (1) what to change, (2) why it matters for this role, (3) an example of how to reword it.`,
      title, company, desc,
      `Candidate CV:\n${cvText}`
    ),

  outreachMessage: (title: string, company: string, desc: string) =>
    buildLanderPrompt(
      `Write a short, compelling LinkedIn message the candidate could send to a recruiter or hiring manager at ${company} about the ${title} role. It should be under 150 words, personalised, and end with a clear call to action. Also write a subject line for an email version.`,
      title, company, desc
    ),

  followUpEmail: (title: string, company: string, interviewDate?: string) =>
    buildLanderPrompt(
      `Write a follow-up email to send after an interview for this role. It should thank the interviewer, briefly reinforce the candidate's enthusiasm and one key selling point, and be under 150 words.`,
      title, company,
      `Role: ${title} at ${company}${interviewDate ? `, interview on ${interviewDate}` : ""}`
    ),

  thankYouEmail: (title: string, company: string) =>
    buildLanderPrompt(
      `Write a warm thank-you email to send after receiving an offer for this role. It should express genuine enthusiasm, confirm interest, and set up a conversation about next steps.`,
      title, company,
      `Role: ${title} at ${company}`
    ),

  recruiterOutreach: (title: string, company: string, desc: string) =>
    buildLanderPrompt(
      `Write 2 versions of a recruiter outreach message: one for LinkedIn (under 100 words) and one as an email (under 200 words). The candidate is proactively reaching out about the ${title} role or similar roles at ${company}.`,
      title, company, desc
    ),
};
