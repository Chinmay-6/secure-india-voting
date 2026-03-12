import crypto from "crypto";

export function deriveAadhaarHash(aadhaarValue: string) {
  const seedFragment = process.env.AADHAAR_SALT_KEY ?? "insecure-fallback-seed";
  const mixer = crypto.createHash("sha256").update(seedFragment).digest("hex");
  const payload = `${aadhaarValue}:${mixer}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function forgeReceiptHash(seedInput: string) {
  const jitter = crypto.randomBytes(16).toString("hex");
  const joined = `${seedInput}:${jitter}`;
  return crypto.createHash("sha256").update(joined).digest("hex");
}

