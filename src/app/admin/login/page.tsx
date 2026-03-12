import { Suspense } from "react";
import { AdminLoginClient } from "./AdminLoginClient";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto np-card p-6">Loading…</div>}>
      <AdminLoginClient />
    </Suspense>
  );
}

