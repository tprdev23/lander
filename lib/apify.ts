export interface ScrapedJob {
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  jobType?: string;
  url?: string;
  source?: string;
}

function detectSource(url: string): string {
  if (url.includes("indeed")) return "Indeed";
  if (url.includes("totaljobs")) return "Totaljobs";
  if (url.includes("glassdoor")) return "Glassdoor";
  if (url.includes("reed")) return "Reed";
  if (url.includes("linkedin")) return "LinkedIn";
  if (url.includes("jobsite")) return "Jobsite";
  if (url.includes("cv-library")) return "CV-Library";
  if (url.includes("monster")) return "Monster";
  return "Other";
}

export function buildJobFromManualInput(
  url: string,
  title: string,
  company: string,
  location: string,
  description: string,
  salary?: string,
): ScrapedJob {
  return {
    title: title.trim() || "Untitled Job",
    company: company.trim() || "Unknown Company",
    location: location.trim() || undefined,
    description: description.trim() || undefined,
    salary: salary?.trim() || undefined,
    source: detectSource(url),
    url,
  };
}