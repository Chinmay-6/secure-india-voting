"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usernameDraft, setUsernameDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleLogin() {
    setErrorText("");
    if (!usernameDraft || !passwordDraft) {
      setErrorText("Enter both username and password.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: usernameDraft,
          password: passwordDraft,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setErrorText(data.error || "Unable to sign in.");
        setSubmitting(false);
        return;
      }
      const redirectTarget = searchParams.get("redirect") || "/admin/dashboard";
      router.replace(redirectTarget);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto np-card np-card-muted p-6 sm:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-(--np-ink) text-(--np-white) flex items-center justify-center">
          <Lock className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-semibold text-(--np-ink)">Administrator sign in</h1>
          <p className="text-xs text-(--np-ink-muted)">
            Only authorised election officers should access the control console.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-xs font-medium text-(--np-ink-muted)">
          Username
          <input
            value={usernameDraft}
            onChange={(e) => setUsernameDraft(e.target.value)}
            className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
          />
        </label>
        <label className="text-xs font-medium text-(--np-ink-muted)">
          Password
          <input
            type="password"
            value={passwordDraft}
            onChange={(e) => setPasswordDraft(e.target.value)}
            className="mt-1 w-full rounded-lg border border-(--np-border) bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--np-saffron)"
          />
        </label>
        {errorText && (
          <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {errorText}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="np-pill">
          <ShieldCheck className="h-3 w-3" />
          Credentials are validated on the server.
        </div>
        <Button type="button" size="lg" onClick={handleLogin} disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </div>
  );
}

