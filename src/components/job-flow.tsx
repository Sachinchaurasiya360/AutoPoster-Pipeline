"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Link as LinkIcon,
  FileText,
  Plus,
  X,
  Send,
  Copy,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  scrapeJob,
  extractFromText,
  publishAndBroadcast,
} from "@/actions/jobs";
import { jobFormSchema, type JobData, type JobFormData } from "@/types/job";

type InputMode = "url" | "description";

interface PublishResult {
  url: string;
  slug?: string;
  expiresAt?: string;
}

const WHATSAPP_COMMUNITY = "https://chat.whatsapp.com/KiemP3l6QFKHadtfGehpF1";
const TELEGRAM_CHANNEL = "https://t.me/internhack";

function buildSummary(job: JobData, internHackUrl?: string): string {
  const company = job.company || "N/A";
  const role = job.role || "N/A";
  const salary = job.salary || "Not disclosed";
  const place = job.location || "N/A";
  const applyLink = internHackUrl || job.applyLink || "N/A";

  return [
    `Company: ${company}`,
    `Role: ${role}`,
    `Salary: ${salary}`,
    `Place: ${place}`,
    `Applying Link: ${applyLink}`,
    ``,
    `Join our community for more opportunities 🚀`,
    `WhatsApp: ${WHATSAPP_COMMUNITY}`,
    `Telegram: ${TELEGRAM_CHANNEL}`,
  ].join("\n");
}

export function JobFlow() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  function reset() {
    setJobData(null);
    setSourceUrl("");
    setPublishResult(null);
  }

  if (!jobData) {
    return (
      <ExtractStep
        onExtracted={(data, url) => {
          setJobData(data);
          setSourceUrl(url);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Source: <span className="font-mono">{sourceUrl}</span>
        </p>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Start over
        </Button>
      </div>

      <EditStep
        jobData={jobData}
        publishResult={publishResult}
        onChange={setJobData}
        onPublished={setPublishResult}
      />

      {publishResult && (
        <ResultView jobData={jobData} internHackUrl={publishResult.url} />
      )}
    </div>
  );
}

function ExtractStep({
  onExtracted,
}: {
  onExtracted: (data: JobData, sourceUrl: string) => void;
}) {
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [loading, setLoading] = useState(false);

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
      const data = await scrapeJob(url.trim());
      toast.success("Job scraped successfully!");
      onExtracted(data, url.trim());
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to scrape job";
      toast.error(`${msg}. Try pasting the job description instead.`);
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
      const src = manualUrl.trim() || "manual";
      const data = await extractFromText(manualText.trim(), src);
      toast.success("Job created from description!");
      onExtracted(data, src);
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

function EditStep({
  jobData,
  publishResult,
  onChange,
  onPublished,
}: {
  jobData: JobData;
  publishResult: PublishResult | null;
  onChange: (next: JobData) => void;
  onPublished: (result: PublishResult) => void;
}) {
  const [tags, setTags] = useState<string[]>(jobData.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [publishing, setPublishing] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      company: jobData.company || "",
      role: jobData.role || "",
      description: jobData.description || "",
      salary: jobData.salary || "",
      location: jobData.location || "",
      applyLink: jobData.applyLink || "",
      tags: jobData.tags || [],
    },
  });

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  function toJobData(form: JobFormData): JobData {
    return {
      company: form.company || null,
      role: form.role || null,
      description: form.description || null,
      salary: form.salary || null,
      location: form.location || null,
      applyLink: form.applyLink || null,
      tags,
    };
  }

  async function onSubmit(data: JobFormData) {
    onChange(toJobData(data));
    toast.success("Job updated!");
  }

  async function handlePublish() {
    const current = toJobData(getValues());
    onChange(current);

    setPublishing(true);
    try {
      // Build summary client-side, then server does: publish + telegram in one shot.
      const caption = buildSummary(current);
      const { publishResult: result } = await publishAndBroadcast(current, caption);

      const expires = result.expiresAt
        ? new Date(result.expiresAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : null;

      toast.success("Published & sent to Telegram 🎉", {
        description: (
          <div className="space-y-1 text-xs">
            {result.slug && (
              <div>
                <span className="font-medium">Slug:</span> {result.slug}
              </div>
            )}
            {expires && (
              <div>
                <span className="font-medium">Expires:</span> {expires}
              </div>
            )}
          </div>
        ),
        action: {
          label: "Open",
          onClick: () => window.open(result.url, "_blank"),
        },
        duration: 8000,
      });
      onPublished(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register("company")} />
                {errors.company && (
                  <p className="text-sm text-red-500">{errors.company.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" {...register("role")} />
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input id="salary" {...register("salary")} placeholder="e.g., 50k/month" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="applyLink">Apply Link</Label>
              <Input id="applyLink" type="url" {...register("applyLink")} />
              {errors.applyLink && (
                <p className="text-sm text-red-500">{errors.applyLink.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} {...register("description")} />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Publishing will also send the job to Telegram automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing & sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publish to InternHack
              </>
            )}
          </Button>

          {publishResult?.url && (
            <LinkButton href={publishResult.url} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open InternHack
            </LinkButton>
          )}

          {jobData.applyLink && (
            <LinkButton href={jobData.applyLink} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Apply Link
            </LinkButton>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function ResultView({
  jobData,
  internHackUrl,
}: {
  jobData: JobData;
  internHackUrl: string;
}) {
  const summary = buildSummary(jobData, internHackUrl);

  function copySummary() {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Posted to Telegram
          </CardTitle>
          <CardDescription>This is what was sent.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={copySummary}>
          <Copy className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">
          {summary}
        </pre>
      </CardContent>
    </Card>
  );
}
