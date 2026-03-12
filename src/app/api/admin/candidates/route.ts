import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { appendAuditBlock } from "@/lib/auditChain";

function parseBase64File(dataUrlOrBase64: string) {
  const raw = dataUrlOrBase64.trim();
  if (!raw) return null;
  const match = raw.match(/^data:([^;]+);base64,(.*)$/i);
  const base64 = match ? match[2] : raw;
  const mime = match ? match[1] : null;
  try {
    const bytes = Buffer.from(base64, "base64");
    return { bytes, mime };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const party = String(body.party ?? "").trim();
  const symbol = String(body.symbol ?? "").trim();
  const bio = String(body.bio ?? "").trim();
  const symbolImageInput = body.symbolImage ? String(body.symbolImage) : "";
  const verificationDocInput = body.verificationDoc ? String(body.verificationDoc) : "";
  const verificationDetails = body.verificationDetails ? String(body.verificationDetails).trim().slice(0, 400) : "";
  if (!name || !party) {
    return NextResponse.json({ error: "Missing name or party" }, { status: 400 });
  }

  const symbolFile = symbolImageInput ? parseBase64File(symbolImageInput) : null;
  const verificationFile = verificationDocInput ? parseBase64File(verificationDocInput) : null;

  const candidate = await prismaClient.candidate.create({
    data: {
      name,
      party,
      symbol: symbol || name.charAt(0),
      bio: bio || "Registered party candidate.",
      symbolImage: symbolFile?.bytes,
      symbolImageMime: symbolFile?.mime ?? undefined,
      verificationDoc: verificationFile?.bytes,
      verificationDocMime: verificationFile?.mime ?? undefined,
      verificationDetails: verificationDetails || undefined,
    },
  });
  await appendAuditBlock(
    "admin.candidate.create",
    { candidateId: candidate.id, name: candidate.name, party: candidate.party },
    { actorType: "admin", actorId: "admin" },
  );
  return NextResponse.json(candidate);
}

