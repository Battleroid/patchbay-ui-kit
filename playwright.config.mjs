import { defineConfig } from '@playwright/test';

// PB_PORT picks the port (default 4173); tests/serve.mjs is a dependency-free Node static server, so no Python is needed.
const port = Number(process.env.PB_PORT || 4173);

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  use: { baseURL: `http://127.0.0.1:${port}`, viewport: { width: 1280, height: 900 }, launchOptions: { args: ['--mute-audio'] } },
  webServer: { command: 'node tests/serve.mjs', port, env: { PB_PORT: String(port) }, reuseExistingServer: true },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
