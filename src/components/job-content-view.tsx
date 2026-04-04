"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Copy,
  Download,
  Send,
  RefreshCw,
  FileText,
  FileImage,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { generateContent, sendToTelegram } from "@/actions/jobs";
import type { JobModel as Job } from "@/generated/prisma/models";

interface JobContentViewProps {
  job: Job;
}

export function JobContentView({ job }: JobContentViewProps) {
  const [generating, setGenerating] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [currentJob, setCurrentJob] = useState(job);
  const router = useRouter();

  async function handleGenerate() {
    setGenerating(true);
    try {
      const updated = await generateContent(job.id);
      setCurrentJob(updated);
      toast.success("Content generated!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate content");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSendTelegram() {
    setSendingTelegram(true);
    try {
      await sendToTelegram(job.id);
      toast.success("Sent to Telegram!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send to Telegram");
    } finally {
      setSendingTelegram(false);
    }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  function downloadImage() {
    if (!currentJob.imageUrl) return;
    const a = document.createElement("a");
    a.href = currentJob.imageUrl;
    a.download = `${currentJob.company}-${currentJob.role}-poster.svg`.replace(/\s+/g, "-");
    a.click();
  }

  const hasContent = currentJob.simpleSummary || currentJob.linkedinPost || currentJob.imageUrl;

  return (
    <div className="space-y-6">
      {/* Generate / Regenerate */}
      <div className="flex gap-3">
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating content...
            </>
          ) : hasContent ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate All Content
            </>
          ) : (
            "Generate All Content"
          )}
        </Button>

        {hasContent && (
          <Button
            variant="outline"
            onClick={handleSendTelegram}
            disabled={sendingTelegram}
          >
            {sendingTelegram ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send to Telegram
              </>
            )}
          </Button>
        )}
      </div>

      {generating && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {hasContent && !generating && (
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="gap-2">
              <FileImage className="h-4 w-4" />
              LinkedIn Post
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="h-4 w-4" />

              Poster
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Job Summary</CardTitle>
                {currentJob.simpleSummary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyText(currentJob.simpleSummary!, "Summary")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">
                  {currentJob.simpleSummary || "No summary generated yet"}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="linkedin">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>LinkedIn Post</CardTitle>
                {currentJob.linkedinPost && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyText(currentJob.linkedinPost!, "LinkedIn post")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {currentJob.linkedinPost || "No LinkedIn post generated yet"}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Job Poster</CardTitle>
                {currentJob.imageUrl && (
                  <Button variant="ghost" size="sm" onClick={downloadImage}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {currentJob.imageUrl ? (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentJob.imageUrl}
                      alt="Job poster"
                      className="max-w-full rounded-lg border"
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">No poster generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
