#!/usr/bin/env node
/**
 * Generate corporate OG images as crisp SVG → PNG via resvg.
 * Run: node scripts/generate-og-assets.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsDir = join(__dirname, '..', 'docs');

const palette = {
  bgTop: '#0B1220',
  bgBottom: '#111827',
  accent: '#3B82F6',
  accentSoft: '#1D4ED8',
  text: '#F8FAFC',
  muted: '#94A3B8',
  subtle: '#64748B',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  dot: 'rgba(59,130,246,0.35)',
};

function iconSearch(x, y, size, color) {
  const s = size;
  return `
    <g transform="translate(${x},${y})" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="${s * 0.42}" cy="${s * 0.42}" r="${s * 0.28}"/>
      <line x1="${s * 0.62}" y1="${s * 0.62}" x2="${s * 0.82}" y2="${s * 0.82}"/>
    </g>`;
}

function iconDownload(x, y, size, color) {
  const s = size;
  return `
    <g transform="translate(${x},${y})" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${s * 0.5} ${s * 0.18} L${s * 0.5} ${s * 0.62}"/>
      <polyline points="${s * 0.35},${s * 0.5} ${s * 0.5},${s * 0.68} ${s * 0.65},${s * 0.5}"/>
      <path d="M${s * 0.22} ${s * 0.78} L${s * 0.78} ${s * 0.78}"/>
    </g>`;
}

function iconPalette(x, y, size, color) {
  const s = size;
  return `
    <g transform="translate(${x},${y})" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${s * 0.5} ${s * 0.15} C${s * 0.25} ${s * 0.15} ${s * 0.12} ${s * 0.35} ${s * 0.12} ${s * 0.55} C${s * 0.12} ${s * 0.72} ${s * 0.28} ${s * 0.82} ${s * 0.42} ${s * 0.82} C${s * 0.48} ${s * 0.82} ${s * 0.5} ${s * 0.78} ${s * 0.5} ${s * 0.72} C${s * 0.5} ${s * 0.66} ${s * 0.54} ${s * 0.62} ${s * 0.6} ${s * 0.62} C${s * 0.78} ${s * 0.62} ${s * 0.88} ${s * 0.48} ${s * 0.88} ${s * 0.32} C${s * 0.88} ${s * 0.2} ${s * 0.7} ${s * 0.15} ${s * 0.5} ${s * 0.15} Z"/>
      <circle cx="${s * 0.32}" cy="${s * 0.38}" r="${s * 0.05}" fill="${color}" stroke="none"/>
      <circle cx="${s * 0.48}" cy="${s * 0.3}" r="${s * 0.05}" fill="${color}" stroke="none"/>
      <circle cx="${s * 0.64}" cy="${s * 0.38}" r="${s * 0.05}" fill="${color}" stroke="none"/>
    </g>`;
}

function iconGrid(x, y, size, color) {
  const s = size;
  const g = s * 0.22;
  const o = s * 0.18;
  let rects = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const rx = o + col * (g + s * 0.08);
      const ry = o + row * (g + s * 0.08);
      rects += `<rect x="${rx}" y="${ry}" width="${g}" height="${g}" rx="4" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.7"/>`;
    }
  }
  return `<g transform="translate(${x},${y})">${rects}</g>`;
}

function sharedDefs() {
  return `
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bgTop}"/>
        <stop offset="100%" stop-color="${palette.bgBottom}"/>
      </linearGradient>
      <radialGradient id="glow" cx="85%" cy="15%" r="55%">
        <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${palette.accent}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${palette.accent}"/>
        <stop offset="100%" stop-color="${palette.accentSoft}" stop-opacity="0.2"/>
      </linearGradient>
    </defs>`;
}

function githubSvg() {
  const w = 1280;
  const h = 640;
  const icons = [
  [80, 200, iconSearch],
  [200, 200, iconDownload],
  [320, 200, iconPalette],
  [80, 320, iconGrid],
  [200, 320, iconSearch],
  [320, 320, iconDownload],
  ].map(([x, y, fn]) => fn(x, y, 72, palette.accent)).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${sharedDefs()}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>

  <!-- left panel -->
  <rect x="48" y="48" width="400" height="544" rx="16" fill="${palette.card}" stroke="${palette.cardBorder}"/>
  ${icons}

  <!-- accent rule -->
  <rect x="520" y="248" width="64" height="4" rx="2" fill="url(#accentLine)"/>

  <!-- typography -->
  <text x="520" y="220" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="56" font-weight="700" fill="${palette.text}" letter-spacing="-1">Noun MCP Server</text>
  <text x="520" y="290" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="28" font-weight="400" fill="${palette.muted}">Search &amp; download icons in Cursor &amp; Claude</text>

  <!-- badge -->
  <rect x="520" y="330" width="88" height="36" rx="18" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.35)"/>
  <text x="564" y="354" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="${palette.accent}" letter-spacing="1.5">MCP</text>

  <!-- footer -->
  <text x="1232" y="592" text-anchor="end" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="18" font-weight="400" fill="${palette.subtle}">by Ali Sait Teke</text>
</svg>`;
}

function linkedinSvg() {
  const w = 1200;
  const h = 627;

  const bullets = [
    '7 MCP tools for icon search and download',
    'OAuth 1.0a API client with rate limiting',
    'FREE-tier cost optimizer (5K calls/mo)',
  ];

  const bulletMarkup = bullets.map((text, i) => {
    const y = 300 + i * 52;
    return `
      <circle cx="500" cy="${y - 6}" r="4" fill="${palette.accent}"/>
      <text x="524" y="${y}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="22" font-weight="400" fill="${palette.muted}">${text}</text>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${sharedDefs()}
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>

  <!-- left decorative panel -->
  <rect x="48" y="48" width="360" height="531" rx="16" fill="${palette.card}" stroke="${palette.cardBorder}"/>
  ${iconGrid(108, 140, 240, palette.accent)}
  ${iconSearch(168, 360, 96, palette.muted)}
  ${iconDownload(288, 360, 96, palette.muted)}

  <!-- vertical divider -->
  <line x1="448" y1="120" x2="448" y2="507" stroke="${palette.cardBorder}" stroke-width="1"/>

  <!-- headline -->
  <text x="500" y="180" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="42" font-weight="700" fill="${palette.text}" letter-spacing="-0.5">Built for the AI</text>
  <text x="500" y="232" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="42" font-weight="700" fill="${palette.text}" letter-spacing="-0.5">Developer Workflow</text>
  <rect x="500" y="252" width="56" height="3" rx="1.5" fill="${palette.accent}"/>

  ${bulletMarkup}

  <!-- footer bar -->
  <rect x="0" y="555" width="${w}" height="72" fill="rgba(0,0,0,0.25)"/>
  <text x="600" y="600" text-anchor="middle" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="17" font-weight="500" fill="${palette.subtle}">alisait.com  ·  @alisaitteke</text>
</svg>`;
}

mkdirSync(docsDir, { recursive: true });

const githubSvgPath = join(docsDir, 'og-github.svg');
const linkedinSvgPath = join(docsDir, 'og-linkedin.svg');

writeFileSync(githubSvgPath, githubSvg());
writeFileSync(linkedinSvgPath, linkedinSvg());

console.log('Wrote SVG sources:', githubSvgPath, linkedinSvgPath);

// Dynamic import resvg after writing SVGs
const { Resvg } = await import('@resvg/resvg-js');
const { readFileSync } = await import('fs');

for (const [svgPath, pngPath, width] of [
  [githubSvgPath, join(docsDir, 'og-github.png'), 1280],
  [linkedinSvgPath, join(docsDir, 'og-linkedin.png'), 1200],
]) {
  const svg = readFileSync(svgPath, 'utf8');
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: {
      fontFamily: 'Inter',
      defaultFontFamily: 'Inter',
    },
  });
  const pngData = resvg.render();
  writeFileSync(pngPath, pngData.asPng());
  console.log('Wrote', pngPath, `(${pngData.width}x${pngData.height})`);
}
