"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { scrapeAndCreateJob } from "@/actions/jobs";

export function JobUrlForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!url.trim()) {
      toast.error("Please enter a job URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);
    try {
      const job = await scrapeAndCreateJob(url.trim());
      toast.success("Job scraped successfully!");
      router.push(`/jobs/${job.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to scrape job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Add Job URL
        </CardTitle>
        <CardDescription>
          Paste a job URL from LinkedIn, Internshala, Wellfound, Naukri, YC Jobs, or any company careers page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Job URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.linkedin.com/jobs/view/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping job details...
              </>
            ) : (
              "Scrape & Extract"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
