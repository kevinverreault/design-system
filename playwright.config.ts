import { defineConfig, devices } from '@playwright/test';

const port = 4321;
// An explicit address: Firefox can resolve localhost to 127.0.0.1 while astro dev listens on ::1 only.
const host = '127.0.0.1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://${host}:${port}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // The installed Firefox over WebDriver BiDi, as Playwright's own Firefox build does not run everywhere.
    { name: 'firefox', use: { browserName: 'firefox', channel: 'moz-firefox' } },
  ],
  webServer: {
    command: `npm run dev -- --host ${host} --port ${port}`,
    url: `http://${host}:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
