import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { deriveOtpHash } from "@/lib/hash";
import { appendAuditBlock } from "@/lib/auditChain";

export async function POST(request: Request) {
  const body = await request.json();
  const challengeId = String(body.challengeId ?? "").trim();
  const otp = String(body.otp ?? "").trim().replace(/\D/g, "");

  if (!challengeId) {
    return NextResponse.json({ error: "Missing challenge" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
  }

  const challenge = await prismaClient.voterOtpChallenge.findUnique({
    where: { id: challengeId },
    include: { voter: true },
  });
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }
  if (challenge.usedAt) {
    return NextResponse.json({ error: "OTP already used" }, { status: 409 });
  }
  if (challenge.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "OTP expired" }, { status: 410 });
  }
  if (challenge.attempts >= 5) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const expectedHash = deriveOtpHash(otp, challenge.id);
  const ok = expectedHash === challenge.otpHash;

  await prismaClient.voterOtpChallenge.update({
    where: { id: challenge.id },
    data: {
      attempts: { increment: 1 },
      usedAt: ok ? new Date() : undefined,
    },
  });

  if (!ok) {
    await appendAuditBlock(
      "otp.failed",
      { voterId: challenge.voterId, challengeId: challenge.id },
      { actorType: "voter", actorId: challenge.voterId },
    );
    return NextResponse.json({ error: "Incorrect OTP" }, { status: 401 });
  }

  await appendAuditBlock(
    "otp.verified",
    { voterId: challenge.voterId, challengeId: challenge.id },
    { actorType: "voter", actorId: challenge.voterId },
  );

  return NextResponse.json({ ok: true, voterId: challenge.voterId });
}

