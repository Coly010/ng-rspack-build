import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/testing-vitest-setup/unit',
  root: __dirname,
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: '../../coverage/testing-vitest-setup/unit',
      exclude: ['mocks/**', '**/types.ts', '**/__snapshots__/**'],
    },
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.unit.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    passWithNoTests: true,
    testTimeout: 25_000,
  },
});
