import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";

export async function GET() {
  const voters = await prismaClient.voter.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      mobileLast4: true,
      displayName: true,
      isVerified: true,
      hasVoted: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ voters });
}

