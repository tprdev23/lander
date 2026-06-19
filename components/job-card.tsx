"use client";
import { Job, JobStatus } from "@prisma/client";
import { Building2, MapPin, Trash2 } from "lucide-react";
import { useState, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

interface Props {
  job: Job;
  onMove: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
  columns: { id: JobStatus; label: string }[];
}

const SOURCE_COLORS: Record<string, string> = {
  Indeed:    "bg-blue-50 text-blue-700",
  LinkedIn:  "bg-sky-50 text-sky-700",
  Totaljobs: "bg-orange-50 text-orange-700",
  Reed:      "bg-red-50 text-red-700",
  Glassdoor: "bg-green-50 text-green-700",
  Other:     "bg-slate-50 text-slate-600",
};

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ job, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const clickTime = useRef(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
    onDelete(job.id);
  }

  const sourceColor = SOURCE_COLORS[job.source ?? ""] ?? SOURCE_COLORS.Other;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={() => { clickTime.current = Date.now(); }}
      onMouseUp={() => {
        const elapsed = Date.now() - clickTime.current;
        if (elapsed < 200) {
          router.push(`/jobs/${job.id}`);
        }
      }}
      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all group cursor-grab active:cursor-grabbing select-none"
    >
      {/* Source + date */}
      <div className="flex items-center justify-between mb-2">
        {job.source ? (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sourceColor}`}>
            {job.source}
          </span>
        ) : <span />}
        <span className="text-[10px] text-slate-400">
          {timeAgo(job.createdAt)}
        </span>
      </div>

      {/* Job info */}
      <div className="mb-3">
        <p className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {job.title}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
          <p className="text-xs text-slate-500 truncate">{job.company}</p>
        </div>
        {job.location && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-400 truncate">{job.location}</p>
          </div>
        )}
        {job.salary && (
          <p className="text-xs font-medium text-emerald-600 mt-1.5">
            {job.salary}
          </p>
        )}
      </div>

      {/* Delete button */}
      <div className="flex items-center justify-end pt-2 border-t border-slate-100">
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onClick={handleDelete}
          className={`flex items-center gap-1 text-[10px] transition-colors ${
            confirming
              ? "text-red-500 font-medium"
              : "text-slate-300 hover:text-red-400"
          }`}
        >
          <Trash2 className="w-3 h-3" />
          {confirming ? "Tap again to delete" : ""}
        </button>
      </div>
    </div>
  );
}