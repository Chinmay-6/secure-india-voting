import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { deriveAadhaarHash } from "@/lib/hash";
import { appendAuditBlock } from "@/lib/auditChain";

function normalizeMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  return "";
}

function parseSelfieBase64(dataUrlOrBase64: string) {
  const raw = dataUrlOrBase64.trim();
  if (!raw) return null;
  const match = raw.match(/^data:image\/(png|jpeg|jpg);base64,(.*)$/i);
  const base64 = match ? match[2] : raw;
  try {
    const bytes = Buffer.from(base64, "base64");
    if (bytes.length < 1000) return null;
    if (bytes.length > 1_500_000) return null;
    return bytes;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const payload = await request.json();
  const aadhaarInput = String(payload.aadhaar ?? "").trim();
  const mobileInput = payload.mobile ? String(payload.mobile).trim() : "";
  const selfieBase64 = payload.selfie ? String(payload.selfie).trim() : "";
  const faceDescriptor = payload.faceDescriptor ? String(payload.faceDescriptor).trim() : "";
  const displayNameInput = payload.displayName ? String(payload.displayName).trim().slice(0, 80) : null;
  if (!/^\d{12}$/.test(aadhaarInput)) {
    return NextResponse.json({ error: "Invalid Aadhaar format" }, { status: 400 });
  }
  const mobile = normalizeMobile(mobileInput);
  if (!/^\d{10}$/.test(mobile)) {
    return NextResponse.json({ error: "Invalid mobile format" }, { status: 400 });
  }
  if (!faceDescriptor) {
    return NextResponse.json({ error: "Missing selfie descriptor" }, { status: 400 });
  }
  const selfieBytes = parseSelfieBase64(selfieBase64);
  if (!selfieBytes) {
    return NextResponse.json({ error: "Selfie capture required" }, { status: 400 });
  }
  const hashedAadhaar = deriveAadhaarHash(aadhaarInput);
  const voter = await prismaClient.voter.upsert({
    where: { hashedAadhaar },
    create: {
      hashedAadhaar,
      mobile,
      displayName: displayNameInput ?? undefined,
      isVerified: false,
      hasVoted: false,
      faceDescriptor,
      selfieImage: selfieBytes,
    },
    update: {
      mobile,
      displayName: displayNameInput ?? undefined,
      isVerified: false,
      hasVoted: false,
      faceDescriptor,
      selfieImage: selfieBytes,
    },
  });
  await appendAuditBlock(
    "voter.register",
    {
      voterId: voter.id,
      hasMobile: true,
    },
    { actorType: "voter", actorId: voter.id },
  );
  return NextResponse.json({
    voterId: voter.id,
  });
}

