#!/usr/bin/env node
/**
 * Extract frames from article videos for PDF generation
 * Uses timestamps from pdf-frame-config.json
 *
 * Usage:
 *   node scripts/extract-video-frames.js [article-slug]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'pdf-frame-config.json');
const OUTPUT_DIR = 'public/assets/pdf-frames';

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', ...options });
  } catch (e) {
    if (!options.ignoreError) {
      console.error(`Command failed: ${cmd}`);
      console.error(e.message);
    }
    return null;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function extractFrameAtTimestamp(videoPath, timestamp, outputPath) {
  const result = run(
    `ffmpeg -y -ss ${timestamp} -i "${videoPath}" -vframes 1 -q:v 2 "${outputPath}"`,
    { ignoreError: true }
  );
  return result !== null && fs.existsSync(outputPath);
}

function processArticle(slug, config) {
  console.log(`\nProcessing: ${slug}`);

  const articleConfig = config[slug];
  if (!articleConfig) {
    console.log(`  No config found for ${slug}`);
    return null;
  }

  const frameDir = path.join(OUTPUT_DIR, slug);
  ensureDir(frameDir);

  const manifest = {
    slug,
    videos: [],
    manimGifs: [],
  };

  // Process videos
  const videos = articleConfig.videos || {};
  for (const [src, videoConfig] of Object.entries(videos)) {
    if (videoConfig.remove) {
      console.log(`  Skipping (marked for removal): ${path.basename(src)}`);
      continue;
    }

    const videoPath = path.join(process.cwd(), 'public', src);
    if (!fs.existsSync(videoPath)) {
      console.log(`  Video not found: ${src}`);
      continue;
    }

    const baseName = path.basename(src, path.extname(src));
    const timestamps = videoConfig.timestamps || [];

    console.log(`  Extracting ${timestamps.length} frames from: ${baseName}`);

    const frames = [];
    timestamps.forEach((timestamp, index) => {
      const outputPath = path.join(frameDir, `${baseName}_frame_${index + 1}.jpg`);
      const success = extractFrameAtTimestamp(videoPath, timestamp, outputPath);

      if (success) {
        frames.push({
          path: `/assets/pdf-frames/${slug}/${baseName}_frame_${index + 1}.jpg`,
          timestamp: `${timestamp}s`,
        });
      }
    });

    if (frames.length > 0) {
      manifest.videos.push({
        src,
        baseName,
        caption: videoConfig.caption || '',
        frames,
      });
    }
  }

  // Process Manim GIFs (extract from source video)
  const manimGifs = articleConfig.manimGifs || {};
  for (const [gifSrc, gifConfig] of Object.entries(manimGifs)) {
    const sourceVideo = gifConfig.sourceVideo;
    if (!sourceVideo) {
      console.log(`  No source video for: ${path.basename(gifSrc)}`);
      continue;
    }

    const videoPath = path.join(process.cwd(), 'public', sourceVideo);
    if (!fs.existsSync(videoPath)) {
      console.log(`  Source video not found: ${sourceVideo}`);
      continue;
    }

    const baseName = path.basename(gifSrc, '.gif');
    const timestamps = gifConfig.timestamps || [];

    console.log(`  Extracting ${timestamps.length} frames from Manim source: ${baseName}`);

    const frames = [];
    timestamps.forEach((timestamp, index) => {
      const outputPath = path.join(frameDir, `${baseName}_frame_${index + 1}.jpg`);
      const success = extractFrameAtTimestamp(videoPath, timestamp, outputPath);

      if (success) {
        frames.push({
          path: `/assets/pdf-frames/${slug}/${baseName}_frame_${index + 1}.jpg`,
          timestamp: `${timestamp}s`,
        });
      }
    });

    if (frames.length > 0) {
      manifest.manimGifs.push({
        src: gifSrc,
        baseName,
        caption: gifConfig.caption || '',
        frames,
      });
    }
  }

  // Write manifest
  const manifestPath = path.join(frameDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  Manifest written: ${manifestPath}`);

  return manifest;
}

async function main() {
  // Load config
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Config file not found: ${CONFIG_PATH}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const specificSlug = process.argv[2];

  if (specificSlug) {
    processArticle(specificSlug, config);
  } else {
    // Process all articles in config
    const manifests = [];
    for (const slug of Object.keys(config)) {
      const manifest = processArticle(slug, config);
      if (manifest) {
        manifests.push(manifest);
      }
    }

    // Write combined manifest
    const combinedPath = path.join(OUTPUT_DIR, 'all-manifests.json');
    ensureDir(OUTPUT_DIR);
    fs.writeFileSync(combinedPath, JSON.stringify(manifests, null, 2));
    console.log(`\nCombined manifest written: ${combinedPath}`);

    // Summary
    console.log('\n=== Summary ===');
    console.log(`Processed ${manifests.length} articles`);
    let totalVideos = 0, totalGifs = 0, totalFrames = 0;
    for (const m of manifests) {
      totalVideos += m.videos.length;
      totalGifs += m.manimGifs.length;
      for (const v of m.videos) totalFrames += v.frames.length;
      for (const g of m.manimGifs) totalFrames += g.frames.length;
    }
    console.log(`Total videos: ${totalVideos}`);
    console.log(`Total Manim GIFs: ${totalGifs}`);
    console.log(`Total frames extracted: ${totalFrames}`);
  }
}

main().catch(console.error);
