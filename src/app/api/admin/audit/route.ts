import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";

export async function GET() {
  const blocks = await prismaClient.auditBlock.findMany({
    orderBy: { idx: "desc" },
    take: 50,
  });
  return NextResponse.json({ blocks });
}

