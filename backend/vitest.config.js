import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup/globalSetup.js"],
    testTimeout: 15000, // 15 seconds for database operations
    hookTimeout: 15000, // 15 seconds for setup/teardown hooks
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.js',
        '**/*.config.js'
      ]
    }
  }
});
