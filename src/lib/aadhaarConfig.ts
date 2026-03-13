type AadhaarConfig = {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
};

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAadhaarConfig(): AadhaarConfig {
  const baseUrl = process.env.AADHAAR_BASE_URL || "https://api.sandbox.co.in";
  const apiKey = requireEnv("AADHAAR_API_KEY", process.env.AADHAAR_API_KEY);
  const apiSecret = requireEnv("AADHAAR_API_SECRET", process.env.AADHAAR_API_SECRET);
  return { baseUrl, apiKey, apiSecret };
}

