"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AadhaarOtpStep } from "@/components/auth/AadhaarOtpStep";
import { FaceStep } from "@/components/auth/FaceStep";
import { Button } from "@/components/ui/button";
import { useAuthFlowStore } from "@/store/useAuthFlow";
import { useRouter } from "next/navigation";

export function VerificationShell() {
  const [stageToken, setStageToken] = useState<"aadhaar" | "face" | "done">("aadhaar");
  const router = useRouter();
  const resetFlow = useAuthFlowStore((s) => s.resetFlow);

  function handleAdvanceToFace() {
    setStageToken("face");
  }

  function handleAdvanceToComplete() {
    setStageToken("done");
    const sessionToken = sessionStorage.getItem("svp_ticket") || "";
    if (sessionToken) {
      useAuthFlowStore.getState().setCompleted(sessionToken);
    }
  }

  function handleProceedToBallot() {
    router.push("/vote");
  }

  function handleRestart() {
    resetFlow();
    sessionStorage.removeItem("svp_ticket");
    setStageToken("aadhaar");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-(--np-ink)">
          Voter Identity Verification
        </h1>
        <p className="text-sm text-(--np-ink-muted)">
          Complete the Aadhaar and face verification steps to securely access your digital ballot.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        <span className="px-3 py-1 rounded-full bg-(--np-saffron)/10 text-(--np-saffron)">
          Step 1 · Aadhaar
        </span>
        <span className="px-3 py-1 rounded-full bg-(--np-green)/10 text-(--np-green)">
          Step 2 · Face
        </span>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">
          Step 3 · Ballot
        </span>
      </div>
      {stageToken === "aadhaar" && <AadhaarOtpStep onAdvance={handleAdvanceToFace} />}
      {stageToken === "face" && <FaceStep onReady={handleAdvanceToComplete} />}
      {stageToken === "done" && (
        <div className="np-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-(--np-ink)">
                Verification complete
              </span>
              <span className="text-xs text-(--np-ink-muted)">
                You can now proceed to cast your vote on the secure ballot.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" type="button" onClick={handleRestart}>
              Restart
            </Button>
            <Button size="sm" type="button" onClick={handleProceedToBallot}>
              Go to Ballot
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

