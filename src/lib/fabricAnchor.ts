import { sha256Hex } from "@/lib/hash";

type AnchorPayload = {
  receiptHash: string;
  issuedAt: string;
  version: string;
};

export async function anchorReceiptToFabric(input: { receiptHash: string; issuedAt: Date }) {
  const url = process.env.FABRIC_ANCHOR_URL ?? "";
  const apiKey = process.env.FABRIC_ANCHOR_API_KEY ?? "";
  const payload: AnchorPayload = {
    receiptHash: input.receiptHash,
    issuedAt: input.issuedAt.toISOString(),
    version: "v1",
  };
  const payloadHash = sha256Hex(JSON.stringify(payload));

  if (!url) {
    return { ok: false as const, mode: "disabled" as const, payloadHash };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false as const, mode: "remote" as const, payloadHash, status: res.status, body };
  }

  const data = await res.json().catch(() => ({}));
  const txId = typeof data.txId === "string" ? data.txId : null;
  const blockNumber = typeof data.blockNumber === "number" ? data.blockNumber : null;
  return { ok: true as const, mode: "remote" as const, payloadHash, txId, blockNumber };
}

