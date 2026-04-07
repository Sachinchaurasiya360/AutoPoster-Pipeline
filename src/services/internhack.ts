"use server";

import type { JobData } from "@/types/job";

const INTERNHACK_API_URL =
  process.env.INTERNHACK_API_URL ||
  "https://www.internhack.xyz/api/external-jobs/ingest";
const INTERNHACK_API_KEY = process.env.INTERNHACK_API_KEY;

interface InternHackResponse {
  success?: boolean;
  message?: string;
  jobUrl?: string;
  job?: {
    id?: number;
    slug?: string;
    company?: string;
    role?: string;
    expiresAt?: string;
  };
  [key: string]: unknown;
}

export async function publishToInternHack(job: JobData): Promise<{
  url: string;
  slug?: string;
  expiresAt?: string;
}> {
  if (!INTERNHACK_API_KEY) throw new Error("INTERNHACK_API_KEY is not set");

  const payload = {
    company: job.company || "",
    role: job.role || "",
    description: job.description || "",
    salary: job.salary || "",
    location: job.location || "",
    applyLink: job.applyLink || "",
    tags: job.tags || [],
  };

  console.log("[internhack] POST", INTERNHACK_API_URL);
  console.log("[internhack] payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(INTERNHACK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": INTERNHACK_API_KEY,
    },
    body: JSON.stringify(payload),
    redirect: "manual",
  });

  console.log("[internhack] status:", response.status, response.statusText);
  console.log(
    "[internhack] response headers:",
    Object.fromEntries(response.headers.entries())
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.log("[internhack] error body:", errorText);
    throw new Error(`InternHack API error: ${response.status} - ${errorText}`);
  }

  const data: InternHackResponse = await response.json();
  console.log("[internhack] success response:", data);

  const url = data.jobUrl || "";
  if (!url) throw new Error("InternHack response missing jobUrl");

  return {
    url,
    slug: data.job?.slug,
    expiresAt: data.job?.expiresAt,
  };
}
