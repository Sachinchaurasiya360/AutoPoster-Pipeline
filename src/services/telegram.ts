"use server";

function getTelegramSettings() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    throw new Error(
      "Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your .env file."
    );
  }
  return { botToken, chatId };
}

// Send a text message to Telegram
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const settings = getTelegramSettings();

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
  const settings = getTelegramSettings();

  // Data URL: parse mime + bytes and upload via multipart
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid data URL for Telegram photo");
    const mimeType = match[1];
    const buffer = Buffer.from(match[2], "base64");

    const isRasterPhoto =
      mimeType === "image/png" ||
      mimeType === "image/jpeg" ||
      mimeType === "image/webp";

    const ext = mimeType.split("/")[1] || "bin";
    const filename = `job-poster.${ext}`;

    const formData = new FormData();
    formData.append("chat_id", settings.chatId);
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");
    // Telegram sendPhoto only supports PNG/JPEG/WebP. SVG must go as document.
    formData.append(
      isRasterPhoto ? "photo" : "document",
      new Blob([buffer], { type: mimeType }),
      filename
    );

    const endpoint = isRasterPhoto ? "sendPhoto" : "sendDocument";
    const response = await fetch(
      `https://api.telegram.org/bot${settings.botToken}/${endpoint}`,
      { method: "POST", body: formData }
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
