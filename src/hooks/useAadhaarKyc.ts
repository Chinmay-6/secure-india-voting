"use client";

import { useState } from "react";

type AadhaarKycStep = "idle" | "otp-sent" | "verified";

type AadhaarKycState = {
  step: AadhaarKycStep;
  loading: boolean;
  error: string;
  success: string;
  referenceId: string;
  transactionId: string;
  aadhaarMasked: string;
};

export function useAadhaarKyc() {
  const [state, setState] = useState<AadhaarKycState>({
    step: "idle",
    loading: false,
    error: "",
    success: "",
    referenceId: "",
    transactionId: "",
    aadhaarMasked: "",
  });

  async function checkExistence(aadhaarNumber: string) {
    const digits = aadhaarNumber.replace(/\D/g, "").slice(0, 12);
    if (!/^\d{12}$/.test(digits)) {
      setState((s) => ({ ...s, error: "Enter a valid 12-digit Aadhaar number." }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: "", success: "" }));
    try {
      const res = await fetch("/api/aadhaar/check-existence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aadhaarNumber: digits }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.referenceId) {
        setState((s) => ({
          ...s,
          loading: false,
          error: data.error || "Unable to send Aadhaar OTP.",
        }));
        return;
      }
      setState((s) => ({
        ...s,
        loading: false,
        step: "otp-sent",
        referenceId: data.referenceId,
        transactionId: data.transactionId || "",
        aadhaarMasked: data.aadhaarMasked || `********${digits.slice(-4)}`,
        success: "OTP has been sent to the Aadhaar-linked mobile number.",
      }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Network error while contacting Aadhaar service.",
      }));
    }
  }

  async function confirmIdentity(otp: string, aadhaarNumber: string) {
    const digits = aadhaarNumber.replace(/\D/g, "").slice(0, 12);
    const otpDigits = otp.replace(/\D/g, "").slice(0, 6);
    if (!/^\d{12}$/.test(digits)) {
      setState((s) => ({ ...s, error: "Enter a valid 12-digit Aadhaar number." }));
      return;
    }
    if (!/^\d{6}$/.test(otpDigits)) {
      setState((s) => ({ ...s, error: "Enter the 6-digit OTP you received." }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: "", success: "" }));
    try {
      const res = await fetch("/api/aadhaar/confirm-identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceId: state.referenceId,
          otp: otpDigits,
          aadhaarNumber: digits,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          error: data.error || "Aadhaar identity verification failed.",
        }));
        return;
      }
      setState((s) => ({
        ...s,
        loading: false,
        step: "verified",
        success:
          data.name && data.aadhaarMasked
            ? `Aadhaar verified for ${data.name} (${data.aadhaarMasked}).`
            : "Aadhaar identity verified successfully.",
      }));
    } catch {
      setState((s) => ({
        ...s,
        loading: false,
        error: "Network error while confirming Aadhaar identity.",
      }));
    }
  }

  function reset() {
    setState({
      step: "idle",
      loading: false,
      error: "",
      success: "",
      referenceId: "",
      transactionId: "",
      aadhaarMasked: "",
    });
  }

  return {
    ...state,
    checkExistence,
    confirmIdentity,
    reset,
  };
}

