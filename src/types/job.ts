import { z } from "zod/v4";

export const jobDataSchema = z.object({
  company: z.string().nullable(),
  role: z.string().nullable(),
  description: z.string().nullable(),
  salary: z.string().nullable(),
  location: z.string().nullable(),
  applyLink: z.string().url().nullable(),
  tags: z.array(z.string()).default([]),
});

export type JobData = z.infer<typeof jobDataSchema>;

export const jobFormSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  description: z.string().min(1, "Description is required"),
  salary: z.string(),
  location: z.string(),
  applyLink: z.string().url("Must be a valid URL"),
  tags: z.array(z.string()),
});

export type JobFormData = z.infer<typeof jobFormSchema>;

export const telegramSettingsSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
  chatId: z.string().min(1, "Chat ID is required"),
});

export type TelegramSettingsData = z.infer<typeof telegramSettingsSchema>;
