"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthFlowStore } from "@/store/useAuthFlow";
import ReactWebcam from "react-webcam";
import { computeFaceDescriptorFromDataUrl, euclideanDistance, loadFaceModels } from "@/lib/faceApiClient";

type FaceStepProps = {
  onReady: () => void;
};

export function FaceStep({ onReady }: FaceStepProps) {
  const [errorNote, setErrorNote] = useState("");
  const [matchingFlag, setMatchingFlag] = useState<"idle" | "capturing" | "matched">("idle");
  const webcamRef = useRef<ReactWebcam | null>(null);
  const setFaceStage = useAuthFlowStore((s) => s.setFaceStage);
  const voterId = useAuthFlowStore((s) => s.voterId);
  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadFaceModels()
      .then(() => {
        if (active) setModelsReady(true);
      })
      .catch(() => {
        if (active) setModelsReady(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleCapture() {
    if (!voterId) {
      setErrorNote("Verification session is incomplete. Restart verification.");
      return;
    }
    if (!modelsReady) {
      setErrorNote("Face models missing. Run: node scripts/download-face-models.mjs");
      return;
    }
    if (!webcamRef.current) {
      return;
    }
    setErrorNote("");
    setMatchingFlag("capturing");
    const canvasShot = webcamRef.current.getScreenshot();
    if (!canvasShot) {
      setErrorNote("No frame available from camera. Allow camera access.");
      setMatchingFlag("idle");
      return;
    }
    try {
      const descriptor1 = await computeFaceDescriptorFromDataUrl(canvasShot);
      if (!descriptor1) {
        setErrorNote("No face detected. Improve lighting and center your face.");
        setMatchingFlag("idle");
        return;
      }
      await new Promise((r) => setTimeout(r, 850));
      const canvasShot2 = webcamRef.current.getScreenshot();
      if (!canvasShot2) {
        setErrorNote("Unable to capture a second frame for liveness check.");
        setMatchingFlag("idle");
        return;
      }
      const descriptor2 = await computeFaceDescriptorFromDataUrl(canvasShot2);
      if (!descriptor2) {
        setErrorNote("No face detected in second frame. Try again.");
        setMatchingFlag("idle");
        return;
      }
      const drift = euclideanDistance(descriptor1, descriptor2);
      if (!(drift > 0.02 && drift < 0.35)) {
        setErrorNote("Liveness check failed. Please blink or slightly move and try again.");
        setMatchingFlag("idle");
        return;
      }
      const response = await fetch("/api/verification/face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId,
          faceDescriptor: JSON.stringify(descriptor2),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorNote(data.error || "Unable to complete secure verification. Try again.");
        setMatchingFlag("idle");
        return;
      }
      const data = await response.json();
      if (!data.sessionToken) {
        setErrorNote("Session token missing. Restart verification.");
        setMatchingFlag("idle");
        return;
      }
      const voterHandle = String(voterId);
      setFaceStage(new Float32Array(descriptor2), voterHandle);
      setMatchingFlag("matched");
      sessionStorage.setItem("svp_ticket", String(data.sessionToken));
      onReady();
    } catch {
      setErrorNote("Network error during secure face verification.");
      setMatchingFlag("idle");
    }
  }

  return (
    <div className="np-card np-card-muted p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-(--np-green)/10 flex items-center justify-center text-(--np-green)">
          <ScanFace className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-(--np-ink) uppercase">
            Step 2 · Face Verification
          </span>
          <span className="text-xs text-(--np-ink-muted)">
            A live capture is required to proceed to the ballot.
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-start">
        <div className="relative overflow-hidden rounded-xl border border-(--np-border) bg-black/70 aspect-video flex items-center justify-center">
          <ReactWebcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="h-full w-full object-cover"
            videoConstraints={{ facingMode: "user" }}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="np-pill">
            <Camera className="h-3 w-3" />
            Position your face inside the frame and look directly at the camera.
          </div>
          {!modelsReady && (
            <p className="text-xs text-(--np-ink-muted)">
              Loading face models… (if this never completes, run{" "}
              <span className="font-mono">node scripts/download-face-models.mjs</span>)
            </p>
          )}
          <ul className="space-y-1 text-xs text-(--np-ink-muted)">
            <li>Ensure there is sufficient lighting around your face.</li>
            <li>Remove any objects covering your face where possible.</li>
            <li>Keep your device steady during capture.</li>
          </ul>
          <Button
            type="button"
            size="lg"
            onClick={handleCapture}
            disabled={matchingFlag === "capturing"}
          >
            {matchingFlag === "capturing" ? "Verifying..." : "Capture and Verify"}
          </Button>
          {errorNote && (
            <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {errorNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

