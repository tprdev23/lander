import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { notes } = await req.json();
  const job = await prisma.job.update({
    where: { id },
    data: { notes },
  });
  return NextResponse.json({ job });
}