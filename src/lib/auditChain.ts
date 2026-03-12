import { prismaClient } from "@/lib/prisma";
import { sha256Hex } from "@/lib/hash";
import { Prisma } from "@prisma/client";

type AuditActor = {
  actorType?: string;
  actorId?: string;
};

export async function appendAuditBlock(action: string, payload: unknown, actor: AuditActor = {}) {
  const last = await prismaClient.auditBlock.findFirst({
    orderBy: { idx: "desc" },
  });

  const idx = (last?.idx ?? -1) + 1;
  const prevHash = last?.hash ?? "GENESIS";
  const createdAt = new Date();
  const payloadJson: Prisma.InputJsonValue = (payload ?? {}) as Prisma.InputJsonValue;

  const material = JSON.stringify({
    idx,
    prevHash,
    action,
    actorType: actor.actorType ?? null,
    actorId: actor.actorId ?? null,
    createdAt: createdAt.toISOString(),
    payload: payloadJson,
  });

  const hash = sha256Hex(material);

  return prismaClient.auditBlock.create({
    data: {
      idx,
      prevHash,
      hash,
      action,
      actorType: actor.actorType,
      actorId: actor.actorId,
      payload: payloadJson,
      createdAt,
    },
  });
}

