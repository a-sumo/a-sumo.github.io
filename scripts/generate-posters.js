#!/usr/bin/env node
/**
 * Generate poster images (first frame) from MP4 videos
 * Saves as [videoname]-poster.jpg next to the video
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const VIDEO_DIRS = [
  'public/assets/visualizing-vector-fields-on-ar-glasses/videos',
  'public/assets/visualizing-color-spaces-in-ar-glasses/videos',
  'public/assets/visualizing-color-spaces-in-ar-glasses',
];

function extractPoster(videoPath) {
  const dir = path.dirname(videoPath);
  const baseName = path.basename(videoPath, path.extname(videoPath));
  const posterPath = path.join(dir, `${baseName}-poster.jpg`);

  if (fs.existsSync(posterPath)) {
    console.log(`  Skipping (exists): ${posterPath}`);
    return;
  }

  try {
    execSync(`ffmpeg -y -i "${videoPath}" -vframes 1 -q:v 2 "${posterPath}"`, {
      stdio: 'pipe'
    });
    console.log(`  Created: ${posterPath}`);
  } catch (e) {
    console.error(`  Failed: ${videoPath}`);
  }
}

function main() {
  for (const dir of VIDEO_DIRS) {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) {
      console.log(`Directory not found: ${dir}`);
      continue;
    }

    console.log(`\nProcessing: ${dir}`);

    const files = fs.readdirSync(fullDir);
    const mp4Files = files.filter(f => f.endsWith('.mp4') || f.endsWith('.MP4'));

    for (const file of mp4Files) {
      extractPoster(path.join(fullDir, file));
    }
  }

  console.log('\nDone!');
}

main();
