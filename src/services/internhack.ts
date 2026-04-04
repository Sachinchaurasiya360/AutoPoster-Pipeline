"use server";

import type { JobData } from "@/types/job";

const INTERNHACK_API_URL = "https://www.internhack.xyz/api/external-jobs/ingest";
const INTERNHACK_API_KEY = "hiiiamsachin";

interface InternHackResponse {
  url?: string;
  id?: string;
  [key: string]: unknown;
}

export async function publishToInternHack(job: JobData): Promise<string> {
  const payload = {
    company: job.company || "",
    role: job.role || "",
    description: job.description || "",
    salary: job.salary || "",
    location: job.location || "",
    applyLink: job.applyLink || "",
    tags: job.tags || [],
  };

  const response = await fetch(INTERNHACK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": INTERNHACK_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`InternHack API error: ${response.status} - ${errorText}`);
  }

  const data: InternHackResponse = await response.json();

  // Try to extract the URL from the response
  return data.url || data.id || JSON.stringify(data);
}
