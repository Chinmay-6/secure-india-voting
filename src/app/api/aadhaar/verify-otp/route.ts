import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { deriveAadhaarHash } from "@/lib/hash";
import { verifyAadhaarOtp } from "@/lib/aadhaarService";

export async function POST(request: Request) {
  const body = await request.json();
  const referenceId = String(body.referenceId ?? body.reference_id ?? "").trim();
  const otp = String(body.otp ?? "").trim();
  const rawAadhaar = body.aadhaarNumber ?? body.aadhaar ?? "";
  const aadhaarValue = String(rawAadhaar).replace(/\D/g, "");

  if (!referenceId) {
    return NextResponse.json({ error: "Missing referenceId" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
  }
  if (!/^\d{12}$/.test(aadhaarValue)) {
    return NextResponse.json({ error: "Invalid Aadhaar format" }, { status: 400 });
  }

  const maskedAadhaar = `********${aadhaarValue.slice(-4)}`;

  try {
    const { status, message, name } = await verifyAadhaarOtp(referenceId, otp);
    if (status !== "SUCCESS") {
      return NextResponse.json(
        { error: message || "Aadhaar KYC failed", aadhaarMasked: maskedAadhaar, kycStatus: status },
        { status: 409 },
      );
    }

    const hashedAadhaar = deriveAadhaarHash(aadhaarValue);
    await prismaClient.voter.upsert({
      where: { hashedAadhaar },
      create: {
        hashedAadhaar,
        isVerified: true,
        hasVoted: false,
        displayName: name || undefined,
      },
      update: {
        isVerified: true,
        displayName: name || undefined,
      },
    });

    console.info("AADHAAR OTP verified", {
      aadhaarMasked: maskedAadhaar,
      referenceId,
      kycStatus: status,
    });

    return NextResponse.json({
      ok: true,
      aadhaarMasked: maskedAadhaar,
      kycStatus: status,
      name: name ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AADHAAR service error";
    return NextResponse.json(
      { error: message, aadhaarMasked: maskedAadhaar },
      { status: 502 },
    );
  }
}

