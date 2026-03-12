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

type VoterRow = {
  id: string;
  mobile: string | null;
  displayName: string | null;
  isVerified: boolean;
  hasVoted: boolean;
  createdAt: string;
};

type AuditRow = {
  idx: number;
  action: string;
  actorType: string | null;
  actorId: string | null;
  createdAt: string;
};

type AuditApiRow = {
  idx: number;
  action: string;
  actorType?: string | null;
  actorId?: string | null;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [voters, setVoters] = useState<VoterRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [electionStatus, setElectionStatus] = useState<string>("");
  const [settingStatus, setSettingStatus] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [partyDraft, setPartyDraft] = useState("");
  const [symbolDraft, setSymbolDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [verificationDetailsDraft, setVerificationDetailsDraft] = useState("");
  const [symbolImageFile, setSymbolImageFile] = useState<File | null>(null);
  const [verificationDocFile, setVerificationDocFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function fileToDataUrl(file: File) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
  }

  async function loadMetrics() {
    setLoading(true);
    const response = await fetch("/api/admin/metrics");
    const data = await response.json();
    setMetrics(data);
    setLoading(false);
  }

  async function loadVoters() {
    const response = await fetch("/api/admin/voters");
    const data = await response.json();
    setVoters(data.voters ?? []);
  }

  async function loadAudit() {
    const response = await fetch("/api/admin/audit");
    const data = await response.json();
    setAudit(
      ((data.blocks ?? []) as AuditApiRow[]).map((b) => ({
        idx: b.idx,
        action: b.action,
        actorType: b.actorType ?? null,
        actorId: b.actorId ?? null,
        createdAt: b.createdAt,
      })),
    );
  }

  async function loadElection() {
    const response = await fetch("/api/admin/election");
    const data = await response.json();
    setElectionStatus(data.election?.status ?? "");
  }

  useEffect(() => {
    loadMetrics();
    loadVoters();
    loadAudit();
    loadElection();
  }, []);

  async function handleSetElectionStatus() {
    if (!electionStatus) return;
    setSettingStatus(true);
    try {
      await fetch("/api/admin/election", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: electionStatus }),
      });
      await loadElection();
      await loadAudit();
    } finally {
      setSettingStatus(false);
    }
  }

  async function handleCreateCandidate() {
    if (!nameDraft || !partyDraft) return;
    setSaving(true);
    try {
      const symbolImage = symbolImageFile ? await fileToDataUrl(symbolImageFile) : "";
      const verificationDoc = verificationDocFile ? await fileToDataUrl(verificationDocFile) : "";
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
          symbolImage: symbolImage || undefined,
          verificationDoc: verificationDoc || undefined,
          verificationDetails: verificationDetailsDraft || undefined,
        }),
      });
      setNameDraft("");
      setPartyDraft("");
      setSymbolDraft("");
      setBioDraft("");
      setVerificationDetailsDraft("");
      setSymbolImageFile(null);
      setVerificationDocFile(null);
      await loadMetrics();
      await loadAudit();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCandidate(id: string) {
    await fetch(`/api/admin/candidates/${id}`, {
      method: "DELETE",
    });
    await loadMetrics();
    await loadAudit();
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
              <h2 className="text-sm font-semibold text-(--np-ink)">Election status</h2>
              <p className="text-[11px] text-(--np-ink-muted)">Publish current election phase for auditing.</p>
            </div>
            <Button variant="outline" size="sm" type="button" onClick={loadElection}>
              Refresh
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-[11px] font-medium text-(--np-ink-muted)">
              Status
              <input
                value={electionStatus}
                onChange={(e) => setElectionStatus(e.target.value)}
                className="mt-1 w-72 rounded-lg border border-(--np-border) bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
                placeholder="e.g. OPEN / CLOSED"
              />
            </label>
            <Button type="button" size="sm" onClick={handleSetElectionStatus} disabled={settingStatus || !electionStatus}>
              {settingStatus ? "Saving..." : "Set status"}
            </Button>
          </div>
        </section>
        <section className="np-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-(--np-ink)">Registered voters (latest 100)</h2>
              <p className="text-[11px] text-(--np-ink-muted)">Operational view for administrators.</p>
            </div>
            <Button variant="outline" size="sm" type="button" onClick={loadVoters}>
              Refresh
            </Button>
          </div>
          <div className="max-h-56 overflow-auto rounded-lg border border-(--np-border) bg-white">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="text-[11px] text-(--np-ink-muted)">
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Mobile</th>
                  <th className="text-left px-3 py-2">Verified</th>
                  <th className="text-left px-3 py-2">Voted</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((v) => (
                  <tr key={v.id} className="border-t border-(--np-border)">
                    <td className="px-3 py-2">{v.displayName || v.id.slice(0, 8)}</td>
                    <td className="px-3 py-2">{v.mobile ? `******${v.mobile.slice(-4)}` : "-"}</td>
                    <td className="px-3 py-2">{v.isVerified ? "Yes" : "No"}</td>
                    <td className="px-3 py-2">{v.hasVoted ? "Yes" : "No"}</td>
                  </tr>
                ))}
                {voters.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-(--np-ink-muted)" colSpan={4}>
                      No voters found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="np-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-(--np-ink)">Audit chain (latest 50)</h2>
              <p className="text-[11px] text-(--np-ink-muted)">Tamper-evident activity log.</p>
            </div>
            <Button variant="outline" size="sm" type="button" onClick={loadAudit}>
              Refresh
            </Button>
          </div>
          <div className="max-h-56 overflow-auto rounded-lg border border-(--np-border) bg-white">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-white">
                <tr className="text-[11px] text-(--np-ink-muted)">
                  <th className="text-left px-3 py-2">#</th>
                  <th className="text-left px-3 py-2">Action</th>
                  <th className="text-left px-3 py-2">Actor</th>
                  <th className="text-left px-3 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.idx} className="border-t border-(--np-border)">
                    <td className="px-3 py-2 font-mono text-[11px]">{a.idx}</td>
                    <td className="px-3 py-2">{a.action}</td>
                    <td className="px-3 py-2">{a.actorType ? `${a.actorType}` : "-"}{a.actorId ? `:${a.actorId}` : ""}</td>
                    <td className="px-3 py-2">{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {audit.length === 0 && (
                  <tr>
                    <td className="px-3 py-3 text-(--np-ink-muted)" colSpan={4}>
                      No audit blocks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[11px] font-medium text-(--np-ink-muted)">
              Symbol image upload
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSymbolImageFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-2.5 py-1.5 text-xs"
              />
            </label>
            <label className="text-[11px] font-medium text-(--np-ink-muted)">
              Candidate verification document
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setVerificationDocFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-2.5 py-1.5 text-xs"
              />
            </label>
            <label className="text-[11px] font-medium text-(--np-ink-muted) sm:col-span-2">
              Verification details
              <input
                value={verificationDetailsDraft}
                onChange={(e) => setVerificationDetailsDraft(e.target.value)}
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-2.5 py-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
                placeholder="Officer notes, ID references, etc."
              />
            </label>
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

