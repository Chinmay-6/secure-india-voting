import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prismaClient } from "@/lib/prisma";
import { appendAuditBlock } from "@/lib/auditChain";

export async function POST(request: Request) {
  const body = await request.json();
  const challengeId = String(body.challengeId ?? "").trim();
  const otp = String(body.otp ?? "").trim().replace(/\D/g, "");
  if (!challengeId || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const challenge = await prismaClient.voterOtpChallenge.findUnique({
    where: { id: challengeId },
  });
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }
  if (challenge.usedAt) {
    return NextResponse.json({ error: "Challenge already used" }, { status: 409 });
  }
  if (challenge.attempts >= 5) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  if (challenge.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "OTP expired" }, { status: 410 });
  }
  const [salt, hash] = challenge.otpHash.split(".");
  if (!salt || !hash) {
    return NextResponse.json({ error: "Challenge corrupted" }, { status: 500 });
  }
  const computed = createHash("sha256").update(`${otp}:${salt}`).digest("hex");
  const ok = computed === hash;
  await prismaClient.voterOtpChallenge.update({
    where: { id: challenge.id },
    data: {
      attempts: { increment: 1 },
      usedAt: ok ? new Date() : undefined,
    },
  });
  if (!ok) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }
  await appendAuditBlock(
    "voter.otp.verify",
    { voterId: challenge.voterId, challengeId: challenge.id },
    { actorType: "voter", actorId: challenge.voterId }
  );
  return NextResponse.json({ ok: true, voterId: challenge.voterId });
}

