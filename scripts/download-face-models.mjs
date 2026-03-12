import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const base = "https://raw.githubusercontent.com/vsnaveen96/face-api-models/master";
const files = [
  "tiny_face_detector_model-weights_manifest.json",
  "tiny_face_detector_model-shard1",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model.bin",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
];

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed ${res.status} ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

const outDir = join(process.cwd(), "public", "models");
await mkdir(outDir, { recursive: true });

for (const f of files) {
  const data = await download(`${base}/${f}`);
  await writeFile(join(outDir, f), data);
  process.stdout.write(`Downloaded ${f}\n`);
}

