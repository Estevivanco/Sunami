import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/testSetups/globalSetup.js"],
    testTimeout: 10000, // 10 seconds for database operations
    hookTimeout: 10000  // 10 seconds for setup/teardown hooks
  }
});
