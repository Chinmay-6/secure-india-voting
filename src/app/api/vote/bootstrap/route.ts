import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";

export async function GET(request: Request) {
  const token = request.headers.get("x-session-token") || "";
  if (!token) {
    return NextResponse.json({ error: "Missing session" }, { status: 401 });
  }
  const voter = await prismaClient.voter.findUnique({
    where: { sessionToken: token },
  });
  if (!voter || !voter.isVerified) {
    return NextResponse.json({ error: "Verification required" }, { status: 403 });
  }
  if (voter.hasVoted) {
    return NextResponse.json({ alreadyVoted: true }, { status: 200 });
  }
  const candidates = await prismaClient.candidate.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({
    voterId: voter.id,
    candidates,
  });
}

