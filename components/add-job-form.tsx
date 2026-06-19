"use client";
import { useState } from "react";
import { Job } from "@prisma/client";
import { Loader2, Plus, Sparkles } from "lucide-react";

export function AddJobForm({ onJobAdded }: { onJobAdded: (job: Job) => void }) {
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function extractDetails() {
    if (!rawText.trim()) return;
    setExtracting(true);
    setError("");

    try {
      const res = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText.trim(), url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");

      setTitle(data.title || "");
      setCompany(data.company || "");
      setLocation(data.location || "");
      setSalary(data.salary || "");
      setDescription(data.description || rawText.trim());
      setExtracted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not extract job details");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !title.trim() || !company.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/scrape-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          description: description.trim(),
          salary: salary.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add job");

      onJobAdded(data.job);
      setSuccess(`✓ "${data.job.title}" at ${data.job.company} added!`);
      setUrl("");
      setRawText("");
      setTitle("");
      setCompany("");
      setLocation("");
      setSalary("");
      setDescription("");
      setExtracted(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Step 1 — Paste the job URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://uk.indeed.com/viewjob?jk=..."
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1.5">
          Step 2 — Paste the full job description (select all text on the job page, paste here)
        </label>
        <textarea
          value={rawText}
          onChange={(e) => { setRawText(e.target.value); setExtracted(false); }}
          placeholder="Paste everything from the job posting — title, company, description, requirements, salary…"
          className="w-full h-36 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          disabled={loading}
        />
        <button
          type="button"
          onClick={extractDetails}
          disabled={!rawText.trim() || extracting || loading}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {extracting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Extracting details…</>
            : <><Sparkles className="w-4 h-4" /> Extract job details with AI</>
          }
        </button>
      </div>

      {extracted && (
        <div className="border border-indigo-100 bg-indigo-50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-700 mb-2">
            ✓ Details extracted — check and edit if needed
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Job title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Salary</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={loading || !title.trim() || !company.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Plus className="w-4 h-4" /> Add to tracker</>
              }
            </button>
          </form>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}
    </div>
  );
}