import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve('scratch_screenshots/new_ui');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function captureUrl(url, outFileName, width = 1440, height = 900) {
  const tempDir = path.resolve(`C:\\Users\\HondG\\AppData\\Local\\Temp\\edge-test-${Date.now()}`);
  const proc = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9230',
    `--user-data-dir=${tempDir}`,
    '--disable-extensions',
    '--hide-scrollbars',
    '--disable-gpu',
    url,
  ]);

  await new Promise((r) => setTimeout(r, 1800));

  try {
    const res = await fetch('http://127.0.0.1:9230/json');
    const tabs = await res.json();
    const tab = tabs.find((t) => t.url.includes('localhost:3000'));
    if (!tab) throw new Error('Tab not found in /json: ' + JSON.stringify(tabs));

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let id = 1;
    const send = (m, p = {}) =>
      new Promise((resolve, reject) => {
        const curId = id++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method: m, params: p }));
      });

    await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 2, // HiDPI Retina quality
      mobile: false,
    });

    // Wait for images and layouts to settle
    await new Promise((r) => setTimeout(r, 2200));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.join(outDir, outFileName);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`✓ Saved ${outFileName} (${Math.round(shot.data.length / 1024)} KB)`);
  } finally {
    proc.kill();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

async function main() {
  console.log('Capturing screenshots of inside application...\n');
  await captureUrl('http://localhost:3000/?preview=workspace', 'workspace_overview_1440.png');
  await captureUrl('http://localhost:3000/?preview=workspace&ref=ref-hero-1', 'workspace_sidepanel_1440.png');
  await captureUrl('http://localhost:3000/?preview=workspace&palette=true', 'workspace_command_palette_1440.png');
  console.log('\nAll captures completed successfully!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
