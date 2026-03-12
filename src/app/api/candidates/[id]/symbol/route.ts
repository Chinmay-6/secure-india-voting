import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const candidate = await prismaClient.candidate.findUnique({
    where: { id },
    select: { symbolImage: true, symbolImageMime: true },
  });
  if (!candidate || !candidate.symbolImage) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(candidate.symbolImage, {
    status: 200,
    headers: {
      "Content-Type": candidate.symbolImageMime || "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

