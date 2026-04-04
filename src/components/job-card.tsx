"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Clock } from "lucide-react";
import type { JobModel as Job } from "@/generated/prisma/models";

interface JobCardProps {
  job: Job;
}

const statusColors: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-500",
  published: "bg-blue-500/10 text-blue-500",
  posted: "bg-green-500/10 text-green-500",
};

export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg line-clamp-1">{job.role || "Untitled Role"}</CardTitle>
            <Badge variant="outline" className={statusColors[job.status] || ""}>
              {job.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{job.company || "Unknown Company"}</span>
          </div>
          {job.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
          {job.salary && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{job.salary}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
          {job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {job.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {job.tags.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{job.tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
