"use client";
import { Job } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2, Copy, Check } from "lucide-react";
import Link from "next/link";

const COACH_ACTIONS = [
  { key: "summarise",          label: "Summarise this role" },
  { key: "interviewQuestions", label: "Interview questions" },
  { key: "talkingPoints",      label: "Talking points" },
  { key: "coverLetter",        label: "Cover letter" },
  { key: "cvSuggestions",      label: "CV suggestions" },
  { key: "outreachMessage",    label: "Recruiter outreach" },
];

export function JobDetail({ job }: { job: Job }) {
  const router = useRouter();
  const [notes, setNotes] = useState(job.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function saveNotes() {
    setSavingNotes(true);
    await fetch(`/api/jobs/${job.id}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(false);
    router.refresh();
  }

  async function runCoach(action: string) {
    setActiveAction(action);
    setLoading(true);
    setAiResult("");
    try {
      const res = await fetch(`/api/jobs/${job.id}/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, cvText }),
      });
      const data = await res.json();
      setAiResult(data.reply ?? data.error ?? "No response");
    } catch {
      setAiResult("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
            <p className="text-slate-600 mt-0.5">{job.company}{job.location ? ` · ${job.location}` : ""}</p>
            {job.salary && <p className="text-sm text-emerald-600 mt-1">{job.salary}</p>}
          </div>
          {job.sourceUrl && (
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors shrink-0">
              View original <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {job.description && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 mb-2">Job Description</h2>
            <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
              {job.description}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Your Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this job, contacts, deadlines…"
          className="w-full h-28 text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <button onClick={saveNotes} disabled={savingNotes}
          className="mt-2 px-4 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors">
          {savingNotes ? "Saving…" : "Save notes"}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-700 font-bold text-sm">L</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Lander</p>
            <p className="text-xs text-slate-500">Your AI job coach</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {COACH_ACTIONS.map((a) => (
            <button key={a.key} onClick={() => runCoach(a.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeAction === a.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
              }`}>
              {a.label}
            </button>
          ))}
        </div>

        {(activeAction === "coverLetter" || activeAction === "cvSuggestions") && (
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your CV / resume text here for personalised suggestions…"
            className="w-full h-28 text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
          />
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Lander is thinking…
          </div>
        )}

        {aiResult && !loading && (
          <div className="mt-2">
            <div className="flex justify-end mb-2">
              <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto border border-slate-200">
              {aiResult}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}