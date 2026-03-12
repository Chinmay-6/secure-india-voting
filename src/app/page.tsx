import Link from "next/link";
import { Shield, Vote, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
      <section className="space-y-6">
        <div className="np-card np-card-muted p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-(--np-ink) text-(--np-white) flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-semibold text-(--np-ink)">
                Secure India Voting Platform
              </h1>
              <p className="text-xs sm:text-sm text-(--np-ink-muted)">
                Aadhaar-backed identity, biometric verification, and privacy-preserving digital ballots.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white/70 border border-(--np-border) p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-(--np-ink-muted)">
                <span className="h-6 w-6 rounded-full bg-(--np-saffron)/15 flex items-center justify-center text-(--np-saffron)">
                  1
                </span>
                Aadhaar and mobile verification
              </div>
              <p className="text-xs text-(--np-ink-muted)">
                Your Aadhaar reference is encrypted and never exposed on the receipt.
              </p>
            </div>
            <div className="rounded-xl bg-white/70 border border-(--np-border) p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-(--np-ink-muted)">
                <span className="h-6 w-6 rounded-full bg-(--np-green)/15 flex items-center justify-center text-(--np-green)">
                  2
                </span>
                Live face verification
              </div>
              <p className="text-xs text-(--np-ink-muted)">
                Biometric liveness checks protect against replay and spoof attempts.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/verify">Start voter verification</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/dashboard">Go to admin portal</Link>
            </Button>
            <div className="np-pill">
              <Vote className="h-3 w-3" />
              One verified citizen, one immutable vote.
            </div>
          </div>
        </div>
      </section>
      <aside className="space-y-4">
        <div className="np-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-(--np-ink-muted)">
              <BarChart3 className="h-4 w-4 text-(--np-green)" />
              Turnout preview
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Sandbox mode
            </span>
          </div>
          <p className="text-xs text-(--np-ink-muted)">
            Connect a live PostgreSQL database and admin dashboard to track authenticated turnout in
            real time.
          </p>
        </div>
      </aside>
    </div>
  );
}
