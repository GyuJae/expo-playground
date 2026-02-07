import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    setupFiles: ["./src/setup.ts"],
    globalSetup: ["./src/__tests__/globalSetup.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/helpers/**"],
    fileParallelism: false,
  },
});
