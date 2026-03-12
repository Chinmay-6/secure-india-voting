"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ShieldCheck, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

type CandidateShape = {
  id: string;
  name: string;
  party: string;
  symbol: string;
  bio: string;
};

type VoteState =
  | { phase: "loading" }
  | { phase: "ready"; candidates: CandidateShape[] }
  | { phase: "already-voted" }
  | {
      phase: "receipt";
      receiptHash: string;
      timestamp: string;
    };

export default function VotePage() {
  const router = useRouter();
  const [state, setState] = useState<VoteState>({ phase: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("svp_ticket") ?? "";
    if (!token) {
      router.replace("/verify");
      return;
    }
    async function bootstrap() {
      setState({ phase: "loading" });
      const response = await fetch("/api/vote/bootstrap", {
        headers: {
          "x-session-token": token,
        },
      });
      if (response.status === 401 || response.status === 403) {
        router.replace("/verify");
        return;
      }
      const data = await response.json();
      if (data.alreadyVoted) {
        setState({ phase: "already-voted" });
        return;
      }
      setState({
        phase: "ready",
        candidates: data.candidates ?? [],
      });
    }
    bootstrap();
  }, [router]);

  async function handleConfirmVote() {
    if (!selectedId) {
      return;
    }
    const token = sessionStorage.getItem("svp_ticket") ?? "";
    if (!token) {
      router.replace("/verify");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-token": token,
        },
        body: JSON.stringify({ candidateId: selectedId }),
      });
      if (!response.ok) {
        setSubmitting(false);
        return;
      }
      const data = await response.json();
      const receiptHash = String(data.receiptHash);
      const timestamp = String(data.timestamp);
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("VOTEXA - Blockchain voting system", 20, 30);
      doc.setFontSize(10);
      doc.text("Encrypted Voting Receipt", 20, 40);
      doc.text(`Receipt Reference: ${receiptHash}`, 20, 52);
      doc.text(`Issued At: ${timestamp}`, 20, 60);
      doc.text("This receipt does not reveal your ballot choice.", 20, 72);
      doc.save("voting-receipt.pdf");
      setState({
        phase: "receipt",
        receiptHash,
        timestamp,
      });
      sessionStorage.removeItem("svp_ticket");
    } finally {
      setSubmitting(false);
    }
  }

  if (state.phase === "loading") {
    return (
      <div className="max-w-3xl mx-auto np-card p-6 sm:p-8">
        <p className="text-sm text-(--np-ink-muted)">Preparing your secure ballot...</p>
      </div>
    );
  }

  if (state.phase === "already-voted") {
    return (
      <div className="max-w-3xl mx-auto np-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-(--np-ink)">Ballot already cast</span>
            <span className="text-xs text-(--np-ink-muted)">
              Our records show that a verified vote has already been recorded for this identity.
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.replace("/")}>
          Return to home
        </Button>
      </div>
    );
  }

  if (state.phase === "receipt") {
    return (
      <div className="max-w-3xl mx-auto np-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-(--np-ink)">Vote recorded</span>
            <span className="text-xs text-(--np-ink-muted)">
              Your encrypted receipt has been generated. Keep the downloaded PDF for your records.
            </span>
          </div>
        </div>
        <div className="text-xs space-y-1 text-(--np-ink-muted)">
          <p>
            Receipt reference:{" "}
            <span className="font-mono text-[11px] text-(--np-ink)">{state.receiptHash}</span>
          </p>
          <p>Issued at: {new Date(state.timestamp).toLocaleString()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.replace("/")}>
          Return to home
        </Button>
      </div>
    );
  }

  if (state.phase === "ready") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl font-semibold text-(--np-ink)">Digital Ballot</h1>
          <p className="text-sm text-(--np-ink-muted)">
            Review the candidates below and confirm your selection. You can cast exactly one vote.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {state.candidates.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={`np-card p-4 text-left space-y-3 ${
                selectedId === c.id ? "ring-2 ring-(--np-saffron)" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-(--np-ink)">{c.name}</div>
                  <div className="text-xs text-(--np-ink-muted)">{c.party}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-xs font-medium text-(--np-ink) relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/candidates/${c.id}/symbol`}
                    alt={`${c.name} symbol`}
                    className="h-full w-full object-cover"
                    onLoad={(e) => {
                      const parent = e.currentTarget.parentElement;
                      const fallback = parent?.querySelector("[data-fallback]");
                      if (fallback) (fallback as HTMLElement).style.display = "none";
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span data-fallback className="px-2">
                    {c.symbol.slice(0, 3).toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-(--np-ink-muted) line-clamp-3">{c.bio}</p>
            </button>
          ))}
          {state.candidates.length === 0 && (
            <div className="np-card p-4 text-sm text-(--np-ink-muted)">
              No candidates are available yet. Contact the election administrator.
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="np-pill">
            <Vote className="h-3 w-3" />
            You will receive an encrypted receipt without candidate details.
          </div>
          <Button
            type="button"
            size="lg"
            disabled={!selectedId || submitting}
            onClick={handleConfirmVote}
          >
            {submitting ? "Recording vote..." : "Confirm and cast vote"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

