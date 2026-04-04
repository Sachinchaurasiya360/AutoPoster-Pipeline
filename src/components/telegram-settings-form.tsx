"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { saveTelegramSettings } from "@/actions/telegram";
import { telegramSettingsSchema, type TelegramSettingsData } from "@/types/job";

interface TelegramSettingsFormProps {
  initialData?: { botToken: string; chatId: string } | null;
}

export function TelegramSettingsForm({ initialData }: TelegramSettingsFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TelegramSettingsData>({
    resolver: zodResolver(telegramSettingsSchema),
    defaultValues: {
      botToken: initialData?.botToken || "",
      chatId: initialData?.chatId || "",
    },
  });

  async function onSubmit(data: TelegramSettingsData) {
    try {
      await saveTelegramSettings(data);
      toast.success("Telegram settings saved!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Telegram Bot Settings</CardTitle>
          <CardDescription>
            Configure your Telegram bot to send job posts to a channel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="botToken">Bot Token</Label>
              <Input
                id="botToken"
                type="password"
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                {...register("botToken")}
              />
              {errors.botToken && (
                <p className="text-sm text-red-500">{errors.botToken.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="chatId">Channel / Chat ID</Label>
              <Input
                id="chatId"
                placeholder="@mychannel or -1001234567890"
                {...register("chatId")}
              />
              {errors.chatId && (
                <p className="text-sm text-red-500">{errors.chatId.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Setup guide */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <ol className="space-y-3 text-sm">
            <li>
              <strong>Create a bot:</strong> Open Telegram, search for{" "}
              <code>@BotFather</code>, and send <code>/newbot</code>. Follow the prompts to
              get your bot token.
            </li>
            <li>
              <strong>Copy the bot token:</strong> BotFather will give you a token like{" "}
              <code>123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</code>. Paste it above.
            </li>
            <li>
              <strong>Create a channel:</strong> Create a new Telegram channel (or use an
              existing one).
            </li>
            <li>
              <strong>Add the bot as admin:</strong> Go to channel settings &rarr; Administrators
              &rarr; Add your bot. Give it permission to post messages.
            </li>
            <li>
              <strong>Get the channel ID:</strong> For public channels, use{" "}
              <code>@channelname</code>. For private channels, forward a message from the
              channel to <code>@userinfobot</code> to get the numeric ID.
            </li>
            <li>
              <strong>Save:</strong> Enter the token and channel ID above and click Save.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
