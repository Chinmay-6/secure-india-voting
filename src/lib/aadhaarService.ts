import { getAadhaarConfig } from "@/lib/aadhaarConfig";

type AuthenticateResponse = {
  code?: number;
  data?: {
    access_token?: string;
  };
};

type GenerateOtpResponse = {
  code?: number;
  data?: {
    transaction_id?: string;
    reference_id?: string;
  };
};

type VerifyOtpResponse = {
  code?: number;
  data?: {
    status?: string;
    message?: string;
    name?: string;
  };
};

export async function getAadhaarAccessToken() {
  const { baseUrl, apiKey, apiSecret } = getAadhaarConfig();
  const res = await fetch(`${baseUrl}/authenticate`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "x-api-secret": apiSecret,
      "x-api-version": "1.0",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AADHAAR authenticate failed: ${res.status} ${body}`);
  }
  const json = (await res.json().catch(() => ({}))) as AuthenticateResponse;
  const token = json.data?.access_token;
  if (!token) {
    throw new Error("AADHAAR authenticate missing access_token");
  }
  return token;
}

export async function generateAadhaarOtp(aadhaarNumber: string) {
  const { baseUrl, apiKey } = getAadhaarConfig();
  const token = await getAadhaarAccessToken();
  const res = await fetch(`${baseUrl}/kyc/aadhaar/okyc/otp`, {
    method: "POST",
    headers: {
      Authorization: token,
      "x-api-key": apiKey,
      "x-api-version": "1.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
      aadhaar_number: aadhaarNumber,
      consent: "Y",
      reason: "Voter Aadhaar verification",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AADHAAR OTP generate failed: ${res.status} ${body}`);
  }
  const json = (await res.json().catch(() => ({}))) as GenerateOtpResponse;
  const transactionId = json.data?.transaction_id;
  const referenceId = json.data?.reference_id;
  if (!transactionId || !referenceId) {
    throw new Error("AADHAAR OTP generate missing transaction identifiers");
  }
  return { transactionId, referenceId };
}

export async function verifyAadhaarOtp(referenceId: string, otp: string) {
  const { baseUrl, apiKey } = getAadhaarConfig();
  const token = await getAadhaarAccessToken();
  const res = await fetch(`${baseUrl}/kyc/aadhaar/okyc/otp/verify`, {
    method: "POST",
    headers: {
      Authorization: token,
      "x-api-key": apiKey,
      "x-api-version": "1.0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
      reference_id: referenceId,
      otp,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AADHAAR OTP verify failed: ${res.status} ${body}`);
  }
  const json = (await res.json().catch(() => ({}))) as VerifyOtpResponse;
  const status = json.data?.status ?? "UNKNOWN";
  const message = json.data?.message ?? "";
  const name = json.data?.name ?? null;
  return { status, message, name };
}


