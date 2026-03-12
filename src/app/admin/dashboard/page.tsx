"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Trash2, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CandidateRow = {
  id: string;
  name: string;
  party: string;
  symbol: string;
  bio: string;
  votes: number;
};

type MetricsShape = {
  totalVoters: number;
  verifiedVoters: number;
  votedCount: number;
  candidates: CandidateRow[];
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [nameDraft, setNameDraft] = useState("");
  const [partyDraft, setPartyDraft] = useState("");
  const [symbolDraft, setSymbolDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadMetrics() {
    setLoading(true);
    const response = await fetch("/api/admin/metrics");
    const data = await response.json();
    setMetrics(data);
    setLoading(false);
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  async function handleCreateCandidate() {
    if (!nameDraft || !partyDraft) return;
    setSaving(true);
    try {
      await fetch("/api/admin/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameDraft,
          party: partyDraft,
          symbol: symbolDraft || nameDraft.charAt(0),
          bio: bioDraft || "Registered party candidate.",
        }),
      });
      setNameDraft("");
      setPartyDraft("");
      setSymbolDraft("");
      setBioDraft("");
      await loadMetrics();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCandidate(id: string) {
    await fetch(`/api/admin/candidates/${id}`, {
      method: "DELETE",
    });
    await loadMetrics();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });
    window.location.href = "/";
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="np-card p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-(--np-ink) text-(--np-white) flex items-center justify-center text-xs">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-(--np-ink)">Admin Console</span>
            <span className="text-[11px] text-(--np-ink-muted)">Secure election controls</span>
          </div>
        </div>
        <nav className="space-y-1 text-xs">
          <div className="flex items-center gap-2 rounded-lg bg-(--np-saffron)/10 px-2 py-1.5 text-(--np-ink)">
            <BarChart3 className="h-3 w-3" />
            Overview
          </div>
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-(--np-ink-muted)">
            <Users className="h-3 w-3" />
            Candidates
          </div>
        </nav>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center mt-2"
          onClick={handleLogout}
        >
          <LogOut className="h-3 w-3 mr-1.5" />
          Sign out
        </Button>
      </aside>
      <main className="space-y-6">
        <section className="np-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-sm font-semibold text-(--np-ink)">Turnout overview</h1>
              <p className="text-[11px] text-(--np-ink-muted)">
                Live snapshot based on verified voters and recorded ballots.
              </p>
            </div>
            <Button variant="outline" size="sm" type="button" onClick={loadMetrics}>
              Refresh
            </Button>
          </div>
          {loading || !metrics ? (
            <p className="text-xs text-(--np-ink-muted)">Loading analytics...</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white border border-(--np-border) p-3 space-y-1">
                <div className="text-[11px] text-(--np-ink-muted)">Registered voters</div>
                <div className="text-lg font-semibold text-(--np-ink)">
                  {metrics.totalVoters}
                </div>
              </div>
              <div className="rounded-lg bg-white border border-(--np-border) p-3 space-y-1">
                <div className="text-[11px] text-(--np-ink-muted)">Verified identities</div>
                <div className="text-lg font-semibold text-(--np-ink)">
                  {metrics.verifiedVoters}
                </div>
              </div>
              <div className="rounded-lg bg-white border border-(--np-border) p-3 space-y-1">
                <div className="text-[11px] text-(--np-ink-muted)">Ballots cast</div>
                <div className="text-lg font-semibold text-(--np-ink)">
                  {metrics.votedCount}
                </div>
              </div>
            </div>
          )}
        </section>
        <section className="np-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-(--np-ink)">Candidate management</h2>
              <p className="text-[11px] text-(--np-ink-muted)">
                Register and manage candidates participating in this election.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 items-end">
            <label className="text-[11px] font-medium text-(--np-ink-muted)">
              Name
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
              />
            </label>
            <label className="text-[11px] font-medium text-(--np-ink-muted)">
              Party
              <input
                value={partyDraft}
                onChange={(e) => setPartyDraft(e.target.value)}
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
              />
            </label>
            <label className="text-[11px] font-medium text-(--np-ink-muted)">
              Symbol text
              <input
                value={symbolDraft}
                onChange={(e) => setSymbolDraft(e.target.value)}
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
                placeholder="e.g. Lotus"
              />
            </label>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleCreateCandidate}
                disabled={saving || !nameDraft || !partyDraft}
              >
                <UserPlus className="h-3 w-3 mr-1.5" />
                Add candidate
              </Button>
            </div>
          </div>
          {metrics && metrics.candidates.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] pt-2">
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {metrics.candidates.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-(--np-border) bg-white px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-(--np-ink)">{c.name}</span>
                      <span className="text-[11px] text-(--np-ink-muted)">
                        {c.party} · {c.votes} votes
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCandidate(c.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.candidates.map((c) => ({
                      name: c.name.slice(0, 10),
                      votes: c.votes,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis allowDecimals={false} fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#138808" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {metrics && metrics.candidates.length === 0 && (
            <p className="text-xs text-(--np-ink-muted)">No candidates registered yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

