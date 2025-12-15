import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // The directory where tests are located.
  testDir: './tests',
  
  // Timeout for each test in milliseconds.
  timeout: 30 * 1000,
  
  // Global expect timeout
  expect: {
    timeout: 5000,
  },
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html',
  
  // Shared settings for all the projects below.
  use: {
    // Base URL to use in actions like `await page.goto('/')`.
    // We assume the React app runs locally on port 3000 during E2E testing.
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewport */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    // --- API Testing Project (For Phase 3) ---
    {
      name: 'API',
      testMatch: '**/api.spec.js',
      use: {
        // Assume API runs on 8080 (Spring Boot)
        baseURL: 'http://localhost:8080',
        // Important: Disable UI context for API tests
        browserName: 'chromium', 
        headless: true,
        viewport: null, // No need for viewport in API tests
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Command to start the React development server
    command: 'npm start', 
    url: 'http://localhost:3000',
    timeout: 120 * 1000, // Wait up to 120 seconds for the server to start
    reuseExistingServer: !process.env.CI, // Reuse server if not running in CI
  },
});