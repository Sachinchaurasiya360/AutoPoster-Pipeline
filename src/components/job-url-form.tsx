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
import { cn } from "@/lib/utils";
import { Loader2, Link as LinkIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import { scrapeAndCreateJob, createJobFromText } from "@/actions/jobs";

type Mode = "url" | "description";

export function JobUrlForm() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUrlSubmit(e: React.FormEvent) {
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
      const msg = error instanceof Error ? error.message : "Failed to scrape job";
      toast.error(
        `${msg}. Try pasting the job description instead.`
      );
      // Auto-switch to description mode so the user can recover easily.
      setMode("description");
    } finally {
      setLoading(false);
    }
  }

  async function handleDescriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualText.trim()) {
      toast.error("Please paste the job description");
      return;
    }

    setLoading(true);
    try {
      const job = await createJobFromText(
        manualText.trim(),
        manualUrl.trim() || undefined
      );
      toast.success("Job created from description!");
      router.push(`/jobs/${job.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Add Job
        </CardTitle>
        <CardDescription>
          Scrape a job URL automatically, or paste the job description directly
          (useful for sites we can&apos;t scrape like Unstop).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode toggle */}
        <div
          role="tablist"
          aria-label="Input mode"
          className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "url"}
            onClick={() => setMode("url")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              mode === "url"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LinkIcon className="h-4 w-4" />
            Job URL
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "description"}
            onClick={() => setMode("description")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              mode === "description"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            Job Description
          </button>
        </div>

        {mode === "url" ? (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
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
              <p className="text-xs text-muted-foreground">
                Works with LinkedIn, Internshala, Wellfound, Naukri, YC Jobs,
                and most careers pages. For Unstop, use the Description tab.
              </p>
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
        ) : (
          <form onSubmit={handleDescriptionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manualUrl">Source URL (optional)</Label>
              <Input
                id="manualUrl"
                type="url"
                placeholder="https://unstop.com/jobs/..."
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manualText">Job Description</Label>
              <Textarea
                id="manualText"
                rows={12}
                placeholder="Paste the full job description here — company, role, responsibilities, requirements, salary, location, apply link, etc."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                AI will extract company, role, salary, location, tags, and apply
                link from whatever you paste.
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting from description...
                </>
              ) : (
                "Extract from Description"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
