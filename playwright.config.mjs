import { defineConfig, devices } from '@playwright/test';

const liveBaseURL = process.env.LIVE_BASE_URL || null;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: liveBaseURL || 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  webServer: liveBaseURL
    ? undefined
    : {
        command: 'npm run preview -- --host 127.0.0.1 --port 4321',
        url: 'http://127.0.0.1:4321',
        reuseExistingServer: false,
        timeout: 30_000,
      },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
