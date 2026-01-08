#!/usr/bin/env node
/**
 * Media Compression Script
 *
 * Creates medium and low quality versions of media files for bandwidth optimization.
 *
 * Usage:
 *   node scripts/compress-media.js <article-slug>
 *
 * Example:
 *   node scripts/compress-media.js visualizing-vector-fields-on-ar-glasses
 *
 * This will process all media in:
 *   public/assets/<article-slug>/
 *
 * And create:
 *   public/assets/<article-slug>/medium/  - Compressed MP4s, smaller GIFs, JPGs
 *   public/assets/<article-slug>/low/     - All videos as GIFs, heavily compressed images
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const MEDIUM_CONFIG = {
  gif: { width: 400, fps: 15, colors: 128, lossy: 100 },
  mp4: { height: 480, crf: 28 },
  image: { width: 600, quality: 80 },
};

const LOW_CONFIG = {
  gif: { width: 320, fps: 15, colors: 128, lossy: 120 },
  mp4ToGif: { width: 320, fps: 15, colors: 128, lossy: 120 },
  image: { width: 400, quality: 60 },
};

function run(cmd, options = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: options.silent ? 'pipe' : 'inherit', ...options });
  } catch (e) {
    if (!options.ignoreError) throw e;
    return null;
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getFiles(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => extensions.some(ext => f.toLowerCase().endsWith(ext)))
    .map(f => path.join(dir, f));
}

function compressGif(input, output, config) {
  const tempOutput = output + '.tmp';

  // Use ffmpeg to resize and optimize palette
  run(`ffmpeg -y -i "${input}" -vf "fps=${config.fps},scale=${config.width}:-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${config.colors}[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${tempOutput}"`, { silent: true });

  // Apply lossy compression with gifsicle
  run(`gifsicle -O3 --lossy=${config.lossy} "${tempOutput}" -o "${output}"`, { silent: true });

  // Clean up temp file
  if (fs.existsSync(tempOutput)) {
    fs.unlinkSync(tempOutput);
  }
}

function compressMp4(input, output, config) {
  run(`ffmpeg -y -i "${input}" -vf "scale=-2:${config.height}" -c:v libx264 -crf ${config.crf} -preset slow -c:a aac -b:a 128k "${output}"`, { silent: true });
}

function mp4ToGif(input, output, config) {
  const tempOutput = output + '.tmp';

  run(`ffmpeg -y -i "${input}" -vf "fps=${config.fps},scale=${config.width}:-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${config.colors}[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${tempOutput}"`, { silent: true });

  run(`gifsicle -O3 --lossy=${config.lossy} "${tempOutput}" -o "${output}"`, { silent: true });

  if (fs.existsSync(tempOutput)) {
    fs.unlinkSync(tempOutput);
  }
}

function compressImage(input, output, config) {
  // Convert PNG to JPG with compression
  run(`ffmpeg -y -i "${input}" -vf "scale='min(${config.width},iw)':-1" -q:v ${Math.round((100 - config.quality) / 10 + 2)} "${output}"`, { silent: true });
}

function generateMediaQualityMap(articleSlug, files) {
  const basePath = `/assets/${articleSlug}/`;

  const hasMedium = {};

  files.medium.forEach(f => {
    const rel = f.replace(basePath, '');
    hasMedium[rel] = true;
  });

  return `// Auto-generated media quality map for ${articleSlug}
// Add these entries to MediaQualityToggle.tsx HAS_MEDIUM object

const HAS_MEDIUM_${articleSlug.replace(/-/g, '_').toUpperCase()} = ${JSON.stringify(hasMedium, null, 2)};
`;
}

async function main() {
  const articleSlug = process.argv[2];

  if (!articleSlug) {
    console.error('Usage: node scripts/compress-media.js <article-slug>');
    console.error('Example: node scripts/compress-media.js visualizing-vector-fields-on-ar-glasses');
    process.exit(1);
  }

  const baseDir = path.join(process.cwd(), 'public/assets', articleSlug);

  if (!fs.existsSync(baseDir)) {
    console.error(`Directory not found: ${baseDir}`);
    process.exit(1);
  }

  const mediumDir = path.join(baseDir, 'medium');
  const lowDir = path.join(baseDir, 'low');

  // Find all subdirectories with media
  const subdirs = ['videos', 'captures', 'sprites', 'images', ''];

  const processedFiles = { medium: [], low: [] };

  for (const subdir of subdirs) {
    const srcDir = subdir ? path.join(baseDir, subdir) : baseDir;
    const mediumSubdir = subdir ? path.join(mediumDir, subdir) : mediumDir;
    const lowSubdir = subdir ? path.join(lowDir, subdir) : lowDir;

    if (!fs.existsSync(srcDir)) continue;

    // Process GIFs
    const gifs = getFiles(srcDir, ['.gif']);
    if (gifs.length > 0) {
      ensureDir(mediumSubdir);
      ensureDir(lowSubdir);

      for (const gif of gifs) {
        const name = path.basename(gif);
        console.log(`Processing GIF: ${name}`);

        // Medium quality
        const mediumOut = path.join(mediumSubdir, name);
        compressGif(gif, mediumOut, MEDIUM_CONFIG.gif);
        processedFiles.medium.push(path.join(subdir, name));

        // Low quality
        const lowOut = path.join(lowSubdir, name);
        compressGif(gif, lowOut, LOW_CONFIG.gif);
        processedFiles.low.push(path.join(subdir, name));
      }
    }

    // Process MP4s
    const mp4s = getFiles(srcDir, ['.mp4']);
    if (mp4s.length > 0) {
      ensureDir(mediumSubdir);
      ensureDir(lowSubdir);

      for (const mp4 of mp4s) {
        const name = path.basename(mp4);
        const nameNoExt = path.basename(mp4, '.mp4');
        console.log(`Processing MP4: ${name}`);

        // Medium quality (stays MP4)
        const mediumOut = path.join(mediumSubdir, name);
        compressMp4(mp4, mediumOut, MEDIUM_CONFIG.mp4);
        processedFiles.medium.push(path.join(subdir, name));

        // Low quality (convert to GIF)
        const lowOut = path.join(lowSubdir, nameNoExt + '.gif');
        mp4ToGif(mp4, lowOut, LOW_CONFIG.mp4ToGif);
        processedFiles.low.push(path.join(subdir, nameNoExt + '.gif'));
      }
    }

    // Process PNGs (convert to JPG)
    const pngs = getFiles(srcDir, ['.png']);
    if (pngs.length > 0) {
      ensureDir(mediumSubdir);
      ensureDir(lowSubdir);

      for (const png of pngs) {
        const name = path.basename(png);
        const nameNoExt = path.basename(png, '.png');
        console.log(`Processing PNG: ${name}`);

        // Medium quality JPG
        const mediumOut = path.join(mediumSubdir, nameNoExt + '.jpg');
        compressImage(png, mediumOut, MEDIUM_CONFIG.image);
        processedFiles.medium.push(path.join(subdir, name));

        // Low quality JPG
        const lowOut = path.join(lowSubdir, nameNoExt + '.jpg');
        compressImage(png, lowOut, LOW_CONFIG.image);
        processedFiles.low.push(path.join(subdir, nameNoExt + '.jpg'));
      }
    }
  }

  // Print summary
  console.log('\n--- Compression Complete ---');
  console.log(`Medium quality files: ${processedFiles.medium.length}`);
  console.log(`Low quality files: ${processedFiles.low.length}`);

  // Calculate sizes
  const getSize = (dir) => {
    try {
      const result = run(`du -sh "${dir}"`, { silent: true });
      return result.split('\t')[0].trim();
    } catch {
      return 'N/A';
    }
  };

  console.log(`\nSizes:`);
  console.log(`  Original: ${getSize(baseDir)}`);
  console.log(`  Medium:   ${getSize(mediumDir)}`);
  console.log(`  Low:      ${getSize(lowDir)}`);

  // Generate map file
  const mapContent = generateMediaQualityMap(articleSlug, processedFiles);
  const mapFile = path.join(baseDir, 'media-quality-map.js');
  fs.writeFileSync(mapFile, mapContent);
  console.log(`\nGenerated media map: ${mapFile}`);
  console.log('Copy the HAS_MEDIUM entries to MediaQualityToggle.tsx');
}

main().catch(console.error);
