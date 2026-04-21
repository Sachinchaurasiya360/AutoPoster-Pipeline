import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { PlusCircle, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Scrape a job, edit the details, generate content, and post to Telegram — in one pass.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Ready to post a new job?
          </CardTitle>
          <CardDescription>
            Jobs aren&apos;t stored — each run is a one-shot pipeline from URL to Telegram.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkButton href="/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Job
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
