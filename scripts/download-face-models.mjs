import fs from "node:fs/promises";
import path from "node:path";

const BASE =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/";

const FILES = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
];

const outDir = path.join(process.cwd(), "public", "models");

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

await fs.mkdir(outDir, { recursive: true });

for (const file of FILES) {
  const url = `${BASE}${file}`;
  const dest = path.join(outDir, file);
  console.log("Downloading", file);
  const buf = await download(url);
  await fs.writeFile(dest, buf);
}

console.log("Done. Models are available at /models/*");

