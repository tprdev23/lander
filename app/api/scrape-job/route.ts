import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildJobFromManualInput } from "@/lib/apify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, title, company, location, description, salary } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid job URL is required." },
        { status: 400 }
      );
    }

    if (!title || !company) {
      return NextResponse.json(
        { error: "Job title and company are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.job.findFirst({
      where: { sourceUrl: url },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This job has already been added to your tracker.", job: existing },
        { status: 409 }
      );
    }

    const scraped = buildJobFromManualInput(url, title, company, location, description, salary);

    const job = await prisma.job.create({
      data: {
        title: scraped.title,
        company: scraped.company,
        location: scraped.location ?? "",
        sourceUrl: url,
        description: scraped.description ?? "",
        salary: scraped.salary,
        source: scraped.source,
        status: "SAVED",
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: unknown) {
    console.error("Save error:", error);
    const message = error instanceof Error ? error.message : "Failed to save job.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}