import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const party = String(body.party ?? "").trim();
  const symbol = String(body.symbol ?? "").trim();
  const bio = String(body.bio ?? "").trim();
  if (!name || !party) {
    return NextResponse.json({ error: "Missing name or party" }, { status: 400 });
  }
  const candidate = await prismaClient.candidate.create({
    data: {
      name,
      party,
      symbol: symbol || name.charAt(0),
      bio: bio || "Registered party candidate.",
    },
  });
  return NextResponse.json(candidate);
}

