import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";

export async function GET() {
  const [totalVoters, verifiedVoters, votedCount, candidateWithVotes] = await Promise.all([
    prismaClient.voter.count(),
    prismaClient.voter.count({ where: { isVerified: true } }),
    prismaClient.vote.count(),
    prismaClient.candidate.findMany({
      include: {
        votes: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);
  return NextResponse.json({
    totalVoters,
    verifiedVoters,
    votedCount,
    candidates: candidateWithVotes.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      symbol: c.symbol,
      bio: c.bio,
      votes: c.votes.length,
    })),
  });
}

