import crypto from "crypto";

export function deriveAadhaarHash(aadhaarValue: string) {
  const seedFragment = process.env.AADHAAR_SALT_KEY ?? "insecure-fallback-seed";
  const mixer = crypto.createHash("sha256").update(seedFragment).digest("hex");
  const payload = `${aadhaarValue}:${mixer}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function deriveMobileHash(mobileValue: string) {
  const seedFragment = process.env.MOBILE_SALT_KEY ?? process.env.AADHAAR_SALT_KEY ?? "insecure-fallback-seed";
  const mixer = crypto.createHash("sha256").update(seedFragment).digest("hex");
  const payload = `${mobileValue}:${mixer}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function deriveOtpHash(otpValue: string, challengeId: string) {
  const seedFragment = process.env.OTP_SALT_KEY ?? process.env.AADHAAR_SALT_KEY ?? "insecure-fallback-seed";
  const mixer = crypto.createHash("sha256").update(seedFragment).digest("hex");
  const payload = `${otpValue}:${challengeId}:${mixer}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function forgeReceiptHash(seedInput: string) {
  const jitter = crypto.randomBytes(16).toString("hex");
  const joined = `${seedInput}:${jitter}`;
  return crypto.createHash("sha256").update(joined).digest("hex");
}

export function sha256Hex(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

