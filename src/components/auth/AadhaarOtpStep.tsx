"use client";

import { useState } from "react";
import { ShieldCheck, SmartphoneNfc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthFlowStore } from "@/store/useAuthFlow";

type AadhaarOtpStepProps = {
  onAdvance: () => void;
};

export function AadhaarOtpStep({ onAdvance }: AadhaarOtpStepProps) {
  const [aadhaarDraft, setAadhaarDraft] = useState("");
  const [mobileDraft, setMobileDraft] = useState("");
  const [otpDraft, setOtpDraft] = useState("");
  const [phaseToken, setPhaseToken] = useState<"idle" | "otp-sent" | "verifying">("idle");
  const [errorLabel, setErrorLabel] = useState("");
  const setAadhaarStage = useAuthFlowStore((s) => s.setAadhaarStage);
  const registerVoterId = useAuthFlowStore((s) => s.registerVoterId);

  async function handleRequestOtp() {
    setErrorLabel("");
    if (!/^\d{12}$/.test(aadhaarDraft)) {
      setErrorLabel("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (!/^\d{10}$/.test(mobileDraft)) {
      setErrorLabel("Enter the 10-digit mobile number you registered with.");
      return;
    }
    setPhaseToken("verifying");
    try {
      const response = await fetch("/api/verification/otp/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aadhaar: aadhaarDraft, mobile: mobileDraft }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorLabel(data.error || "Unable to send OTP. Try again.");
        setPhaseToken("idle");
        return;
      }
      const data = await response.json();
      const voterId = data.voterId ? String(data.voterId) : "";
      const challengeId = data.challengeId ? String(data.challengeId) : "";
      if (voterId) registerVoterId(voterId);
      if (challengeId) {
        setAadhaarStage(aadhaarDraft, mobileDraft, challengeId);
      }
      setPhaseToken("otp-sent");
    } catch {
      setErrorLabel("Network issue while creating secure voter record.");
      setPhaseToken("idle");
    }
  }

  async function handleVerifyOtp() {
    setErrorLabel("");
    setPhaseToken("verifying");
    const snapshot = useAuthFlowStore.getState();
    if (!snapshot.challengeId) {
      setErrorLabel("OTP request not initialised. Send OTP again.");
      setPhaseToken("idle");
      return;
    }
    try {
      const response = await fetch("/api/verification/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: snapshot.challengeId, otp: otpDraft }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorLabel(data.error || "OTP verification failed.");
        setPhaseToken("otp-sent");
        return;
      }
      setPhaseToken("idle");
      onAdvance();
    } catch {
      setErrorLabel("Network error during OTP verification.");
      setPhaseToken("otp-sent");
    }
  }

  return (
    <div className="np-card np-card-muted p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[var(--np-saffron)]/10 flex items-center justify-center text-[var(--np-saffron)]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-[var(--np-ink)] uppercase">
            Step 1 · Aadhaar Verification
          </span>
          <span className="text-xs text-[var(--np-ink-muted)]">
            Your Aadhaar number will be encrypted before storage.
          </span>
        </div>
      </div>
      <div className="grid gap-4">
        <label className="text-xs font-medium text-[var(--np-ink-muted)]">
          Aadhaar Number
          <input
            value={aadhaarDraft}
            onChange={(e) => setAadhaarDraft(e.target.value.replace(/\D/g, "").slice(0, 12))}
            className="mt-1 w-full rounded-lg border border-[var(--np-border)] bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--np-saffron)]"
            placeholder="0000 0000 0000"
            inputMode="numeric"
          />
        </label>
        <label className="text-xs font-medium text-[var(--np-ink-muted)]">
          Registered mobile number
          <input
            value={mobileDraft}
            onChange={(e) => setMobileDraft(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="mt-1 w-full rounded-lg border border-[var(--np-border)] bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--np-saffron)]"
            placeholder="10-digit mobile number"
            inputMode="numeric"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <div className="np-pill">
            <SmartphoneNfc className="h-3 w-3" />
            OTP is generated on the server. (In dev, it is printed in the server log.)
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRequestOtp}
            disabled={phaseToken === "verifying"}
          >
            Send OTP
          </Button>
        </div>
        <label className="text-xs font-medium text-[var(--np-ink-muted)]">
          One-Time Password
          <input
            value={otpDraft}
            onChange={(e) => setOtpDraft(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-1 w-full rounded-lg border border-[var(--np-border)] bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--np-saffron)]"
            placeholder="Enter 6-digit OTP"
            inputMode="numeric"
          />
        </label>
      </div>
      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-[var(--np-ink-muted)]">
          Keep this browser window open until you complete casting your vote.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={handleVerifyOtp}
          disabled={phaseToken !== "otp-sent" || otpDraft.length !== 6}
        >
          {phaseToken === "verifying" ? "Verifying..." : "Continue"}
        </Button>
      </div>
      {errorLabel && (
        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {errorLabel}
        </p>
      )}
    </div>
  );
}

