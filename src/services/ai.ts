"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobData } from "@/types/job";

const WHATSAPP_COMMUNITY = "https://chat.whatsapp.com/KiemP3l6QFKHadtfGehpF1";
const TELEGRAM_CHANNEL = "https://t.me/internhack";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

// Extract structured job data from raw scraped text
export async function extractJobData(rawText: string, sourceUrl: string): Promise<JobData> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Clean potential markdown code blocks
  const cleaned = text.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // If parsing fails, return a minimal structure
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

// Generate a simplified professional summary
export async function generateSimpleSummary(
  job: JobData,
  internHackUrl?: string
): Promise<string> {
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

// LinkedIn post — same content as the simple summary
export async function generateLinkedInPost(
  job: JobData,
  internHackUrl?: string
): Promise<string> {
  return generateSimpleSummary(job, internHackUrl);
}

// Generate a job poster as an SVG via Gemini text model
export async function generateJobPoster(job: JobData): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Create an SVG image (1200x628 pixels, LinkedIn post dimensions) for a job posting poster.

Design requirements:
- Dark background (use #0f172a or similar dark blue/navy)
- Modern startup/tech aesthetic
- Clean typography using system fonts
- Minimal but visually appealing

Content to include:
- Company: ${job.company || "Company"}
- Role: ${job.role || "Open Position"}
- Location: ${job.location || ""}
- "Apply Now" call-to-action button style element
- "InternHack" branding text at bottom
- "InternHack" logo text at top-right corner

Use colors: primary #3b82f6 (blue), accent #10b981 (green), text white.
Add subtle gradient backgrounds, rounded rectangles, and clean spacing.

Return ONLY the raw SVG code starting with <svg and ending with </svg>. No markdown, no explanation.`;

  const result = await model.generateContent(prompt);
  let svgText = result.response.text().trim();

  svgText = svgText.replace(/```svg?\n?/g, "").replace(/```\n?/g, "").trim();

  if (!svgText.startsWith("<svg")) {
    const svgStart = svgText.indexOf("<svg");
    if (svgStart !== -1) svgText = svgText.slice(svgStart);
  }

  const base64 = Buffer.from(svgText).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
