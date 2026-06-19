"use client";
import { useState } from "react";
import { Job, JobStatus } from "@prisma/client";
import { KanbanBoard } from "@/components/kanban-board";
import { AddJobForm } from "@/components/add-job-form";

export function Dashboard({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);

  function addJob(job: Job) {
    setJobs((prev) => [job, ...prev]);
  }

  async function moveJob(jobId: string, newStatus: JobStatus) {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );
    await fetch(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function deleteJob(jobId: string) {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Your Job Tracker</h1>
        <p className="text-slate-500 text-sm">Paste a job URL to add it to your board.</p>
      </div>
      <AddJobForm onJobAdded={addJob} />
      <div className="mt-8">
        <KanbanBoard jobs={jobs} onMove={moveJob} onDelete={deleteJob} />
      </div>
    </div>
  );
}