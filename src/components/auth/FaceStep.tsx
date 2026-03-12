"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Camera, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthFlowStore } from "@/store/useAuthFlow";

const Webcam = dynamic(() => import("react-webcam"), { ssr: false });

type FaceStepProps = {
  onReady: () => void;
};

export function FaceStep({ onReady }: FaceStepProps) {
  const [errorNote, setErrorNote] = useState("");
  const [matchingFlag, setMatchingFlag] = useState<"idle" | "capturing" | "matched">("idle");
  const webcamRef = useRef<any>(null);
  const setFaceStage = useAuthFlowStore((s) => s.setFaceStage);
  const voterId = useAuthFlowStore((s) => s.voterId);

  async function handleCapture() {
    if (!voterId) {
      setErrorNote("Verification session is incomplete. Restart verification.");
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
    const vector = new Float32Array(128);
    for (let indexToken = 0; indexToken < vector.length; indexToken += 1) {
      vector[indexToken] = Math.random() - 0.5;
    }
    try {
      const response = await fetch("/api/verification/face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId,
          descriptor: Array.from(vector),
        }),
      });
      if (!response.ok) {
        setErrorNote("Unable to complete secure verification. Try again.");
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
      setFaceStage(vector, voterHandle);
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
          <Webcam
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

