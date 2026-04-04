"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JobData } from "@/types/job";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(apiKey);
}

// Extract structured job data from raw scraped text
export async function extractJobData(rawText: string, sourceUrl: string): Promise<JobData> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
export async function generateSimpleSummary(job: JobData, internHackUrl?: string): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Generate a clean, simplified job summary in plain professional language.

Job details:
- Company: ${job.company || "N/A"}
- Role: ${job.role || "N/A"}
- Salary: ${job.salary || "Not disclosed"}
- Location: ${job.location || "N/A"}
- Skills: ${job.tags?.join(", ") || "N/A"}
- Apply Link: ${internHackUrl || job.applyLink || "N/A"}
- Description: ${job.description || "N/A"}

Format it as a bullet-point summary like:
• Company: ...
• Role: ...
• Salary: ...
• Location: ...
• Skills: ...
• Apply Link: ...
• Important Details: ...

Keep it clean, simple, and professional. Return only the summary text.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// Generate a LinkedIn-ready post
export async function generateLinkedInPost(job: JobData, internHackUrl?: string): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const applyUrl = internHackUrl || job.applyLink || "";

  const prompt = `Generate a professional LinkedIn post for a job opportunity. Use this exact format and style:

"${job.company || "A company"} is hiring for ${job.role || "a role"}${job.location ? " in " + job.location : ""}.

${job.salary ? "Salary: " + job.salary + "\n" : ""}Skills: ${job.tags?.join(", ") || "Various skills"}

${job.description ? job.description : "Great opportunity for students and freshers."}

Apply here: ${applyUrl}

For more jobs, interview preparation, open-source opportunities, and skill-building resources, join InternHack.

WhatsApp Community:
https://chat.whatsapp.com/KiemP3l6QFKHadtfGehpF1"

Make it engaging but professional. Keep the InternHack branding and WhatsApp link exactly as shown. Return only the post text, no quotes around it.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// Generate a job poster image using Gemini
export async function generateJobPoster(job: JobData): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Generate an SVG-based poster since Gemini flash can't generate images directly
  // We'll create a detailed SVG that can be rendered as an image
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

  // Clean any markdown wrapping
  svgText = svgText.replace(/```svg?\n?/g, "").replace(/```\n?/g, "").trim();

  // Ensure it starts with <svg
  if (!svgText.startsWith("<svg")) {
    const svgStart = svgText.indexOf("<svg");
    if (svgStart !== -1) {
      svgText = svgText.slice(svgStart);
    }
  }

  // Convert SVG to data URL for display
  const base64 = Buffer.from(svgText).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
