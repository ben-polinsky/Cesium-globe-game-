import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npx http-server -p 8080 -c-1',
    port: 8080,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:8080'
  }
});
