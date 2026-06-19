import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { JobDetail } from "@/components/job-detail";

export const dynamic = "force-dynamic";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();
  return <JobDetail job={job} />;
}