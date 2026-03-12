import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prismaClient } from "@/lib/prisma";
import { appendAuditBlock } from "@/lib/auditChain";

export async function POST(request: Request) {
  const body = await request.json();
  const voterId = String(body.voterId ?? "");
  const liveDescriptor = body.faceDescriptor ? String(body.faceDescriptor) : "";
  if (!voterId || !liveDescriptor) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const voter = await prismaClient.voter.findUnique({
    where: { id: voterId },
  });
  if (!voter) {
    return NextResponse.json({ error: "Voter not found" }, { status: 404 });
  }
  const threshold = Number(process.env.FACE_MATCH_THRESHOLD ?? "0.55");
  if (!Number.isFinite(threshold) || threshold < 0.1 || threshold > 2) {
    return NextResponse.json({ error: "Server threshold misconfigured" }, { status: 500 });
  }

  let registered: number[] | null = null;
  let live: number[] | null = null;
  try {
    registered = voter.faceDescriptor ? (JSON.parse(voter.faceDescriptor) as number[]) : null;
    live = JSON.parse(liveDescriptor) as number[];
  } catch {
    return NextResponse.json({ error: "Face descriptor invalid" }, { status: 409 });
  }
  if (!registered || !Array.isArray(registered) || registered.length !== 128) {
    return NextResponse.json({ error: "Registered face missing. Please re-register." }, { status: 409 });
  }
  if (!live || !Array.isArray(live) || live.length !== 128) {
    return NextResponse.json({ error: "Live face descriptor invalid" }, { status: 400 });
  }

  let sum = 0;
  for (let i = 0; i < 128; i += 1) {
    const d = registered[i] - live[i];
    sum += d * d;
  }
  const dist = Math.sqrt(sum);

  if (dist > threshold) {
    await appendAuditBlock(
      "face.mismatch",
      { voterId, distance: dist, threshold },
      { actorType: "voter", actorId: voterId },
    );
    return NextResponse.json({ error: "Face verification failed" }, { status: 403 });
  }

  const sessionToken = `st_${randomUUID()}`;
  await prismaClient.voter.update({
    where: { id: voterId },
    data: {
      isVerified: true,
      sessionToken,
    },
  });
  await appendAuditBlock(
    "face.verified",
    { voterId, distance: dist, threshold },
    { actorType: "voter", actorId: voterId },
  );
  return NextResponse.json({
    sessionToken,
  });
}

