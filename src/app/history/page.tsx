import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/job-card";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job History</h1>
        <p className="text-muted-foreground mt-1">
          All processed jobs ({jobs.length} total)
        </p>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No jobs processed yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
