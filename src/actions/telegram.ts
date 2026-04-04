"use server";

import { prisma } from "@/lib/prisma";
import type { TelegramSettingsData } from "@/types/job";

export async function saveTelegramSettings(data: TelegramSettingsData) {
  // Upsert: update existing or create new
  const existing = await prisma.telegramSettings.findFirst();

  if (existing) {
    return prisma.telegramSettings.update({
      where: { id: existing.id },
      data: {
        botToken: data.botToken,
        chatId: data.chatId,
      },
    });
  }

  return prisma.telegramSettings.create({
    data: {
      botToken: data.botToken,
      chatId: data.chatId,
    },
  });
}

export async function getTelegramSettings() {
  return prisma.telegramSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });
}
