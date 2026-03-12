import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { prismaClient } from "@/lib/prisma";
import { deriveAadhaarHash } from "@/lib/hash";
import { appendAuditBlock } from "@/lib/auditChain";

function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return "";
}

export async function POST(request: Request) {
  const payload = await request.json();
  const aadhaarInput = String(payload.aadhaar ?? "").trim();
  const mobileInput = payload.mobile ? String(payload.mobile).trim() : "";
  if (!/^\d{12}$/.test(aadhaarInput)) {
    return NextResponse.json({ error: "Invalid Aadhaar format" }, { status: 400 });
  }
  const mobile = normalizeMobile(mobileInput);
  if (!/^\d{10}$/.test(mobile)) {
    return NextResponse.json({ error: "Invalid mobile format" }, { status: 400 });
  }
  const hashedAadhaar = deriveAadhaarHash(aadhaarInput);
  const voter = await prismaClient.voter.findUnique({ where: { hashedAadhaar } });
  if (!voter) {
    return NextResponse.json({ error: "Voter not registered" }, { status: 404 });
  }
  if (!voter.mobile || voter.mobile !== mobile) {
    return NextResponse.json({ error: "Mobile number does not match Aadhaar registration" }, { status: 403 });
  }

  const otpCode = String(Math.floor(100000 + Math.random() * 900000));
  const otpSalt = randomBytes(16).toString("hex");
  const otpHash = createHash("sha256").update(`${otpCode}:${otpSalt}`).digest("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const challenge = await prismaClient.voterOtpChallenge.create({
    data: {
      voterId: voter.id,
      otpHash: `${otpSalt}.${otpHash}`,
      expiresAt,
    },
  });

  console.info("VOTEXA OTP:", otpCode, "Mobile:", mobile);

  await appendAuditBlock(
    "voter.otp.send",
    {
      voterId: voter.id,
      mobileLast4: mobile.slice(-4),
      challengeId: challenge.id,
    },
    { actorType: "voter", actorId: voter.id },
  );
  return NextResponse.json({
    voterId: voter.id,
    challengeId: challenge.id,
    mobileMasked: `******${mobile.slice(-4)}`,
  });
}

