import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve('public/brand/hero-variations');
const tempHtmlDir = path.resolve('scripts/temp_templates');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(tempHtmlDir)) fs.mkdirSync(tempHtmlDir, { recursive: true });

// Convert images to base64 data URLs
function getBase64(relPath, mimeType = 'image/jpeg') {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return '';
  }
  const data = fs.readFileSync(fullPath).toString('base64');
  return `data:${mimeType};base64,${data}`;
}

const IMGS = {
  linear: getBase64('brand-assets/04-image-assets/digital-references/digital-interface-grid-01.jpg'),
  designSystem: getBase64('brand-assets/04-image-assets/digital-references/digital-design-system-spec-02.jpg'),
  architecture: getBase64('brand-assets/04-image-assets/editorial-references/editorial-architecture-01.jpg'),
  typography: getBase64('brand-assets/04-image-assets/editorial-references/editorial-typography-print-02.jpg'),
  hybrid: getBase64('brand-assets/04-image-assets/hybrid-compositions/hybrid-studio-still-01.jpg'),
  texture: getBase64('brand-assets/04-image-assets/auxiliary-graphics/og-background-texture-1200x630.jpg'),
};

console.log('Images loaded into memory:');
for (const [k, v] of Object.entries(IMGS)) {
  console.log(` - ${k}: ${Math.round(v.length / 1024)} KB`);
}
