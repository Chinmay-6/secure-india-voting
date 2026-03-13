"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, IdCard, ShieldCheck, SmartphoneNfc } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactWebcam from "react-webcam";
import { computeFaceDescriptorFromDataUrl, loadFaceModels } from "@/lib/faceApiClient";
import { useAadhaarKyc } from "@/hooks/useAadhaarKyc";

export default function RegisterPage() {
  const router = useRouter();
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [capturing, setCapturing] = useState(false);
  const webcamRef = useRef<ReactWebcam | null>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelError, setModelError] = useState("");
  const {
    step: kycStep,
    loading: kycLoading,
    error: kycError,
    success: kycSuccess,
    transactionId,
    aadhaarMasked,
    checkExistence,
    confirmIdentity,
  } = useAadhaarKyc();

  async function ensureModels() {
    setModelError("");
    try {
      await loadFaceModels();
      setModelsReady(true);
      return true;
    } catch {
      setModelError("Face verification models are missing. Run: node scripts/download-face-models.mjs");
      setModelsReady(false);
      return false;
    }
  }

  async function handleCaptureSelfie() {
    setErrorText("");
    if (!webcamRef.current) return;
    setCapturing(true);
    try {
      const shot = webcamRef.current.getScreenshot();
      if (!shot) {
        setErrorText("Unable to capture selfie. Allow camera access and try again.");
        return;
      }
      setSelfieDataUrl(shot);
    } finally {
      setCapturing(false);
    }
  }

  async function handleRegister() {
    setErrorText("");
    const okModels = await ensureModels();
    if (!okModels) {
      setErrorText("Face models unavailable. Run: node scripts/download-face-models.mjs");
      return;
    }
    if (kycStep !== "verified") {
      setErrorText("Complete Aadhaar KYC verification before registering.");
      return;
    }
    if (!/^\d{10}$/.test(mobileInput)) {
      setErrorText("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!selfieDataUrl) {
      setErrorText("Capture a clear selfie to register.");
      return;
    }
    setSubmitting(true);
    try {
      const descriptor = await computeFaceDescriptorFromDataUrl(selfieDataUrl);
      if (!descriptor) {
        setErrorText("No face detected in selfie. Please retake in good lighting.");
        setSubmitting(false);
        return;
      }
      const response = await fetch("/api/voter/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aadhaar: aadhaarInput,
          mobile: mobileInput,
          displayName: nameInput || undefined,
          selfie: selfieDataUrl,
          faceDescriptor: descriptor,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorText(data.error || "Unable to register. Try again.");
        setSubmitting(false);
        return;
      }
      router.push("/verify");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="np-card np-card-muted p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-(--np-saffron)/10 flex items-center justify-center text-(--np-saffron)">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-wide text-(--np-ink) uppercase">
              Step 1 · Aadhaar KYC
            </h1>
            <p className="text-xs text-(--np-ink-muted)">
              Validate your Aadhaar against UIDAI through the Sandbox.co.in API.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          <label className="text-xs font-medium text-(--np-ink-muted)">
            Aadhaar number
            <input
              value={aadhaarInput}
              onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
              className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
              placeholder="0000 0000 0000"
              inputMode="numeric"
              disabled={kycStep === "verified"}
            />
          </label>
          {kycStep !== "verified" && (
            <div className="flex items-center justify-between gap-3">
              <div className="np-pill">
                <SmartphoneNfc className="h-3 w-3" />
                OTP is sent to the Aadhaar-linked mobile number.
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={kycLoading}
                onClick={() => checkExistence(aadhaarInput)}
              >
                {kycLoading ? "Contacting Aadhaar..." : "Check Aadhaar"}
              </Button>
            </div>
          )}
          {kycStep === "otp-sent" && (
            <label className="text-xs font-medium text-(--np-ink-muted)">
              OTP
              <input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
                placeholder="Enter 6-digit OTP"
                inputMode="numeric"
              />
            </label>
          )}
          {transactionId && (
            <p className="text-[11px] text-(--np-ink-muted)">
              Transaction ID: <span className="font-mono">{transactionId}</span>
            </p>
          )}
          {aadhaarMasked && kycStep === "verified" && (
            <p className="text-[11px] text-emerald-700">
              Aadhaar verified for {aadhaarMasked}. You can now complete registration.
            </p>
          )}
          {kycError && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {kycError}
            </p>
          )}
          {kycSuccess && kycStep !== "verified" && (
            <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {kycSuccess}
            </p>
          )}
          {kycStep === "otp-sent" && (
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="button"
                size="sm"
                disabled={kycLoading || otpInput.replace(/\D/g, "").length !== 6}
                onClick={() => confirmIdentity(otpInput, aadhaarInput)}
              >
                {kycLoading ? "Verifying OTP..." : "Confirm Aadhaar"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="np-card np-card-muted p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-(--np-saffron)/10 flex items-center justify-center text-(--np-saffron)">
            <IdCard className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl font-semibold text-(--np-ink)">Voter Registration</h2>
            <p className="text-xs text-(--np-ink-muted)">
              After Aadhaar is verified, register your contact and biometric details.
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          <label className="text-xs font-medium text-(--np-ink-muted)">
            Full name
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
              placeholder="As per Aadhaar"
              disabled={kycStep !== "verified"}
            />
          </label>
          <label className="text-xs font-medium text-(--np-ink-muted)">
            Mobile number (linked to Aadhaar)
            <input
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
              placeholder="10-digit mobile number"
              inputMode="numeric"
              disabled={kycStep !== "verified"}
            />
          </label>
        </div>
      <div className="space-y-3">
        <div className="text-xs font-medium text-(--np-ink-muted)">Selfie capture</div>
        <div className="relative overflow-hidden rounded-xl border border-(--np-border) bg-black/70 aspect-video flex items-center justify-center">
          <ReactWebcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="h-full w-full object-cover"
            videoConstraints={{ facingMode: "user" }}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="np-pill">
            <Camera className="h-3 w-3" />
            Capture a clear front-facing selfie.
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleCaptureSelfie} disabled={capturing}>
            {capturing ? "Capturing..." : selfieDataUrl ? "Retake selfie" : "Capture selfie"}
          </Button>
        </div>
        {!modelsReady && (
          <p className="text-[11px] text-(--np-ink-muted)">
            Face verification models must be available at <span className="font-mono">/models</span>.
          </p>
        )}
        {modelError && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {modelError}
          </p>
        )}
        {selfieDataUrl && (
          <div className="rounded-xl border border-(--np-border) bg-white p-3">
            <div className="text-[11px] font-medium text-(--np-ink-muted) mb-2">Captured selfie preview</div>
            <div className="relative w-full aspect-video overflow-hidden rounded-lg bg-black/5">
              <Image src={selfieDataUrl} alt="Captured selfie" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
            </div>
          </div>
        )}
      </div>
      {errorText && (
        <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {errorText}
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-(--np-ink-muted)">
          By continuing, you consent to secure processing of your encrypted Aadhaar reference.
        </p>
        <Button
          type="button"
          size="lg"
          onClick={handleRegister}
          disabled={submitting || kycStep !== "verified"}
        >
          {submitting ? "Registering..." : "Register and verify"}
        </Button>
      </div>
      </div>
    </div>
  );
}

