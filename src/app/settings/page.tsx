import { prisma } from "@/lib/prisma";
import { TelegramSettingsForm } from "@/components/telegram-settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await prisma.telegramSettings.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Telegram Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your Telegram bot for sending job posts
        </p>
      </div>
      <TelegramSettingsForm
        initialData={
          settings
            ? { botToken: settings.botToken, chatId: settings.chatId }
            : null
        }
      />
    </div>
  );
}
