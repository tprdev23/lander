"use client";
import { useState, useEffect } from "react";
import { Job } from "@prisma/client";
import { Loader2, Copy, Check } from "lucide-react";

const DOC_TYPES = [
  { key: "coverLetter",       label: "Cover Letter" },
  { key: "followUpEmail",     label: "Follow-up Email" },
  { key: "thankYouEmail",     label: "Thank-you Email" },
  { key: "recruiterOutreach", label: "Recruiter Outreach" },
  { key: "outreachMessage",   label: "LinkedIn Message" },
];

export default function DocumentsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [docType, setDocType] = useState("coverLetter");
  const [cvText, setCvText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/jobs").then((r) => r.json()).then((d) => setJobs(d.jobs ?? []));
  }, []);

  async function generate() {
    if (!selectedJob) return;
    setLoading(true);
    setResult("");
    const res = await fetch(`/api/jobs/${selectedJob}/coach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: docType, cvText }),
    });
    const data = await res.json();
    setResult(data.reply ?? data.error ?? "No response");
    setLoading(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Documents & Templates</h1>
        <p className="text-slate-500 text-sm">Generate tailored documents for any job in your tracker.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Select a job</label>
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">— Choose a job —</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} at {j.company}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Document type</label>
          <div className="flex flex-wrap gap-2">
            {DOC_TYPES.map((d) => (
              <button key={d.key} onClick={() => setDocType(d.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  docType === d.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {docType === "coverLetter" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Your CV <span className="text-slate-400 font-normal">(optional, paste text)</span>
            </label>
            <textarea value={cvText} onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text here for a more personalised result…"
              className="w-full h-28 text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
        )}

        <button onClick={generate} disabled={!selectedJob || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Generating…" : "Generate with Lander"}
        </button>
      </div>

      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Generated document</p>
            <button onClick={copy} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}