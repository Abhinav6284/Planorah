const fs = require('fs');
const path = require('path');

const packageDir = path.join(__dirname, '..', 'node_modules', '@mediapipe', 'tasks-vision');
const targetMapPath = path.join(packageDir, 'vision_bundle_mjs.js.map');

function ensureMediapipeSourceMap() {
  if (!fs.existsSync(packageDir)) {
    console.log('[mediapipe-sourcemap] Package not installed; skipping.');
    return;
  }

  if (fs.existsSync(targetMapPath)) {
    console.log('[mediapipe-sourcemap] Source map already present.');
    return;
  }

  const minimalSourceMap = {
    version: 3,
    file: 'vision_bundle.mjs',
    sources: ['vision_bundle.mjs'],
    sourcesContent: [''],
    names: [],
    mappings: '',
  };

  fs.writeFileSync(targetMapPath, `${JSON.stringify(minimalSourceMap)}\n`, 'utf8');
  console.log('[mediapipe-sourcemap] Created missing vision_bundle_mjs.js.map');
}

ensureMediapipeSourceMap();
