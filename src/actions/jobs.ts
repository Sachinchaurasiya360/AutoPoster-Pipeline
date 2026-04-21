"use server";

import { scrapeJobPage } from "@/services/scraper";
import { extractJobData } from "@/services/ai";
import { publishToInternHack } from "@/services/internhack";
import { sendTelegramMessage } from "@/services/telegram";
import type { JobData } from "@/types/job";

// Scrape a job URL and return extracted data (no persistence).
export async function scrapeJob(url: string): Promise<JobData> {
  const rawText = await scrapeJobPage(url);
  return extractJobData(rawText, url);
}

// Extract job data from a pasted description (no persistence).
export async function extractFromText(rawText: string, sourceUrl?: string): Promise<JobData> {
  const url = sourceUrl?.trim() || "manual";
  return extractJobData(rawText, url);
}

// One-shot publish: push to InternHack, then send the summary text to Telegram.
export async function publishAndBroadcast(job: JobData, caption: string) {
  const publishResult = await publishToInternHack(job);
  await sendTelegramMessage(caption);
  return { publishResult };
}
