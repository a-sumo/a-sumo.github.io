#!/usr/bin/env node
/**
 * Generate PDFs for all published blog articles using Playwright
 *
 * Usage:
 *   npm run build
 *   node scripts/generate-pdfs.js
 *
 * Or for a specific article:
 *   node scripts/generate-pdfs.js visualizing-vector-fields-on-ar-glasses
 *
 * The script expects the built site to be served at localhost:4321
 * or you can set the BASE_URL environment variable.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const OUTPUT_DIR = 'public/assets/pdfs';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function isDraft(mdxContent) {
  return /^draft:\s*true/m.test(mdxContent);
}

function getPublishedSlugs() {
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  const mdxFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx'));

  const slugs = [];
  for (const file of mdxFiles) {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
    if (!isDraft(content)) {
      slugs.push(file.replace('.mdx', ''));
    }
  }
  return slugs;
}

async function startPreviewServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting preview server...');

    const server = spawn('npm', ['run', 'preview'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    let started = false;

    const timeout = setTimeout(() => {
      if (!started) {
        server.kill();
        reject(new Error('Server startup timeout'));
      }
    }, 30000);

    server.stdout.on('data', data => {
      const output = data.toString();
      if (output.includes('localhost') || output.includes('4321')) {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          // Give it a moment to fully start
          setTimeout(() => resolve(server), 2000);
        }
      }
    });

    server.stderr.on('data', data => {
      console.error('Server error:', data.toString());
    });

    server.on('error', err => {
      clearTimeout(timeout);
      reject(err);
    });

    server.on('close', code => {
      if (!started) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

async function generatePDF(browser, slug) {
  const page = await browser.newPage();

  try {
    const url = `${BASE_URL}/posts/${slug}/pdf/`;
    console.log(`  Loading: ${url}`);

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });

    // Wait for the PDF transformation to complete
    await page.waitForFunction(() => window.pdfTransformComplete === true, {
      timeout: 60000,
    }).catch(() => {
      console.log('  Warning: PDF transform may not have completed');
    });

    // Debug: check what elements exist
    const debugInfo = await page.evaluate(() => {
      const videos = document.querySelectorAll('video');
      const frameStrips = document.querySelectorAll('.frame-strip');
      const visibleStrips = document.querySelectorAll('.frame-strip[style*="block"]');
      return {
        videoCount: videos.length,
        frameStripCount: frameStrips.length,
        visibleStripCount: visibleStrips.length,
        transformComplete: window.pdfTransformComplete
      };
    });
    console.log('  Debug:', JSON.stringify(debugInfo));

    // Give extra time for images
    await page.waitForTimeout(3000);

    // Generate PDF
    const pdfPath = path.join(OUTPUT_DIR, `${slug}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 9px; text-align: center; width: 100%; color: #888;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
    });

    const stats = fs.statSync(pdfPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  Generated: ${pdfPath} (${sizeMB} MB)`);

    return pdfPath;
  } catch (error) {
    console.error(`  Error generating PDF for ${slug}:`, error.message);
    return null;
  } finally {
    await page.close();
  }
}

async function main() {
  const specificSlug = process.argv[2];
  const skipServer = process.argv.includes('--no-server');

  // Ensure output directory exists
  ensureDir(OUTPUT_DIR);

  // Get slugs to process
  let slugs;
  if (specificSlug && specificSlug !== '--no-server') {
    slugs = [specificSlug];
  } else {
    slugs = getPublishedSlugs();
  }

  if (slugs.length === 0) {
    console.log('No published articles found');
    return;
  }

  console.log(`Will generate PDFs for ${slugs.length} article(s):`);
  slugs.forEach(s => console.log(`  - ${s}`));

  // Start preview server if needed
  let server = null;
  if (!skipServer) {
    try {
      server = await startPreviewServer();
      console.log('Preview server started');
    } catch (error) {
      console.error('Failed to start preview server:', error.message);
      console.log('Trying to connect to existing server...');
    }
  }

  // Launch browser
  console.log('\nLaunching browser...');
  const browser = await chromium.launch({
    headless: true,
  });

  const results = {
    success: [],
    failed: [],
  };

  try {
    for (const slug of slugs) {
      console.log(`\nProcessing: ${slug}`);
      const pdfPath = await generatePDF(browser, slug);
      if (pdfPath) {
        results.success.push(slug);
      } else {
        results.failed.push(slug);
      }
    }
  } finally {
    await browser.close();

    if (server) {
      console.log('\nStopping preview server...');
      server.kill();
    }
  }

  // Summary
  console.log('\n--- Summary ---');
  console.log(`Success: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('Failed articles:');
    results.failed.forEach(s => console.log(`  - ${s}`));
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
