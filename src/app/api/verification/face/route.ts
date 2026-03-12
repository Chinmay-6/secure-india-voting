import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const voterId = String(body.voterId ?? "");
  const descriptor = body.descriptor;
  if (!voterId || !Array.isArray(descriptor) || descriptor.length === 0) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const voter = await prismaClient.voter.findUnique({
    where: { id: voterId },
  });
  if (!voter) {
    return NextResponse.json({ error: "Voter not found" }, { status: 404 });
  }
  const sessionToken = `st_${randomUUID()}`;
  await prismaClient.voter.update({
    where: { id: voterId },
    data: {
      isVerified: true,
      sessionToken,
      faceDescriptor: JSON.stringify(descriptor),
    },
  });
  return NextResponse.json({
    sessionToken,
  });
}

