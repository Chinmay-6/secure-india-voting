import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { deriveAadhaarHash } from "@/lib/hash";

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
    const hashedAadhaar = deriveAadhaarHash(aadhaarValue);
    await prismaClient.voter.upsert({
      where: { hashedAadhaar },
      create: {
        hashedAadhaar,
        isVerified: true,
        hasVoted: false,
        displayName: undefined,
      },
      update: {
        isVerified: true,
        displayName: undefined,
      },
    });

    console.info("AADHAAR identity marked verified without remote OTP check (dev mode)", {
      aadhaarMasked: maskedAadhaar,
      referenceId,
    });

    return NextResponse.json({
      ok: true,
      aadhaarMasked: maskedAadhaar,
      name: null,
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

