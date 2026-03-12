import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const id = context.params.id;
  if (!id) {
    return NextResponse.json({ error: "Missing candidate id" }, { status: 400 });
  }
  await prismaClient.vote.deleteMany({
    where: {
      candidateId: id,
    },
  });
  await prismaClient.candidate.delete({
    where: { id },
  });
  return NextResponse.json({ ok: true });
}

