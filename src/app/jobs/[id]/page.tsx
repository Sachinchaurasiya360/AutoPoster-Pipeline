import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobEditForm } from "@/components/job-edit-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobEditPage({ params }: PageProps) {
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            {job.role || "Untitled"} {job.company ? `at ${job.company}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Source: {job.sourceUrl}
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          {job.status}
        </Badge>
      </div>
      <JobEditForm job={job} />
    </div>
  );
}
