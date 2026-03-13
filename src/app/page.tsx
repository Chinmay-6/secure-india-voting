import Link from "next/link";
import { Shield, Vote, BarChart3, Lock, Cpu, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-center">
        <div className="space-y-6">
          <div className="np-card np-card-muted p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-(--np-ink) text-(--np-white) flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl sm:text-3xl font-semibold text-(--np-ink)">
                  VOTEXA – Blockchain voting system
                </h1>
                <p className="text-xs sm:text-sm text-(--np-ink-muted)">
                  Aadhaar-backed identity, biometric verification, and a tamper-evident blockchain ledger for every ballot.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-white/80 border border-(--np-border) p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-(--np-ink-muted)">
                  <span className="h-6 w-6 rounded-full bg-(--np-saffron)/15 flex items-center justify-center text-(--np-saffron)">
                    1
                  </span>
                  Identity assurance
                </div>
                <p className="text-xs text-(--np-ink-muted)">
                  Aadhaar and mobile verification reduce duplicate and fraudulent registrations.
                </p>
              </div>
              <div className="rounded-xl bg-white/80 border border-(--np-border) p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-(--np-ink-muted)">
                  <span className="h-6 w-6 rounded-full bg-(--np-green)/15 flex items-center justify-center text-(--np-green)">
                    2
                  </span>
                  Biometric liveness
                </div>
                <p className="text-xs text-(--np-ink-muted)">
                  Live face verification protects against spoofing and replay attempts.
                </p>
              </div>
              <div className="rounded-xl bg-white/80 border border-(--np-border) p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-(--np-ink-muted)">
                  <span className="h-6 w-6 rounded-full bg-(--np-ink)/5 flex items-center justify-center text-(--np-ink)">
                    3
                  </span>
                  Immutable ballot trail
                </div>
                <p className="text-xs text-(--np-ink-muted)">
                  Votes are written to a tamper-evident audit chain without revealing ballot choices.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/register">Register to vote</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/verify">Already registered? Verify</Link>
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
        </div>

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
              Connect a live PostgreSQL database and admin dashboard to track authenticated turnout in real time.
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-lg bg-white border border-(--np-border) px-3 py-2">
                <div className="text-(--np-ink-muted)">Registered</div>
                <div className="text-sm font-semibold text-(--np-ink)">1,284</div>
              </div>
              <div className="rounded-lg bg-white border border-(--np-border) px-3 py-2">
                <div className="text-(--np-ink-muted)">Verified</div>
                <div className="text-sm font-semibold text-(--np-ink)">932</div>
              </div>
              <div className="rounded-lg bg-white border border-(--np-border) px-3 py-2">
                <div className="text-(--np-ink-muted)">Ballots cast</div>
                <div className="text-sm font-semibold text-(--np-ink)">618</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* How it works */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="np-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-(--np-ink)">Step 1 · Register</h2>
          <p className="text-xs text-(--np-ink-muted)">
            Citizens enroll once with Aadhaar, a verified mobile number, and a live selfie to bind identity to a single encrypted voter record.
          </p>
        </div>
        <div className="np-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-(--np-ink)">Step 2 · Verify & vote</h2>
          <p className="text-xs text-(--np-ink-muted)">
            Before every ballot, VOTEXA re-verifies your identity, issues a time-bound voting ticket, and records one immutable vote.
          </p>
        </div>
        <div className="np-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-(--np-ink)">Step 3 · Audit the chain</h2>
          <p className="text-xs text-(--np-ink-muted)">
            Administrators and auditors review a cryptographic audit chain to verify turnout, status changes, and candidate operations.
          </p>
        </div>
      </section>

      {/* Security & technology */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
        <div className="np-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-(--np-ink-muted)">
            <Lock className="h-4 w-4 text-(--np-ink)" />
            Security by design
          </div>
          <ul className="space-y-2 text-xs text-(--np-ink-muted)">
            <li>
              <span className="font-medium text-(--np-ink)">Encrypted identity:</span> Aadhaar references are stored as salted hashes; raw identifiers never leave the client.
            </li>
            <li>
              <span className="font-medium text-(--np-ink)">Receipt without exposure:</span> Voters receive an encrypted receipt hash that proves participation without revealing who they voted for.
            </li>
            <li>
              <span className="font-medium text-(--np-ink)">Tamper-evident audit chain:</span> Every critical action appends a new block to an append-only audit structure.
            </li>
          </ul>
        </div>
        <div className="np-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-(--np-ink-muted)">
            <Cpu className="h-4 w-4 text-(--np-green)" />
            Built for modern India
          </div>
          <ul className="space-y-2 text-xs text-(--np-ink-muted)">
            <li>
              <span className="font-medium text-(--np-ink)">Face liveness models:</span> On-device checks reduce dependence on external biometrics providers.
            </li>
            <li>
              <span className="font-medium text-(--np-ink)">Scalable APIs:</span> Next.js APIs and PostgreSQL-backed metrics support national-scale turnout.
            </li>
            <li>
              <span className="font-medium text-(--np-ink)">Role-separated admin:</span> Dedicated admin console for candidates, elections, and audit review.
            </li>
          </ul>
        </div>
      </section>

      {/* Call to action */}
      <section className="np-card np-card-muted p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-(--np-ink-muted)">
            <Network className="h-4 w-4 text-(--np-saffron)" />
            Ready to try VOTEXA?
          </div>
          <p className="text-xs sm:text-sm text-(--np-ink-muted) max-w-xl">
            Start in sandbox mode, onboard a pilot constituency, and validate a blockchain-backed digital voting flow end‑to‑end.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg">
            <Link href="/register">Begin voter registration</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/dashboard">Open admin dashboard</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
