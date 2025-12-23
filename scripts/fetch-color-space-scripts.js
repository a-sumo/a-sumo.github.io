#!/usr/bin/env node

/**
 * Fetches TypeScript generator scripts, shader files, and docs from the
 * specs-samples GitHub repo and saves them to the local assets folder.
 *
 * Usage: node scripts/fetch-color-space-scripts.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/a-sumo/specs-samples/main/Color-Spaces';
const LOCAL_ASSETS_PATH = path.join(__dirname, '../public/assets/visualizing-color-spaces-in-ar-glasses/scripts');

// Files to fetch: [GitHub path (relative to Color-Spaces), local filename]
const FILES = [
  // TypeScript generator scripts
  ['Assets/Scripts/Generators/RGBCubeGenerator.ts', 'RGBCubeGenerator.ts'],
  ['Assets/Scripts/Generators/PigmentGamutMeshGenerator.ts', 'PigmentGamutMeshGenerator.ts'],
  ['Assets/Scripts/Generators/GamutProjectionMeshGenerator.ts', 'GamutProjectionMeshGenerator.ts'],

  // Shader files (GLSL custom code nodes)
  ['Assets/Shaders/ColorSpaceTransform.js', 'full_space_mat.txt'],
  ['Assets/Shaders/ColorSpaceTransform.js', 'pigment_gamut_mat.txt'],  // Same shader, different use
  ['Assets/Shaders/ProjectorGamutTransform.js', 'projector_mat.txt'],

  // Documentation
  ['custom_code_node_spec.md', 'custom_code_node_spec.md'],
];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('Fetching files from GitHub...\n');

  // Ensure local directory exists
  if (!fs.existsSync(LOCAL_ASSETS_PATH)) {
    fs.mkdirSync(LOCAL_ASSETS_PATH, { recursive: true });
  }

  const results = [];
  const fetched = new Map(); // Cache to avoid duplicate fetches

  for (const [githubPath, localName] of FILES) {
    const url = `${GITHUB_RAW_BASE}/${githubPath}`;
    const localPath = path.join(LOCAL_ASSETS_PATH, localName);

    try {
      console.log(`Fetching: ${githubPath}`);

      // Use cached content if we already fetched this URL
      let content;
      if (fetched.has(url)) {
        content = fetched.get(url);
        console.log(`  (cached)`);
      } else {
        content = await fetch(url);
        fetched.set(url, content);
      }

      fs.writeFileSync(localPath, content);
      console.log(`  ✓ Saved to: ${localName}`);
      results.push({ name: localName, success: true });
    } catch (err) {
      console.log(`  ✗ Failed: ${err.message}`);
      results.push({ name: localName, success: false, error: err.message });
    }
  }

  console.log('\n--- Summary ---');
  const success = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✓ ${success} succeeded, ✗ ${failed} failed`);

  if (failed > 0) {
    console.log('\nFailed files:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
