"use client";
import { Job, JobStatus } from "@prisma/client";
import { JobCard } from "@/components/job-card";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";

const COLUMNS: { id: JobStatus; label: string; color: string; empty: string }[] = [
  { id: "SAVED",     label: "Saved",     color: "bg-slate-100 text-slate-700",     empty: "Paste a job URL above to get started" },
  { id: "APPLIED",   label: "Applied",   color: "bg-blue-100 text-blue-700",       empty: "Jobs you've applied to" },
  { id: "INTERVIEW", label: "Interview", color: "bg-violet-100 text-violet-700",   empty: "Fingers crossed!" },
  { id: "OFFER",     label: "Offer",     color: "bg-emerald-100 text-emerald-700", empty: "Offers will show here" },
  { id: "REJECTED",  label: "Rejected",  color: "bg-red-100 text-red-600",         empty: "Don't give up!" },
];

interface Props {
  jobs: Job[];
  onMove: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
}

export function KanbanBoard({ jobs, onMove, onDelete }: Props) {
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const job = jobs.find((j) => j.id === event.active.id);
    if (job) setActiveJob(job);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveJob(null);
    if (!over) return;

    const jobId = active.id as string;
    const overId = over.id as string;

    const column = COLUMNS.find((c) => c.id === overId);
    if (column) {
      onMove(jobId, column.id);
      return;
    }

    const overJob = jobs.find((j) => j.id === overId);
    const draggedJob = jobs.find((j) => j.id === jobId);
    if (overJob && draggedJob && overJob.status !== draggedJob.status) {
      onMove(jobId, overJob.status);
    }
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {COLUMNS.map((col) => {
          const count = jobs.filter((j) => j.status === col.id).length;
          return (
            <div key={col.id} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{col.label}</p>
            </div>
          );
        })}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-5 gap-4">
          {COLUMNS.map((col) => {
            const colJobs = jobs.filter((j) => j.status === col.id);
            return (
              <DroppableColumn
                key={col.id}
                col={col}
                jobs={colJobs}
                onMove={onMove}
                onDelete={onDelete}
                allColumns={COLUMNS}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeJob && (
            <div className="bg-white border-2 border-indigo-400 rounded-xl p-4 shadow-xl rotate-1">
              <p className="font-semibold text-slate-900 text-sm">{activeJob.title}</p>
              <p className="text-xs text-slate-500 mt-1">{activeJob.company}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function DroppableColumn({
  col, jobs, onMove, onDelete, allColumns,
}: {
  col: (typeof COLUMNS)[0];
  jobs: Job[];
  onMove: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
  allColumns: (typeof COLUMNS);
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <div className="flex flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${col.color}`}>
          {col.label}
        </span>
        <span className="text-xs text-slate-400 font-medium">{jobs.length}</span>
      </div>

      {/* Droppable area — full height */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 min-h-[500px] rounded-xl p-2 transition-all ${
          isOver
            ? "bg-indigo-50 ring-2 ring-indigo-300"
            : "bg-slate-50/50"
        }`}
      >
        <SortableContext
          items={jobs.map((j) => j.id)}
          strategy={verticalListSortingStrategy}
        >
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onMove={onMove}
              onDelete={onDelete}
              columns={allColumns}
            />
          ))}
          {jobs.length === 0 && (
            <div className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 border-dashed transition-colors ${
              isOver ? "border-indigo-300" : "border-slate-200"
            }`}>
              <p className="text-xs text-slate-400 text-center">{col.empty}</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}