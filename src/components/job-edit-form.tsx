"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/link-button";
import { Loader2, Plus, X, Send, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { updateJob, publishJob } from "@/actions/jobs";
import { jobFormSchema, type JobFormData } from "@/types/job";
import type { JobModel as Job } from "@/generated/prisma/models";

interface JobEditFormProps {
  job: Job;
}

export function JobEditForm({ job }: JobEditFormProps) {
  const [tags, setTags] = useState<string[]>(job.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [publishing, setPublishing] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      company: job.company || "",
      role: job.role || "",
      description: job.description || "",
      salary: job.salary || "",
      location: job.location || "",
      applyLink: job.applyLink || "",
      tags: job.tags || [],
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

  async function onSubmit(data: JobFormData) {
    try {
      await updateJob(job.id, { ...data, tags });
      toast.success("Job updated successfully!");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update job");
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const updated = await publishJob(job.id);
      toast.success("Published to InternHack!");
      if (updated.internHackUrl) {
        toast.info(`InternHack URL: ${updated.internHackUrl}`);
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  }

  function copyJson() {
    const json = JSON.stringify(
      {
        company: job.company,
        role: job.role,
        description: job.description,
        salary: job.salary,
        location: job.location,
        applyLink: job.applyLink,
        tags,
      },
      null,
      2
    );
    navigator.clipboard.writeText(json);
    toast.success("JSON copied to clipboard");
  }

  return (
    <div className="space-y-6">
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
              <Textarea
                id="description"
                rows={4}
                {...register("description")}
              />
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>

              <Button type="button" variant="outline" onClick={copyJson}>
                <Copy className="mr-2 h-4 w-4" />
                Copy JSON
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publish to InternHack
              </>
            )}
          </Button>

          {job.internHackUrl && (
            <LinkButton href={job.internHackUrl} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open InternHack
            </LinkButton>
          )}

          {job.applyLink && (
            <LinkButton href={job.applyLink} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Apply Link
            </LinkButton>
          )}

          <Button
            variant="secondary"
            onClick={() => router.push(`/jobs/${job.id}/content`)}
          >
            Generate Content
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
