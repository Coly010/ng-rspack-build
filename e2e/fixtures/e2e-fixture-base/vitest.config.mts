import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/e2e-fixture-base/unit',
  plugins: [],
  resolve: {
    alias: {
      '@ng-rspack/testing-utils': resolve(__dirname, '../../testing/utils/src'),
    },
  },
  test: {
    watch: false,
    globals: true,
    passWithNoTests: true,
    environment: 'node',
    include: ['src/**/*.unit.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: '../../coverage/e2e-fixture-base/unit',
      exclude: ['mocks/**', '**/types.ts', '**/__snapshots__/**'],
    },
  },
});
