import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Secure India Voting Platform",
  description: "Secure, privacy-first digital voting experience for India.",
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
                  SI
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-wide text-(--np-ink)">
                    Secure India Voting
                  </span>
                  <span className="text-xs text-(--np-ink-muted)">
                    National Digital Ballot Initiative
                  </span>
                </div>
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
