"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "aadhaar" | "otp" | "done";

export function AadhaarEntryForm() {
  const [step, setStep] = useState<Step>("aadhaar");
  const [aadhaar, setAadhaar] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleAadhaarSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const digits = aadhaar.replace(/\D/g, "").slice(0, 12);
    if (!/^\d{12}$/.test(digits)) {
      setError("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/aadhaar/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aadhaarNumber: digits }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.transactionId || !data.referenceId) {
        setError(data.error || "Unable to start Aadhaar verification.");
        return;
      }
      const masked = data.aadhaarMasked || `********${digits.slice(-4)}`;
      setReferenceId(data.referenceId);
      setTransactionId(data.transactionId);
      setSuccess(`OTP has been sent to the mobile linked with ${masked}. Transaction ID: ${data.transactionId}`);
      setStep("otp");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const digits = aadhaar.replace(/\D/g, "").slice(0, 12);
    if (!/^\d{12}$/.test(digits)) {
      setError("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    const otpDigits = otp.replace(/\D/g, "").slice(0, 6);
    if (!/^\d{6}$/.test(otpDigits)) {
      setError("Enter the 6-digit OTP you received.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/aadhaar/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceId,
          otp: otpDigits,
          aadhaarNumber: digits,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setError(data.error || "OTP verification failed.");
        return;
      }
      const masked = data.aadhaarMasked || `********${digits.slice(-4)}`;
      const name = data.name || "";
      setSuccess(
        name
          ? `Aadhaar KYC completed for ${name} (${masked}).`
          : `Aadhaar KYC completed for ${masked}.`,
      );
      setStep("done");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="np-card np-card-muted p-6 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-(--np-saffron)/15 flex items-center justify-center text-(--np-saffron)">
          <Shield className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl font-semibold text-(--np-ink)">Aadhaar verification (Digital India)</h2>
          <p className="text-xs sm:text-sm text-(--np-ink-muted)">
            Start secure Aadhaar-based verification before casting your digital vote.
          </p>
        </div>
      </div>
      {step === "aadhaar" && (
        <form onSubmit={handleAadhaarSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-(--np-ink-muted)">
              Aadhaar number
              <input
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                inputMode="numeric"
                maxLength={14}
                placeholder="0000 0000 0000"
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
              />
            </label>
            <p className="text-[11px] text-(--np-ink-muted)">
              Your full Aadhaar is never stored in plain text. Verification is powered by a government-grade sandbox API.
            </p>
          </div>
          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {success}
            </p>
          )}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-(--np-ink-muted)">
              You will receive a one-time password on the mobile linked to your Aadhaar.
            </p>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Connecting to Aadhaar..." : "Send OTP"}
            </Button>
          </div>
        </form>
      )}
      {step !== "aadhaar" && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-(--np-ink-muted)">
              OTP
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
              />
            </label>
            <p className="text-[11px] text-(--np-ink-muted)">
              Enter the OTP you received on your Aadhaar-linked mobile number.
            </p>
            <p className="text-[11px] text-(--np-ink-muted)">
              Transaction ID: <span className="font-mono">{transactionId}</span>
            </p>
          </div>
          {error && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {success}
            </p>
          )}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => {
                setStep("aadhaar");
                setOtp("");
                setError("");
                setSuccess("");
              }}
            >
              Change Aadhaar
            </Button>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Verifying OTP..." : "Verify Aadhaar KYC"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

