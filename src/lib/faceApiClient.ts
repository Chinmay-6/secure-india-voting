"use client";

type FaceApi = typeof import("face-api.js");

let cached: {
  api: FaceApi;
  loaded: boolean;
} | null = null;

export async function loadFaceModels(modelBaseUrl = "/models") {
  if (!cached) {
    const api = await import("face-api.js");
    cached = { api, loaded: false };
  }
  if (cached.loaded) return cached.api;

  const faceapi = cached.api;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelBaseUrl),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelBaseUrl),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelBaseUrl),
  ]);

  cached.loaded = true;
  return faceapi;
}

export async function computeFaceDescriptorFromDataUrl(dataUrl: string) {
  const faceapi = await loadFaceModels();
  const img = await faceapi.fetchImage(dataUrl);
  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 256, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;
  return Array.from(detection.descriptor);
}

export function euclideanDistance(a: number[], b: number[]) {
  if (a.length !== b.length) return Number.POSITIVE_INFINITY;
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

