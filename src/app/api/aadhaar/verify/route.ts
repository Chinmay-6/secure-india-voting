import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { deriveAadhaarHash } from "@/lib/hash";
import { generateAadhaarOtp } from "@/lib/aadhaarService";

export async function POST(request: Request) {
  const body = await request.json();
  const rawInput = body.aadhaarNumber ?? body.aadhaar ?? "";
  const aadhaarValue = String(rawInput).replace(/\D/g, "");
  if (!/^\d{12}$/.test(aadhaarValue)) {
    return NextResponse.json({ error: "Invalid Aadhaar format" }, { status: 400 });
  }
  const maskedAadhaar = `********${aadhaarValue.slice(-4)}`;
  try {
    const { transactionId, referenceId } = await generateAadhaarOtp(aadhaarValue);
    const hashedAadhaar = deriveAadhaarHash(aadhaarValue);
    await prismaClient.voter.upsert({
      where: { hashedAadhaar },
      create: {
        hashedAadhaar,
        isVerified: false,
        hasVoted: false,
      },
      update: {
        isVerified: false,
      },
    });
    console.info("AADHAAR OTP requested", {
      aadhaarMasked: maskedAadhaar,
      transactionId,
      referenceId,
    });
    return NextResponse.json({
      ok: true,
      transactionId,
      referenceId,
      aadhaarMasked: maskedAadhaar,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AADHAAR service error";
    return NextResponse.json({ error: message, aadhaarMasked: maskedAadhaar }, { status: 502 });
  }
}

