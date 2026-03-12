import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";

export async function GET() {
  const election = await prismaClient.election.findFirst({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ election: election ?? null });
}

export async function POST(request: Request) {
  const body = await request.json();
  const status = String(body.status ?? "").trim().slice(0, 30);
  if (!status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }
  const election = await prismaClient.election.create({ data: { status } });
  return NextResponse.json({ election });
}

