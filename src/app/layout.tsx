import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VOTEXA - Blockchain voting system",
  description: "VOTEXA is a secure, blockchain-powered digital voting system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-(--np-saffron-soft)`}
      >
        <div className="min-h-screen bg-(--np-background) text-(--np-ink)">
          <header className="border-b border-(--np-border) bg-linear-to-r from-(--np-saffron) via-(--np-white) to-(--np-green)">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--np-ink)/90 text-(--np-white) text-sm font-semibold">
                  VX
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-wide text-(--np-ink)">
                    VOTEXA
                  </span>
                  <span className="text-xs text-(--np-ink-muted)">
                    Blockchain voting system
                  </span>
                </div>
              </div>
              <nav className="hidden sm:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">Home</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/register">Register</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/verify">Verify</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/dashboard">Admin</Link>
                </Button>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
