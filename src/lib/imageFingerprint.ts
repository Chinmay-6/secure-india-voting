export type DHashDescriptor = {
  kind: "dhash64";
  bits: string; // 64 chars of '0'/'1'
};

export function parseDescriptor(raw: string | null | undefined): DHashDescriptor | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && obj.kind === "dhash64" && typeof obj.bits === "string" && /^[01]{64}$/.test(obj.bits)) {
      return obj as DHashDescriptor;
    }
    return null;
  } catch {
    return null;
  }
}

export function hammingDistance(a: string, b: string) {
  if (a.length !== b.length) return Number.POSITIVE_INFINITY;
  let dist = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (a.charCodeAt(i) !== b.charCodeAt(i)) dist += 1;
  }
  return dist;
}

