import { create } from "zustand";

type AuthPhase = "aadhaar" | "face" | "ready";

type AuthSnapshot = {
  phase: AuthPhase;
  aadhaarToken?: string;
  challengeId?: string;
  mobileToken?: string;
  voterId?: string;
  voterHandle?: string;
  faceVector?: Float32Array | null;
  sessionKey?: string;
};

type AuthStoreShape = AuthSnapshot & {
  setAadhaarStage: (aadhaarToken: string, mobileToken: string, challengeId: string) => void;
  registerVoterId: (voterId: string) => void;
  setFaceStage: (vector: Float32Array, voterHandle: string) => void;
  setCompleted: (sessionKey: string) => void;
  resetFlow: () => void;
};

export const useAuthFlowStore = create<AuthStoreShape>((set) => ({
  phase: "aadhaar",
  aadhaarToken: undefined,
  challengeId: undefined,
  mobileToken: undefined,
  voterId: undefined,
  voterHandle: undefined,
  faceVector: null,
  sessionKey: undefined,
  setAadhaarStage: (aadhaarToken, mobileToken, challengeId) =>
    set(() => ({
      phase: "aadhaar",
      aadhaarToken,
      mobileToken,
      challengeId,
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
      challengeId: undefined,
      mobileToken: undefined,
      voterId: undefined,
      voterHandle: undefined,
      faceVector: null,
      sessionKey: undefined,
    })),
}));

