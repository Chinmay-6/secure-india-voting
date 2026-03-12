## Face verification models

This project uses `face-api.js` in the browser for realtime face descriptor extraction.

Download the following model files into this folder (so they are served at `/models/...`):

- `tiny_face_detector_model-weights_manifest.json`
- `tiny_face_detector_model-shard1`
- `face_landmark_68_model-weights_manifest.json`
- `face_landmark_68_model-shard1`
- `face_recognition_model-weights_manifest.json`
- `face_recognition_model-shard1`
- `face_recognition_model-shard2`

Quick download (Windows PowerShell):

```powershell
node scripts/download-face-models.mjs
```

