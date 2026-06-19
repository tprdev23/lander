import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const job = await prisma.job.create({
    data: {
      title: "Junior Developer",
      company: "Acme Corp",
      location: "Remote",
      sourceUrl: "https://example.com/job/junior-dev",
    },
  });

  return NextResponse.json(job);
}
