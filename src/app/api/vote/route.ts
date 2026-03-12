import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { forgeReceiptHash } from "@/lib/hash";
import { appendAuditBlock } from "@/lib/auditChain";
import { anchorReceiptToFabric } from "@/lib/fabricAnchor";

export async function POST(request: Request) {
  const token = request.headers.get("x-session-token") || "";
  if (!token) {
    return NextResponse.json({ error: "Missing session" }, { status: 401 });
  }
  const body = await request.json();
  const candidateId = String(body.candidateId ?? "");
  if (!candidateId) {
    return NextResponse.json({ error: "Missing candidate" }, { status: 400 });
  }
  const voter = await prismaClient.voter.findUnique({
    where: { sessionToken: token },
  });
  if (!voter || !voter.isVerified) {
    return NextResponse.json({ error: "Verification required" }, { status: 403 });
  }
  if (voter.hasVoted) {
    return NextResponse.json({ error: "Voter has already cast a ballot" }, { status: 409 });
  }
  const candidate = await prismaClient.candidate.findUnique({
    where: { id: candidateId },
  });
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
  const receiptSeed = `${voter.id}:${candidate.id}:${Date.now()}`;
  const receiptHash = forgeReceiptHash(receiptSeed);
  const vote = await prismaClient.vote.create({
    data: {
      candidateId: candidate.id,
      voterId: voter.id,
      receiptHash,
    },
  });
  await prismaClient.voter.update({
    where: { id: voter.id },
    data: {
      hasVoted: true,
    },
  });
  await appendAuditBlock(
    "vote.cast",
    { voterId: voter.id, candidateId: candidate.id, receiptHash: vote.receiptHash },
    { actorType: "voter", actorId: voter.id },
  );

  const anchored = await anchorReceiptToFabric({ receiptHash: vote.receiptHash, issuedAt: vote.timestamp });
  await appendAuditBlock(
    "vote.anchor.fabric",
    {
      receiptHash: vote.receiptHash,
      payloadHash: anchored.payloadHash,
      ok: anchored.ok,
      mode: anchored.mode,
      txId: anchored.ok ? anchored.txId : null,
      blockNumber: anchored.ok ? anchored.blockNumber : null,
      status: anchored.ok ? null : (anchored as any).status ?? null,
    },
    { actorType: "system", actorId: "fabric" },
  );

  return NextResponse.json({
    id: vote.id,
    receiptHash: vote.receiptHash,
    timestamp: vote.timestamp,
  });
}

