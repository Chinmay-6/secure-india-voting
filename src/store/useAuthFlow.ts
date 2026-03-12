import { create } from "zustand";

type AuthPhase = "aadhaar" | "face" | "ready";

type AuthSnapshot = {
  phase: AuthPhase;
  aadhaarToken?: string;
  otpShadow?: string;
  voterId?: string;
  voterHandle?: string;
  faceVector?: Float32Array | null;
  sessionKey?: string;
};

type AuthStoreShape = AuthSnapshot & {
  setAadhaarStage: (aadhaarToken: string, otpShadow: string) => void;
  registerVoterId: (voterId: string) => void;
  setFaceStage: (vector: Float32Array, voterHandle: string) => void;
  setCompleted: (sessionKey: string) => void;
  resetFlow: () => void;
};

export const useAuthFlowStore = create<AuthStoreShape>((set) => ({
  phase: "aadhaar",
  aadhaarToken: undefined,
  otpShadow: undefined,
  voterId: undefined,
  voterHandle: undefined,
  faceVector: null,
  sessionKey: undefined,
  setAadhaarStage: (aadhaarToken, otpShadow) =>
    set(() => ({
      phase: "face",
      aadhaarToken,
      otpShadow,
    })),
  registerVoterId: (voterId) =>
    set((prev) => ({
      ...prev,
      voterId,
    })),
  setFaceStage: (vector, voterHandle) =>
    set((prev) => ({
      ...prev,
      phase: "ready",
      faceVector: vector,
      voterHandle,
    })),
  setCompleted: (sessionKey) =>
    set((prev) => ({
      ...prev,
      sessionKey,
    })),
  resetFlow: () =>
    set(() => ({
      phase: "aadhaar",
      aadhaarToken: undefined,
      otpShadow: undefined,
      voterHandle: undefined,
      faceVector: null,
      sessionKey: undefined,
    })),
}));

