"use server";

import type { JobData } from "@/types/job";

const OPENROUTER_MODEL = "google/gemini-2.5-flash";

async function openRouterChat(prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${body}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

// Extract structured job data from raw scraped text.
// This is the only remaining AI call in the pipeline.
export async function extractJobData(rawText: string, sourceUrl: string): Promise<JobData> {
  const prompt = `You are a job data extraction assistant. Extract structured job information from the following scraped webpage text.

Source URL: ${sourceUrl}

Scraped text:
${rawText}

Return a JSON object with exactly these fields:
- company: string or null (the hiring company name)
- role: string or null (the job title/role)
- description: string or null (brief description of the role, 2-3 sentences max)
- salary: string or null (compensation info if available)
- location: string or null (job location)
- applyLink: string or null (direct application URL, use "${sourceUrl}" if no specific apply link found)
- tags: string[] (relevant skills, technologies, and tags like "Remote", "Internship", etc.)

Return ONLY valid JSON, no markdown formatting, no code blocks.`;

  const text = await openRouterChat(prompt);

  const cleaned = text.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      company: null,
      role: null,
      description: null,
      salary: null,
      location: null,
      applyLink: sourceUrl,
      tags: [],
    };
  }
}
