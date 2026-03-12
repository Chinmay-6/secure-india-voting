"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleRegister() {
    setErrorText("");
    if (!/^\d{12}$/.test(aadhaarInput)) {
      setErrorText("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/verification/aadhaar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aadhaar: aadhaarInput,
          displayName: nameInput || undefined,
        }),
      });
      if (!response.ok) {
        setErrorText("Unable to register. Try again.");
        setSubmitting(false);
        return;
      }
      router.push("/verify");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto np-card np-card-muted p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-(--np-saffron)/10 flex items-center justify-center text-(--np-saffron)">
          <IdCard className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-semibold text-(--np-ink)">Voter Registration</h1>
          <p className="text-xs text-(--np-ink-muted)">
            Register your identity before starting the secure verification and voting process.
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
          />
        </label>
        <label className="text-xs font-medium text-(--np-ink-muted)">
          Aadhaar number
          <input
            value={aadhaarInput}
            onChange={(e) => setAadhaarInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
            className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
            placeholder="0000 0000 0000"
            inputMode="numeric"
          />
        </label>
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
        <Button type="button" size="lg" onClick={handleRegister} disabled={submitting}>
          {submitting ? "Registering..." : "Register and verify"}
        </Button>
      </div>
    </div>
  );
}

