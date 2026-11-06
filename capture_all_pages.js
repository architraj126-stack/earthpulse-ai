const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = "C:\\Users\\archi\\AppData\\Local\\Temp\\cdp_screenshot_temp";
const PORT = 9222;

const ROUTES = [
  { name: 'landing', path: '/' },
  { name: 'investigate', path: '/investigate' },
  { name: 'cases', path: '/cases' },
  { name: 'atlas', path: '/atlas' },
  { name: 'compare', path: '/compare' },
  { name: 'learn', path: '/learn' },
  { name: 'about', path: '/about' }
];

const OUTPUT_DIRS = [
  path.resolve(__dirname, 'screenshots'),
  "C:\\Users\\archi\\.gemini\\antigravity\\brain\\61bec88d-f207-4a7c-9145-6f65305d60a8\\screenshots"
];

for (const dir of OUTPUT_DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendCdpCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1000000);
    const msgHandler = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          ws.removeEventListener('message', msgHandler);
          if (data.error) reject(new Error(JSON.stringify(data.error)));
          else resolve(data.result);
        }
      } catch (e) {
        // ignore
      }
    };
    ws.addEventListener('message', msgHandler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function main() {
  console.log("Launching headless Chrome...");
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    '--window-size=1280,900',
    '--disable-gpu',
    '--no-sandbox'
  ]);

  await sleep(2500);

  try {
    const versionRes = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    const version = await versionRes.json();
    console.log("Connected to Chrome:", version.Browser);

    for (const route of ROUTES) {
      console.log(`Capturing screenshot for: ${route.name} (${route.path})...`);
      
      // PUT to /json/new in modern Chromium
      const newTabRes = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:5173${route.path}`, {
        method: 'PUT'
      });
      const newTab = await newTabRes.json();
      const wsUrl = newTab.webSocketDebuggerUrl;

      const ws = new WebSocket(wsUrl);
      await new Promise(res => ws.addEventListener('open', res));

      await sendCdpCommand(ws, 'Page.enable');
      await sendCdpCommand(ws, 'DOM.enable');
      await sendCdpCommand(ws, 'Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false
      });

      // Wait 3.5s for map tiles and charts to render
      await sleep(3500);

      const screenshotResult = await sendCdpCommand(ws, 'Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false
      });

      const buffer = Buffer.from(screenshotResult.data, 'base64');
      for (const dir of OUTPUT_DIRS) {
        const outPath = path.join(dir, `${route.name}.png`);
        fs.writeFileSync(outPath, buffer);
      }
      console.log(`Saved ${route.name}.png (${(buffer.length / 1024).toFixed(1)} KB)`);

      ws.close();
      // Close target tab
      await fetch(`http://127.0.0.1:${PORT}/json/close/${newTab.id}`, { method: 'PUT' }).catch(() => {});
    }

    console.log("All screenshots captured successfully!");
  } catch (err) {
    console.error("Screenshot capture failed:", err);
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

main();
