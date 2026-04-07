import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoPoster Pipeline",
  description: "Scrape jobs, generate content, and post to LinkedIn & Telegram",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const pathname = h.get("x-pathname") || "";
  const isAuthPage = pathname === "/login" || pathname.startsWith("/login/");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex">
        {isAuthPage ? (
          <div className="flex-1">{children}</div>
        ) : (
          <>
            <Sidebar />
            <main className="flex-1 p-8 overflow-auto">{children}</main>
          </>
        )}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
