"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { scrapeAndCreateJob, createJobFromText } from "@/actions/jobs";

export function JobUrlForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [manualLoading, setManualLoading] = useState(false);
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
    setScrapeError(null);
    try {
      const job = await scrapeAndCreateJob(url.trim());
      toast.success("Job scraped successfully!");
      router.push(`/jobs/${job.id}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to scrape job";
      toast.error(msg);
      setScrapeError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualText.trim()) {
      toast.error("Please paste the job description");
      return;
    }

    setManualLoading(true);
    try {
      const job = await createJobFromText(manualText.trim(), url.trim() || undefined);
      toast.success("Job created from description!");
      router.push(`/jobs/${job.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create job");
    } finally {
      setManualLoading(false);
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
      <CardContent className="space-y-6">
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

        {scrapeError && (
          <div className="space-y-3 rounded-lg border border-amber-300/40 bg-amber-50/50 p-4 dark:border-amber-500/30 dark:bg-amber-950/20">
            <div className="flex items-start gap-2 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">
                  Couldn&apos;t scrape that URL
                </p>
                <p className="text-amber-800/80 dark:text-amber-300/80">
                  {scrapeError}
                </p>
                <p className="mt-1 text-amber-800/80 dark:text-amber-300/80">
                  Paste the job description below and we&apos;ll extract the
                  details with AI instead.
                </p>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="manualText">Job Description</Label>
                <Textarea
                  id="manualText"
                  rows={10}
                  placeholder="Paste the full job description here — company, role, responsibilities, requirements, salary, location, apply link, etc."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  disabled={manualLoading}
                />
              </div>
              <Button
                type="submit"
                disabled={manualLoading}
                className="w-full"
              >
                {manualLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extracting from description...
                  </>
                ) : (
                  "Extract from Description"
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
