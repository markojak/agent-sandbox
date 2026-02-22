import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.spec.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: [
        "lib/core/**/*.ts",
        "lib/server/auth-header.ts",
        "lib/server/food-entry-store.ts",
        "app/api/food-entries/**/*.ts",
        "app/api/trends/**/*.ts",
        "app/api/entries/**/*.ts",
        "app/api/favorites/**/*.ts",
        "app/api/recents/**/*.ts",
        "app/api/telemetry/**/*.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
