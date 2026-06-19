-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SAVED', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('COVER_LETTER', 'FOLLOW_UP_EMAIL', 'THANK_YOU_EMAIL', 'RECRUITER_OUTREACH', 'LINKEDIN_MESSAGE', 'NEGOTIATION_EMAIL');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "description" TEXT,
    "salary" TEXT,
    "jobType" TEXT,
    "source" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'SAVED',
    "notes" TEXT,
    "aiSummary" TEXT,
    "aiInterviewQs" TEXT,
    "aiTalkingPoints" TEXT,
    "aiCoverLetter" TEXT,
    "aiOutreachMessage" TEXT,
    "aiCvSuggestions" TEXT,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
