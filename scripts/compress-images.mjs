import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import { join } from "path";

const BOOKS_DIR = "./public/assets/books";
const QUALITY = 80; // Adjust 1-100 (lower = smaller file, less quality)
const MAX_WIDTH = 400; // Book covers don't need to be huge

async function compressImages() {
  const files = await readdir(BOOKS_DIR);

  for (const file of files) {
    if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;

    const filePath = join(BOOKS_DIR, file);
    const before = (await stat(filePath)).size;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Resize if wider than MAX_WIDTH, preserving aspect ratio
    if (metadata.width > MAX_WIDTH) {
      image.resize(MAX_WIDTH);
    }

    // Compress based on format
    if (file.endsWith(".png")) {
      await image.png({ quality: QUALITY, compressionLevel: 9 }).toFile(filePath + ".tmp");
    } else {
      await image.jpeg({ quality: QUALITY, mozjpeg: true }).toFile(filePath + ".tmp");
    }

    // Replace original with compressed version
    const { rename } = await import("fs/promises");
    await rename(filePath + ".tmp", filePath);

    const after = (await stat(filePath)).size;
    const saved = ((1 - after / before) * 100).toFixed(1);
    console.log(`${file}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (${saved}% smaller)`);
  }
}

compressImages().catch(console.error);
