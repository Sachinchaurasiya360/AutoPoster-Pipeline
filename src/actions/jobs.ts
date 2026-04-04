"use server";

import { prisma } from "@/lib/prisma";
import { scrapeJobPage } from "@/services/scraper";
import { extractJobData, generateSimpleSummary, generateLinkedInPost, generateJobPoster } from "@/services/ai";
import { publishToInternHack } from "@/services/internhack";
import { sendTelegramMessage, sendTelegramPhoto } from "@/services/telegram";
import type { JobFormData } from "@/types/job";

// Scrape a job URL and create a draft job record
export async function scrapeAndCreateJob(url: string) {
  const rawText = await scrapeJobPage(url);
  const jobData = await extractJobData(rawText, url);

  const job = await prisma.job.create({
    data: {
      sourceUrl: url,
      company: jobData.company,
      role: jobData.role,
      description: jobData.description,
      salary: jobData.salary,
      location: jobData.location,
      applyLink: jobData.applyLink,
      tags: jobData.tags || [],
      status: "draft",
    },
  });

  return job;
}

// Update a job with edited form data
export async function updateJob(id: string, data: JobFormData) {
  const job = await prisma.job.update({
    where: { id },
    data: {
      company: data.company,
      role: data.role,
      description: data.description,
      salary: data.salary || null,
      location: data.location || null,
      applyLink: data.applyLink,
      tags: data.tags || [],
    },
  });

  return job;
}

// Publish job to InternHack
export async function publishJob(id: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id } });

  const internHackUrl = await publishToInternHack({
    company: job.company,
    role: job.role,
    description: job.description,
    salary: job.salary,
    location: job.location,
    applyLink: job.applyLink,
    tags: job.tags,
  });

  const updatedJob = await prisma.job.update({
    where: { id },
    data: {
      internHackUrl,
      status: "published",
    },
  });

  return updatedJob;
}

// Generate all content (summary, LinkedIn post, image)
export async function generateContent(id: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id } });

  const jobData = {
    company: job.company,
    role: job.role,
    description: job.description,
    salary: job.salary,
    location: job.location,
    applyLink: job.applyLink,
    tags: job.tags,
  };

  // Generate all content in parallel
  const [simpleSummary, linkedinPost, imageUrl] = await Promise.all([
    generateSimpleSummary(jobData, job.internHackUrl || undefined),
    generateLinkedInPost(jobData, job.internHackUrl || undefined),
    generateJobPoster(jobData),
  ]);

  const updatedJob = await prisma.job.update({
    where: { id },
    data: {
      simpleSummary,
      linkedinPost,
      imageUrl,
    },
  });

  return updatedJob;
}

// Send job to Telegram
export async function sendToTelegram(id: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id } });

  const caption = job.linkedinPost || job.simpleSummary || `${job.company} - ${job.role}`;

  if (job.imageUrl) {
    await sendTelegramPhoto(job.imageUrl, caption);
  } else {
    await sendTelegramMessage(caption);
  }

  await prisma.job.update({
    where: { id },
    data: { status: "posted" },
  });

  return true;
}

// Get a single job
export async function getJob(id: string) {
  return prisma.job.findUniqueOrThrow({ where: { id } });
}

// Get all jobs
export async function getJobs() {
  return prisma.job.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// Delete a job
export async function deleteJob(id: string) {
  await prisma.job.delete({ where: { id } });
  return true;
}
