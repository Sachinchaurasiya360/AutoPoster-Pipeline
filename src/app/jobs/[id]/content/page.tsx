import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobContentView } from "@/components/job-content-view";
import { LinkButton } from "@/components/link-button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobContentPage({ params }: PageProps) {
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <LinkButton href={`/jobs/${job.id}`} variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Edit
        </LinkButton>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Generated Content</h1>
        <p className="text-muted-foreground mt-1">
          {job.role} at {job.company} — AI-generated summary, LinkedIn post, and poster
        </p>
      </div>

      <JobContentView job={job} />
    </div>
  );
}
