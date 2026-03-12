import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/prisma";
import { appendAuditBlock } from "@/lib/auditChain";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing candidate id" }, { status: 400 });
  }
  const existing = await prismaClient.candidate.findUnique({ where: { id } });
  await prismaClient.vote.deleteMany({
    where: {
      candidateId: id,
    },
  });
  await prismaClient.candidate.delete({
    where: { id },
  });
  await appendAuditBlock(
    "admin.candidate.delete",
    { candidateId: id, name: existing?.name ?? null, party: existing?.party ?? null },
    { actorType: "admin", actorId: "admin" },
  );
  return NextResponse.json({ ok: true });
}

