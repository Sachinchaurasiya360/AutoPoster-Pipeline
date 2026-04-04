"use server";

import { prisma } from "@/lib/prisma";

async function getTelegramSettings() {
  const settings = await prisma.telegramSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (!settings) {
    throw new Error("Telegram settings not configured. Go to Settings to set up your bot.");
  }
  return settings;
}

// Send a text message to Telegram
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const settings = await getTelegramSettings();

  const response = await fetch(
    `https://api.telegram.org/bot${settings.botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }

  return true;
}

// Send a photo with caption to Telegram
export async function sendTelegramPhoto(
  imageUrl: string,
  caption: string
): Promise<boolean> {
  const settings = await getTelegramSettings();

  // If it's a data URL (SVG), we need to send as document or convert
  if (imageUrl.startsWith("data:")) {
    // Extract base64 data and send as document
    const base64Data = imageUrl.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");

    const formData = new FormData();
    formData.append("chat_id", settings.chatId);
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");
    formData.append(
      "document",
      new Blob([buffer], { type: "image/svg+xml" }),
      "job-poster.svg"
    );

    const response = await fetch(
      `https://api.telegram.org/bot${settings.botToken}/sendDocument`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${error}`);
    }

    return true;
  }

  // Regular URL image
  const response = await fetch(
    `https://api.telegram.org/bot${settings.botToken}/sendPhoto`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.chatId,
        photo: imageUrl,
        caption,
        parse_mode: "HTML",
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram API error: ${error}`);
  }

  return true;
}
