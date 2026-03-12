import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { deriveAadhaarHash } from "@/lib/hash";

export async function POST(request: Request) {
  const payload = await request.json();
  const aadhaarInput = String(payload.aadhaar ?? "").trim();
  const displayNameInput = payload.displayName ? String(payload.displayName).trim().slice(0, 80) : null;
  if (!/^\d{12}$/.test(aadhaarInput)) {
    return NextResponse.json({ error: "Invalid Aadhaar format" }, { status: 400 });
  }
  const hashedAadhaar = deriveAadhaarHash(aadhaarInput);
  const voter = await prismaClient.voter.upsert({
    where: { hashedAadhaar },
    create: {
      hashedAadhaar,
      displayName: displayNameInput ?? undefined,
      isVerified: false,
      hasVoted: false,
      faceDescriptor: "",
    },
    update: {
      displayName: displayNameInput ?? undefined,
      isVerified: false,
      hasVoted: false,
    },
  });
  return NextResponse.json({
    voterId: voter.id,
  });
}

