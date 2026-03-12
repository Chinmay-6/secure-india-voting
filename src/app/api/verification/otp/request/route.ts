import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { deriveAadhaarHash, deriveOtpHash } from "@/lib/hash";
import { appendAuditBlock } from "@/lib/auditChain";

function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return "";
}

export async function POST(request: Request) {
  const body = await request.json();
  const aadhaar = String(body.aadhaar ?? "").trim();
  const mobile = normalizeMobile(String(body.mobile ?? "").trim());

  if (!/^\d{12}$/.test(aadhaar)) {
    return NextResponse.json({ error: "Invalid Aadhaar format" }, { status: 400 });
  }
  if (!/^\d{10}$/.test(mobile)) {
    return NextResponse.json({ error: "Invalid mobile format" }, { status: 400 });
  }

  const hashedAadhaar = deriveAadhaarHash(aadhaar);
  const voter = await prismaClient.voter.findUnique({ where: { hashedAadhaar } });
  if (!voter) {
    return NextResponse.json({ error: "Voter not registered" }, { status: 404 });
  }
  if (!voter.mobile) {
    return NextResponse.json({ error: "Mobile number not registered for this Aadhaar" }, { status: 409 });
  }
  if (normalizeMobile(voter.mobile) !== mobile) {
    return NextResponse.json({ error: "Mobile number does not match registration" }, { status: 403 });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const challenge = await prismaClient.voterOtpChallenge.create({
    data: {
      voterId: voter.id,
      otpHash: "PENDING",
      expiresAt,
    },
  });

  const otpHash = deriveOtpHash(otp, challenge.id);
  await prismaClient.voterOtpChallenge.update({
    where: { id: challenge.id },
    data: { otpHash },
  });

  // Simulated SMS delivery (server-side). Integrate provider here in production.
  console.info(`[OTP] voter=${voter.id} mobile=******${mobile.slice(-4)} otp=${otp} exp=${expiresAt.toISOString()}`);

  await appendAuditBlock(
    "otp.requested",
    { voterId: voter.id, expiresAt: expiresAt.toISOString() },
    { actorType: "voter", actorId: voter.id },
  );

  return NextResponse.json({
    ok: true,
    voterId: voter.id,
    challengeId: challenge.id,
    expiresAt,
  });
}

